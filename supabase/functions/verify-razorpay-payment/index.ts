import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyPaymentBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_uuid: string;
  user_id: string;
  amount: number;
  method?: string;
}

/* -------------------------------------------------------
   SHIPROCKET LOGIN
------------------------------------------------------- */

async function shiprocketLogin(): Promise<string | null> {
  const email = Deno.env.get("SHIPROCKET_EMAIL");
  const password = Deno.env.get("SHIPROCKET_PASSWORD");

  if (!email || !password) return null;

  const res = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  const data = await res.json();

  if (!res.ok || !data.token) {
    return null;
  }

  return data.token as string;
}

/* -------------------------------------------------------
   CREATE SHIPROCKET ORDER
------------------------------------------------------- */

async function createShiprocketOrder(
  supabase: ReturnType<typeof createClient>,
  orderId: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return {
      success: false,
      error: "Order not found",
    };
  }

  /* Check whether shipment already exists */
  const { data: existingShip } = await supabase
    .from("shipments")
    .select("id, shiprocket_order_id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existingShip?.shiprocket_order_id) {
    return {
      success: true,
      data: {
        already_created: true,
        shipment_id: existingShip.id,
      },
    };
  }

  const addr = order.address as Record<string, string> | null;

  if (!addr || !addr.pincode) {
    return {
      success: false,
      error: "Delivery address or pincode missing",
    };
  }

  const token = await shiprocketLogin();

  if (!token) {
    return {
      success: false,
      error: "Shiprocket credentials not configured",
    };
  }

  const items = (order.order_items ?? []).map((item: any) => ({
    name: item.name,
    sku: String(item.product_id ?? `MCT-${item.id}`),
    units: item.quantity,
    selling_price: Number(item.price),
    discount: 0,
    tax: 0,
    hsn: 0,
  }));

  const shiprocketPayload = {
    order_id: order.order_number,
    order_date: new Date(order.created_at)
      .toISOString()
      .slice(0, 10),

    pickup_location: "Primary",
    channel_id: "",
    comment: "MICCROTEN order",

    billing_customer_name: addr.full_name ?? "Customer",
    billing_last_name: "",
    billing_address: addr.line1 ?? "",
    billing_address_2: addr.line2 ?? "",
    billing_city: addr.city ?? "",
    billing_pincode: addr.pincode ?? "",
    billing_state: addr.state ?? "",
    billing_country: addr.country ?? "India",
    billing_email: "",
    billing_phone: addr.phone ?? "",

    shipping_is_billing: true,

    shipping_customer_name: addr.full_name ?? "Customer",
    shipping_last_name: "",
    shipping_address: addr.line1 ?? "",
    shipping_address_2: addr.line2 ?? "",
    shipping_city: addr.city ?? "",
    shipping_pincode: addr.pincode ?? "",
    shipping_state: addr.state ?? "",
    shipping_country: addr.country ?? "India",
    shipping_email: "",
    shipping_phone: addr.phone ?? "",

    order_items: items,

    payment_method: "Prepaid",

    shipping_charges: Number(order.shipping) || 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: Number(order.discount) || 0,
    sub_total: Number(order.subtotal) || 0,

    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5,
  };

  const createRes = await fetch(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(shiprocketPayload),
    },
  );

  const createData = await createRes.json();

  if (!createRes.ok) {
    return {
      success: false,
      error:
        createData?.message ||
        "Shiprocket order creation failed",
    };
  }

  /* Extract Shiprocket response */
  const shiprocketOrderId = String(
    createData.order_id ?? "",
  );

  const shipmentId = String(
    createData.shipment_id ?? "",
  );

  const awbCode = createData.awb_code ?? null;
  const courierCompanyId =
    createData.courier_company_id ?? null;
  const courierName =
    createData.courier_name ?? null;

  const estDelivery = new Date();
  estDelivery.setDate(estDelivery.getDate() + 7);

  /* Update existing shipment */
  if (existingShip) {
    await supabase
      .from("shipments")
      .update({
        shiprocket_order_id: shiprocketOrderId,
        shipment_id: shipmentId,
        awb_code: awbCode,
        courier_company_id: courierCompanyId,
        courier_name: courierName,
        tracking_number: awbCode,
        courier: courierName,
        shipment_status: "created",
        estimated_delivery:
          estDelivery.toISOString().slice(0, 10),
      })
      .eq("id", existingShip.id);
  } else {
    /* Create shipment */
    await supabase.from("shipments").insert({
      order_id: orderId,
      user_id: order.user_id,

      shiprocket_order_id: shiprocketOrderId,
      shipment_id: shipmentId,

      awb_code: awbCode,
      courier_company_id: courierCompanyId,
      courier_name: courierName,

      tracking_number: awbCode,
      courier: courierName,

      tracking_url: awbCode
        ? `https://www.shiprocket.in/tracking/${awbCode}`
        : null,

      shipment_status: "created",

      estimated_delivery:
        estDelivery.toISOString().slice(0, 10),
    });
  }

  /* Update order with shipment information */
  await supabase
    .from("orders")
    .update({
      shiprocket_order_id: shiprocketOrderId,
      courier: courierName,
      tracking_number: awbCode,
      shipment_status: "created",
      estimated_delivery:
        estDelivery.toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  return {
    success: true,
    data: createData,
  };
}

/* -------------------------------------------------------
   BACKGROUND ORDER PROCESSING
------------------------------------------------------- */

async function processOrderAfterPayment(
  supabase: ReturnType<typeof createClient>,
  order_uuid: string,
  user_id: string,
  amount: number,
) {
  try {
    /* ---------------------------------------------
       Create pending shipment record
    --------------------------------------------- */

    const estDelivery = new Date();

    estDelivery.setDate(
      estDelivery.getDate() + 7,
    );

    const { data: existingShip } = await supabase
      .from("shipments")
      .select("id")
      .eq("order_id", order_uuid)
      .maybeSingle();

    if (!existingShip) {
      await supabase.from("shipments").insert({
        order_id: order_uuid,
        user_id,
        courier: null,
        tracking_number: null,
        shipment_status: "pending",
        estimated_delivery:
          estDelivery.toISOString().slice(0, 10),
      });
    }

    /* ---------------------------------------------
       Shiprocket
    --------------------------------------------- */

    try {
      await createShiprocketOrder(
        supabase,
        order_uuid,
      );
    } catch (error) {
      console.error(
        "Shiprocket processing error:",
        error,
      );
    }

    /* ---------------------------------------------
       Notification
    --------------------------------------------- */

    try {
      await supabase.from("notifications").insert({
        user_id,
        type: "payment_success",
        title: "Payment Successful",
        body: `Your payment of ₹${amount} has been confirmed. Order ${order_uuid.slice(
          0,
          8,
        )} is now being processed.`,
      });
    } catch (error) {
      console.error(
        "Notification error:",
        error,
      );
    }

    /* ---------------------------------------------
       Tracking events
    --------------------------------------------- */

    try {
      const now = new Date().toISOString();

      await supabase
        .from("order_tracking_events")
        .insert([
          {
            order_id: order_uuid,
            status: "order_placed",
            activity:
              "Order placed successfully",
            event_timestamp: now,
          },
          {
            order_id: order_uuid,
            status: "payment_confirmed",
            activity:
              "Payment confirmed via Razorpay",
            event_timestamp: now,
          },
        ]);
    } catch (error) {
      console.error(
        "Tracking event error:",
        error,
      );
    }
  } catch (error) {
    console.error(
      "Background order processing error:",
      error,
    );
  }
}

/* -------------------------------------------------------
   VERIFY PAYMENT
------------------------------------------------------- */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: VerifyPaymentBody =
      await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_uuid,
      user_id,
      amount,
      method,
    } = body;

    /* ---------------------------------------------
       Validate request
    --------------------------------------------- */

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !order_uuid ||
      !user_id
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required payment verification fields",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    /* ---------------------------------------------
       Razorpay secret
    --------------------------------------------- */

    const keySecret = Deno.env.get(
      "RAZORPAY_KEY_SECRET",
    );

    if (!keySecret) {
      return new Response(
        JSON.stringify({
          error:
            "Razorpay secret is not configured",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    /* ---------------------------------------------
       Verify Razorpay signature
    --------------------------------------------- */

    const expectedSignature = createHmac(
      "sha256",
      keySecret,
    )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`,
      )
      .digest("hex");

    const isValid =
      expectedSignature ===
      razorpay_signature;

    /* ---------------------------------------------
       Supabase service client
    --------------------------------------------- */

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL")!;

    const serviceRoleKey =
      Deno.env.get(
        "SUPABASE_SERVICE_ROLE_KEY",
      )!;

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    /* ---------------------------------------------
       Invalid payment
    --------------------------------------------- */

    if (!isValid) {
      await supabase
        .from("payments")
        .insert({
          order_id: order_uuid,
          user_id,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          amount,
          currency: "INR",
          status: "failed",
          method: method || null,
        });

      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          payment_created_at:
            new Date().toISOString(),
        })
        .eq("id", order_uuid);

      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Payment signature verification failed",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    /* ---------------------------------------------
       Idempotency check
    --------------------------------------------- */

    const { data: existingPayment } =
      await supabase
        .from("payments")
        .select("id, status")
        .eq(
          "razorpay_payment_id",
          razorpay_payment_id,
        )
        .maybeSingle();

    if (
      existingPayment &&
      existingPayment.status === "paid"
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          message:
            "Payment already verified",
          duplicate: true,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    /* ---------------------------------------------
       Save payment
    --------------------------------------------- */

    if (existingPayment) {
      await supabase
        .from("payments")
        .update({
          status: "paid",
          razorpay_signature,
          method: method || null,
        })
        .eq(
          "id",
          existingPayment.id,
        );
    } else {
      await supabase
        .from("payments")
        .insert({
          order_id: order_uuid,
          user_id,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          amount,
          currency: "INR",
          status: "paid",
          method: method || null,
        });
    }

    /* ---------------------------------------------
       IMPORTANT:
       Mark order PAID
    --------------------------------------------- */

    const { error: orderUpdateError } =
      await supabase
        .from("orders")
        .update({
          status: "confirmed",
          payment_status: "paid",
          payment_method: "razorpay",

          payment_id:
            razorpay_payment_id,

          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,

          payment_created_at:
            new Date().toISOString(),

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", order_uuid);

    if (orderUpdateError) {
      console.error(
        "Order update error:",
        orderUpdateError,
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Payment verified, but order could not be updated",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );
    }

    /* ---------------------------------------------
       PAYMENT SUCCESS
       
       IMPORTANT:
       Return success NOW.
       
       Do NOT wait for Shiprocket.
    --------------------------------------------- */

    const successResponse =
      new Response(
        JSON.stringify({
          success: true,
          message:
            "Payment verified and order confirmed",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        },
      );

    /* ---------------------------------------------
       Continue additional processing after
       payment has been confirmed.

       This does NOT affect payment success.
    --------------------------------------------- */

    EdgeRuntime.waitUntil(
      processOrderAfterPayment(
        supabase,
        order_uuid,
        user_id,
        amount,
      ),
    );

    return successResponse;
  } catch (error) {
    console.error(
      "Payment verification error:",
      error,
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      },
    );
  }
});
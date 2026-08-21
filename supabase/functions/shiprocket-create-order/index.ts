import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

async function shiprocketLogin(): Promise<string | null> {
  const email = Deno.env.get("SHIPROCKET_EMAIL");
  const password = Deno.env.get("SHIPROCKET_PASSWORD");
  if (!email || !password) return null;

  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.token) return null;
  return data.token as string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "POST method required" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // order_id here is YOUR internal order UUID (orders.id)
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ success: false, error: "order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Load the order + items from your DB
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .maybeSingle();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const address = order.address as Record<string, any>;
    if (!address) {
      return new Response(
        JSON.stringify({ success: false, error: "Order has no delivery address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate + clean phone number up front, with a clear error if it's bad
    const cleanedPhone = String(address.phone ?? "").replace(/\D/g, "").slice(-10);
    if (cleanedPhone.length !== 10) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid or missing phone number on order address: "${address.phone}"`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const originPincode = Deno.env.get("ORIGIN_PINCODE");
    if (!originPincode) {
      return new Response(
        JSON.stringify({ success: false, error: "ORIGIN_PINCODE is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Authenticate with Shiprocket
    const token = await shiprocketLogin();
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Shiprocket credentials are not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Build the order-items payload for Shiprocket
    const items = (order.order_items ?? []).map((it: any) => ({
      name: it.name,
      sku: String(it.product_id ?? it.id),
      units: it.quantity,
      selling_price: it.price,
    }));

    const totalWeight = (order.order_items ?? []).reduce(
      (sum: number, it: any) => sum + (Number(it.weight_kg) || 0.5) * it.quantity,
      0
    ) || 0.5;

    // 4. Book the order with Shiprocket (adhoc order creation)
    const shiprocketPayload = {
      order_id: order.order_number,           // your human-readable order number
      order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
      pickup_location: "warehouse",            // must match the nickname in Shiprocket > Pickup Addresses
      billing_customer_name: address.full_name,
      billing_last_name: "",
      billing_address: address.line1 + (address.line2 ? `, ${address.line2}` : ""),
      billing_city: address.city,
      billing_pincode: address.pincode,
      billing_state: address.state,
      billing_country: "India",
      billing_email: "", // fill from user email if you pass it in
      billing_phone: cleanedPhone,
      shipping_is_billing: true,
      order_items: items,
      payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
      sub_total: order.subtotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: totalWeight,
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
      }
    );

    const createData = await createRes.json();

    if (!createRes.ok) {
      return new Response(
        JSON.stringify({ success: false, error: "Shiprocket order creation failed", details: createData }),
        { status: createRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Save the returned Shiprocket IDs into your shipments table
    const shiprocketOrderId = createData.order_id ?? null;
    const shipmentId = createData.shipment_id ?? null;

    const { error: insertErr } = await supabase.from("shipments").insert({
      order_id: order.id,
      user_id: order.user_id,
      shiprocket_order_id: shiprocketOrderId ? String(shiprocketOrderId) : null,
      shipment_id: shipmentId ? String(shipmentId) : null,
      shipment_status: "created",
      origin_pincode: originPincode,
      destination_pincode: address.pincode,
    });

    if (insertErr) {
      console.error("Failed to save shipment row:", insertErr);
    }

    // Also mirror onto the order itself
    await supabase
      .from("orders")
      .update({ shipment_status: "created", updated_at: new Date().toISOString() })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Shiprocket order created successfully",
        shiprocket_order_id: shiprocketOrderId,
        shipment_id: shipmentId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
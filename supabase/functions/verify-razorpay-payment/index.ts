import { createClient } from "jsr:@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: VerifyPaymentBody = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_uuid, user_id, amount, method } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_uuid || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required payment verification fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay secret is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature: HMAC-SHA256 of `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      // Record failed payment attempt
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      await supabase.from("payments").insert({
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

      await supabase.from("orders").update({
        payment_status: "failed",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_created_at: new Date().toISOString(),
      }).eq("id", order_uuid);

      return new Response(
        JSON.stringify({ success: false, error: "Payment signature verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Signature valid — persist payment record and update order
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check for duplicate payment (idempotency)
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, status")
      .eq("razorpay_payment_id", razorpay_payment_id)
      .maybeSingle();

    if (existingPayment && existingPayment.status === "paid") {
      return new Response(
        JSON.stringify({ success: true, message: "Payment already verified", duplicate: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (existingPayment) {
      await supabase.from("payments").update({
        status: "paid",
        razorpay_signature,
        method: method || null,
      }).eq("id", existingPayment.id);
    } else {
      await supabase.from("payments").insert({
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

    // Update order to confirmed + paid
    await supabase.from("orders").update({
      status: "confirmed",
      payment_status: "paid",
      payment_method: "razorpay",
      payment_id: razorpay_payment_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", order_uuid);

    // Create shipment record with estimated delivery (5-7 business days from Bangalore)
    const estDelivery = new Date();
    estDelivery.setDate(estDelivery.getDate() + 7);

    await supabase.from("shipments").insert({
      order_id: order_uuid,
      user_id,
      courier: null,
      tracking_number: null,
      shipment_status: "pending",
      estimated_delivery: estDelivery.toISOString().slice(0, 10),
    });

    // Create user notification
    await supabase.from("notifications").insert({
      user_id,
      type: "payment_success",
      title: "Payment Successful",
      body: `Your payment of ₹${amount} has been confirmed. Order ${order_uuid.slice(0, 8)} is now being processed.`,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified and order confirmed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

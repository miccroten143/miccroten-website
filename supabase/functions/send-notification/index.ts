import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendEmailBody {
  to: string;
  type: "order_confirmation" | "payment_success" | "payment_failure" | "shipment_created" | "out_for_delivery" | "delivered" | "refund_completed" | "email_verification";
  data?: Record<string, unknown>;
}

const TEMPLATES: Record<string, { subject: string; build: (d: Record<string, unknown>) => string }> = {
  order_confirmation: {
    subject: "Order Confirmed - MICCROTEN",
    build: (d) => `<h2>Thank you for your order!</h2><p>Your order <strong>${d.order_number}</strong> has been confirmed and is being processed.</p><p>Total: ₹${d.total}</p>`,
  },
  payment_success: {
    subject: "Payment Successful - MICCROTEN",
    build: (d) => `<h2>Payment Received</h2><p>Your payment of ₹${d.amount} for order <strong>${d.order_number}</strong> was successful.</p><p>Payment ID: ${d.payment_id}</p>`,
  },
  payment_failure: {
    subject: "Payment Failed - MICCROTEN",
    build: (d) => `<h2>Payment Failed</h2><p>Your payment of ₹${d.amount} for order <strong>${d.order_number}</strong> could not be processed. Please try again.</p>`,
  },
  shipment_created: {
    subject: "Order Shipped - MICCROTEN",
    build: (d) => `<h2>Your order is on the way!</h2><p>Order <strong>${d.order_number}</strong> has been shipped via ${d.courier}.</p><p>Tracking Number: ${d.tracking_number}</p>`,
  },
  out_for_delivery: {
    subject: "Out for Delivery - MICCROTEN",
    build: (d) => `<h2>Out for Delivery</h2><p>Your order <strong>${d.order_number}</strong> is out for delivery and will arrive soon.</p>`,
  },
  delivered: {
    subject: "Order Delivered - MICCROTEN",
    build: (d) => `<h2>Order Delivered</h2><p>Your order <strong>${d.order_number}</strong> has been delivered. Thank you for shopping with MICCROTEN!</p>`,
  },
  refund_completed: {
    subject: "Refund Completed - MICCROTEN",
    build: (d) => `<h2>Refund Processed</h2><p>A refund of ₹${d.amount} for order <strong>${d.order_number}</strong> has been processed.</p>`,
  },
  email_verification: {
    subject: "Verify Your Email - MICCROTEN",
    build: (d) => `<h2>Welcome to MICCROTEN!</h2><p>Please verify your email address to activate your account.</p><p>Click the verification link sent to your email.</p>`,
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { to, type, data = {} }: SendEmailBody = await req.json();

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: "Recipient email and notification type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const template = TEMPLATES[type];
    if (!template) {
      return new Response(
        JSON.stringify({ error: `Unknown notification type: ${type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email via Supabase's built-in email or an SMTP provider.
    // Falls back to creating a notification record in the database.
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Record the notification in the database for in-app display
    if (data.user_id) {
      await supabase.from("notifications").insert({
        user_id: data.user_id as string,
        type,
        title: template.subject,
        body: template.build(data).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
      });
    }

    // If RESEND_API_KEY or SMTP credentials are configured, send the actual email.
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MICCROTEN <noreply@miccroten.com>",
          to: [to],
          subject: template.subject,
          html: template.build(data),
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        return new Response(
          JSON.stringify({ error: "Email send failed", details: errText }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification processed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

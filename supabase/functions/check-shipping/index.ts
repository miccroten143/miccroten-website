// supabase/functions/check-shipping/index.ts

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getShiprocketToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const email = Deno.env.get("SHIPROCKET_EMAIL");
  const password = Deno.env.get("SHIPROCKET_PASSWORD");

  if (!email || !password) {
    throw new Error("Shiprocket credentials are not configured.");
  }

  const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Shiprocket auth failed: ${errText}`);
  }

  const data = await res.json();
  const token = data.token as string;

  cachedToken = { token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };

  return token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // NOTE: frontend sends "delivery_pincode", not "pincode"
    const { delivery_pincode, weight, cod, subtotal } = await req.json();

    if (!delivery_pincode || typeof weight !== "number") {
      return new Response(
        JSON.stringify({ success: false, error: "delivery_pincode and weight are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const originPincode = Deno.env.get("ORIGIN_PINCODE");
    if (!originPincode) {
      throw new Error("ORIGIN_PINCODE is not configured.");
    }

    const token = await getShiprocketToken();
    const codPayment = cod ? 1 : 0;
    const declaredValue = subtotal ?? 500;

    const params = new URLSearchParams({
      pickup_postcode: originPincode,
      delivery_postcode: String(delivery_pincode),
      weight: String(weight),
      cod: String(codPayment),
      declared_value: String(declaredValue),
    });

    const res = await fetch(
      `${SHIPROCKET_BASE_URL}/courier/serviceability/?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Shiprocket serviceability check failed: ${errText}`);
    }

    const data = await res.json();
    const couriers = data?.data?.available_courier_companies ?? [];

    if (couriers.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Delivery is not available for this pincode",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cheapest = couriers.reduce((best: any, curr: any) =>
      curr.rate < best.rate ? curr : best
    );

    const estimatedDays = Math.ceil(Number(cheapest.estimated_delivery_days ?? 5));
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + estimatedDays);

    // Wrapped in { success, shipping: {...} } to match services.ts
    const result = {
      success: true,
      shipping: {
        cost: Number(cheapest.rate ?? 0),
        estimatedDays,
        estimatedDelivery: estDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        courier: cheapest.courier_name ?? "Standard Delivery",
        available: true,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("check-shipping error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
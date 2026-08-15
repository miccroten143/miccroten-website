const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, x-client-info",
};

interface RequestBody {
  order_id: number;
  pickup_postcode: string;
  delivery_postcode: string;
  weight?: number;
  cod?: number;
  length?: number;
  breadth?: number;
  height?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "POST method required",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const body: RequestBody = await req.json();

    if (
      !body.order_id ||
      !body.pickup_postcode ||
      !body.delivery_postcode
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "order_id, pickup_postcode and delivery_postcode are required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const email = Deno.env.get("SHIPROCKET_EMAIL");
    const password = Deno.env.get("SHIPROCKET_PASSWORD");

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Shiprocket credentials are not configured",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // 1. Authenticate
    const authResponse = await fetch(
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

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Shiprocket authentication failed",
          details: authData,
        }),
        {
          status: authResponse.status || 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // 2. Build serviceability request
    const params = new URLSearchParams({
      pickup_postcode: body.pickup_postcode,
      delivery_postcode: body.delivery_postcode,
      order_id: String(body.order_id),
    });

    if (body.weight) {
      params.set("weight", String(body.weight));
    }

    if (body.cod !== undefined) {
      params.set("cod", String(body.cod));
    }

    if (body.length) {
      params.set("length", String(body.length));
    }

    if (body.breadth) {
      params.set("breadth", String(body.breadth));
    }

    if (body.height) {
      params.set("height", String(body.height));
    }

    // 3. Check courier serviceability
    const serviceabilityResponse = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
      },
    );

    const serviceabilityData = await serviceabilityResponse.json();

    if (!serviceabilityResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to check courier serviceability",
          details: serviceabilityData,
        }),
        {
          status: serviceabilityResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Courier serviceability checked successfully",
        data: serviceabilityData,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
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
          "Content-Type": "application/json",
        },
      },
    );
  }
});
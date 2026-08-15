const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
<<<<<<< HEAD
  "Access-Control-Allow-Methods": "POST, OPTIONS",
=======
>>>>>>> 5947fd286a62a072a06c847042a556ca85342e11
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

<<<<<<< HEAD
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
=======
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
>>>>>>> 5947fd286a62a072a06c847042a556ca85342e11
  }

  try {
    const email = Deno.env.get("SHIPROCKET_EMAIL");
    const password = Deno.env.get("SHIPROCKET_PASSWORD");

    if (!email || !password) {
<<<<<<< HEAD
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

    const response = await fetch(
=======
      throw new Error("Shiprocket credentials not found.");
    }

    const loginResponse = await fetch(
>>>>>>> 5947fd286a62a072a06c847042a556ca85342e11
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

<<<<<<< HEAD
    const data = await response.json();

    if (!response.ok) {
      console.error("Shiprocket login error:", data);

      return new Response(
        JSON.stringify({
          success: false,
          error: data?.message || "Shiprocket authentication failed",
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
=======
    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      return new Response(JSON.stringify(loginData), {
        status: loginResponse.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
>>>>>>> 5947fd286a62a072a06c847042a556ca85342e11
    }

    return new Response(
      JSON.stringify({
        success: true,
<<<<<<< HEAD
        message: "Shiprocket authentication successful",
      }),
      {
        status: 200,
=======
        token: loginData.token,
      }),
      {
>>>>>>> 5947fd286a62a072a06c847042a556ca85342e11
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
<<<<<<< HEAD
  } catch (error) {
    console.error("Shiprocket function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
=======
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
>>>>>>> 5947fd286a62a072a06c847042a556ca85342e11
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
<<<<<<< HEAD
});
=======
});
>>>>>>> 5947fd286a62a072a06c847042a556ca85342e11

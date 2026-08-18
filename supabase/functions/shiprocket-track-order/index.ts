const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { awb_code, shipment_id, order_id } = await req.json();

    if (!awb_code && !shipment_id && !order_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Either awb_code, shipment_id, or order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = await shiprocketLogin();
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Shiprocket credentials are not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let trackingUrl: string;

    if (awb_code) {
      trackingUrl = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb_code}`;
    } else if (shipment_id) {
      trackingUrl = `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipment_id}`;
    } else {
      trackingUrl = `https://apiv2.shiprocket.in/v1/external/courier/track?order_id=${order_id}`;
    }

    const trackRes = await fetch(trackingUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const trackData = await trackRes.json();

    if (!trackRes.ok) {
      const errMsg = trackData?.message || "Tracking request failed";
      if (trackRes.status === 404 || (errMsg && errMsg.toLowerCase().includes("not found"))) {
        return new Response(
          JSON.stringify({
            success: true,
            current_status: "pending",
            current_status_code: null,
            tracking_message: "Shipment created. Tracking information will be available once the courier is assigned.",
            tracking_events: [],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: errMsg }),
        { status: trackRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize the Shiprocket tracking response
    const trackingData = trackData?.tracking_data ?? trackData;
    const awb = awb_code || trackingData?.awb_code || trackingData?.awb || null;
    const courier = trackingData?.courier_name || trackingData?.courier || null;
    const currentStatus = trackingData?.current_status || trackingData?.status || "pending";
    const currentStatusCode = trackingData?.current_status_code ?? trackingData?.status_code ?? null;
    const edd = trackingData?.edd_date || trackingData?.estimated_delivery_date || null;

    // Extract tracking events / activities
    let trackingEvents: any[] = [];
    const activities = trackingData?.shipment_activities || trackingData?.activities || trackingData?.scan_events || [];
    if (Array.isArray(activities)) {
      trackingEvents = activities.map((act: any) => ({
        status: act.status || act.current_status || "unknown",
        status_code: act.status_code ?? null,
        activity: act.activity || act.description || act.remark || "Status update",
        location: act.location || act.place || act.city || null,
        timestamp: act.date || act.timestamp || act.event_timestamp || null,
      }));
    }

    return new Response(
      JSON.stringify({
        success: true,
        awb_code: awb,
        courier_name: courier,
        current_status: currentStatus,
        current_status_code: currentStatusCode,
        tracking_message: trackingData?.message || trackingData?.current_status || "Tracking retrieved",
        estimated_delivery_date: edd,
        tracking_events: trackingEvents,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

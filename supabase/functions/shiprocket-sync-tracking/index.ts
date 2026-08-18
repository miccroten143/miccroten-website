import { createClient } from "jsr:@supabase/supabase-js@2";

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

// Map Shiprocket status codes to normalized shipment_status values
function mapShipmentStatus(statusCode: number | string | null, currentStatus: string): string {
  const code = Number(statusCode);
  const status = (currentStatus || "").toLowerCase();

  if (status.includes("delivered") || code === 7 || code === 9) return "delivered";
  if (status.includes("out for delivery") || code === 6 || code === 8) return "out_for_delivery";
  if (status.includes("in transit") || code === 5 || code === 12) return "in_transit";
  if (status.includes("picked up") || status.includes("picked_up") || code === 4) return "picked_up";
  if (status.includes("rto") || code === 10) return "rto";
  if (status.includes("cancel") || code === 11) return "cancelled";
  if (status.includes("created") || code === 1 || code === 2) return "created";
  if (status.includes("pending") || code === 0 || code === 3) return "pending";
  return status || "pending";
}

// Customer-friendly status label
function customerFriendlyStatus(shipmentStatus: string): string {
  const map: Record<string, string> = {
    pending: "Processing",
    created: "Shipment Created",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    rto: "Return Initiated (RTO)",
  };
  return map[shipmentStatus] ?? shipmentStatus.replace(/_/g, " ");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Optional: accept a specific order_id to sync, otherwise sync all active shipments
    const body = await req.json().catch(() => ({}));
    const targetOrderId = body?.order_id;

    // Fetch shipments that are NOT delivered/cancelled/rto
    let query = supabase
      .from("shipments")
      .select("*, orders!inner(id, order_number, user_id)")
      .not("shipment_status", "in", '("delivered","cancelled","rto")');

    if (targetOrderId) {
      query = query.eq("order_id", targetOrderId);
    }

    const { data: shipments, error: fetchErr } = await query.limit(50);

    if (fetchErr) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch shipments" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!shipments || shipments.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No active shipments to sync", synced: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = await shiprocketLogin();
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Shiprocket credentials are not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let synced = 0;
    let failed = 0;

    for (const ship of shipments) {
      try {
        const awb = ship.awb_code;
        if (!awb) {
          // No AWB assigned yet — skip, don't error
          continue;
        }

        const trackRes = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!trackRes.ok) continue;

        const trackData = await trackRes.json();
        const trackingData = trackData?.tracking_data ?? trackData;

        const currentStatus = trackingData?.current_status || trackingData?.status || "";
        const currentStatusCode = trackingData?.current_status_code ?? trackingData?.status_code ?? null;
        const edd = trackingData?.edd_date || trackingData?.estimated_delivery_date || null;
        const normalizedStatus = mapShipmentStatus(currentStatusCode, currentStatus);
        const friendlyStatus = customerFriendlyStatus(normalizedStatus);

        // Update shipment
        const shipUpdates: Record<string, unknown> = {
          shipment_status: normalizedStatus,
          tracking_status: currentStatus,
          tracking_message: friendlyStatus,
          tracking_last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (edd) shipUpdates.estimated_delivery = edd.slice(0, 10);
        if (normalizedStatus === "delivered") shipUpdates.delivered_at = new Date().toISOString();
        if (normalizedStatus === "picked_up" && !ship.shipped_at) shipUpdates.shipped_at = new Date().toISOString();

        await supabase.from("shipments").update(shipUpdates).eq("id", ship.id);

        // Update order
        const orderUpdates: Record<string, unknown> = {
          shipment_status: normalizedStatus,
          updated_at: new Date().toISOString(),
        };
        if (edd) orderUpdates.estimated_delivery = edd.slice(0, 10);

        await supabase.from("orders").update(orderUpdates).eq("id", ship.order_id);

        // Insert tracking events (deduplicated by timestamp + status)
        const activities = trackingData?.shipment_activities || trackingData?.activities || trackingData?.scan_events || [];
        if (Array.isArray(activities) && activities.length > 0) {
          for (const act of activities) {
            const eventTs = act.date || act.timestamp || new Date().toISOString();
            const eventStatus = act.status || act.current_status || "unknown";
            const eventLocation = act.location || act.place || act.city || null;
            const eventActivity = act.activity || act.description || act.remark || "Status update";
            const eventStatusCode = act.status_code ?? null;

            // Check for existing event to prevent duplicates
            const { data: existing } = await supabase
              .from("order_tracking_events")
              .select("id")
              .eq("order_id", ship.order_id)
              .eq("awb_code", awb)
              .eq("status", eventStatus)
              .gte("event_timestamp", eventTs)
              .lte("event_timestamp", eventTs)
              .maybeSingle();

            if (!existing) {
              await supabase.from("order_tracking_events").insert({
                order_id: ship.order_id,
                shiprocket_order_id: ship.shiprocket_order_id,
                shipment_id: ship.shipment_id,
                awb_code: awb,
                status: eventStatus,
                status_code: String(eventStatusCode),
                activity: eventActivity,
                location: eventLocation,
                event_timestamp: eventTs,
              });
            }
          }
        }

        synced++;
      } catch {
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${synced} shipment(s)${failed > 0 ? `, ${failed} failed` : ""}`,
        synced,
        failed,
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

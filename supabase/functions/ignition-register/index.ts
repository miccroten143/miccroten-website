import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RegistrationBody {
  uid: string;
  full_name: string;
  project_name: string;
  email: string;
  phone: string;
  role: string;
  college_company: string;
  department?: string;
  source: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "POST method required" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RegistrationBody = await req.json();
    const { uid, full_name, project_name, email, phone, role, college_company, department, source } = body;

    if (!uid || !full_name || !project_name || !email || !phone || !role || !college_company || !source) {
      return new Response(
        JSON.stringify({ success: false, error: "All required fields must be provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanUid = uid.trim();

    console.log("Raw UID received:", JSON.stringify(uid));
    console.log("Cleaned UID:", JSON.stringify(cleanUid));
    console.log("UID char codes:", [...cleanUid].map((c) => c.charCodeAt(0)));

    if (!/^MT[A-Za-z0-9]{10}$/.test(cleanUid)) {
      console.log("UID failed regex format check");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid UID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log("Querying Supabase URL:", supabaseUrl);

    const { data: uidRow, error: uidErr } = await supabase
      .from("ignition_uids")
      .select("id, uid, status")
      .eq("uid", cleanUid)
      .maybeSingle();

    console.log("Query error:", JSON.stringify(uidErr));
    console.log("Query result (uidRow):", JSON.stringify(uidRow));

    if (uidErr) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify UID" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!uidRow) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid UID. Please check your kit UID and try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (uidRow.status === "registered") {
      return new Response(
        JSON.stringify({ success: false, error: "This UID has already been registered." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const googleScriptUrl = Deno.env.get("IGNITION_GOOGLE_SCRIPT_URL");
    let registrationId = "";

    if (googleScriptUrl) {
      const googleResponse = await fetch(googleScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: cleanUid, full_name, project_name, email, phone, role, college_company,
          department: department || "", source,
        }),
      });

      if (!googleResponse.ok) {
        return new Response(
          JSON.stringify({ success: false, error: "Failed to save registration. Please try again." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const googleData = await googleResponse.json();

      if (!googleData.success) {
        return new Response(
          JSON.stringify({ success: false, error: googleData.error || "Registration failed. Please try again." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      registrationId = googleData.registration_id || "";
    } else {
      registrationId = `IGN26-${String(Date.now()).slice(-5)}`;
    }

    const { error: updateErr } = await supabase
      .from("ignition_uids")
      .update({
        status: "registered",
        registered_at: new Date().toISOString(),
      })
      .eq("id", uidRow.id);

    if (updateErr) {
      console.error("Failed to mark UID as registered:", updateErr);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "MICCROTEN <noreply@miccroten.com>",
            to: [email],
            subject: "IGNITION 2K26 — Registration Confirmed",
            html: `
              <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #0369a1;">IGNITION 2K26</h1>
                <h2 style="color: #10b981;">Registration Confirmed ✓</h2>
                <p>Hi ${full_name},</p>
                <p>Your registration for IGNITION 2K26 has been successfully completed.</p>
                <table style="border-collapse: collapse; margin: 20px 0;">
                  <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Registration ID</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${registrationId}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Kit UID</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${cleanUid}</td></tr>
                  <tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Project Name</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${project_name}</td></tr>
                </table>
                <p><strong>Project submission is not open yet.</strong></p>
                <p>The project submission date will be announced later. You will receive an email notification when project submission opens.</p>
                <p>Keep your Registration ID safe.</p>
                <p>Build. Innovate. Compete. Win.</p>
                <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">MICCROTEN Technologies Pvt. Ltd.</p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration successful",
        registration_id: registrationId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
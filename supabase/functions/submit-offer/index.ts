import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId, propertyReference, fullName, email, phone, offerAmount } = await req.json();

    // Validate required fields
    if (!propertyId || !fullName || !email || !offerAmount) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Email no válido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert offer into database
    const { data: offer, error: insertError } = await supabase
      .from("offers")
      .insert({
        property_id: propertyId,
        property_reference: propertyReference || null,
        full_name: fullName,
        email: email,
        phone: phone || null,
        offer_amount: parseFloat(offerAmount),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Error al guardar la oferta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send notification email via Resend (if API key is configured)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (resendApiKey) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "IKESA Notificaciones <no-reply@ikesa.net>",
            to: ["info@ikesa.net"],
            subject: `Nueva oferta - Ref. ${propertyReference || propertyId}`,
            html: `
              <h2>Nueva oferta recibida</h2>
              <table style="border-collapse:collapse;width:100%;max-width:500px;">
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Referencia</td><td style="padding:8px;border-bottom:1px solid #eee;">${propertyReference || propertyId}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Nombre</td><td style="padding:8px;border-bottom:1px solid #eee;">${fullName}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Teléfono</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone || "No proporcionado"}</td></tr>
                <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Importe oferta</td><td style="padding:8px;border-bottom:1px solid #eee;">${parseFloat(offerAmount).toLocaleString("es-ES")} €</td></tr>
              </table>
            `,
          }),
        });
        const emailBody = await emailRes.text();
        emailSent = emailRes.ok;
        if (!emailRes.ok) {
          console.error("Resend error:", emailBody);
        }
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, offerId: offer.id, emailSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

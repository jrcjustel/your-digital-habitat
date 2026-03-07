import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, filePath, reference, senderName } = await req.json();

    if (!recipientEmail || !filePath || !reference) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios: recipientEmail, filePath, reference" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return new Response(
        JSON.stringify({ error: "Formato de email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create a signed URL for the PDF (valid for 7 days)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("dossiers")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Error creating signed URL:", signedUrlError);
      return new Response(
        JSON.stringify({ error: "No se pudo generar el enlace de descarga" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const downloadUrl = signedUrlData.signedUrl;

    // Return the signed URL and mailto link data
    // The client will open the mailto: link with pre-filled content
    const subject = encodeURIComponent(`Dossier de Inversión IKESA — Ref: ${reference}`);
    const body = encodeURIComponent(
      `Hola${recipientName ? ` ${recipientName}` : ""},\n\n` +
      `${senderName ? `${senderName} te` : "Te"} envía el dossier de inversión correspondiente al activo con referencia ${reference}.\n\n` +
      `Puedes descargar el documento desde el siguiente enlace (válido durante 7 días):\n\n` +
      `${downloadUrl}\n\n` +
      `Este documento es confidencial y está destinado exclusivamente al destinatario indicado.\n\n` +
      `Saludos,\nIKESA Inmobiliaria Real\ninfo@ikesa.es | www.ikesa.es`
    );

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl,
        mailtoUrl: `mailto:${recipientEmail}?subject=${subject}&body=${body}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-dossier:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

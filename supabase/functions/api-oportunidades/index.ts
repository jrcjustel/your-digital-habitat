import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ─── Auth ───
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "No autorizado" }, 401);
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return json({ error: "Token inválido" }, 401);
  }
  const userId = claimsData.claims.sub as string;

  // ─── Permission helpers ───
  async function hasPermission(permission: string): Promise<boolean> {
    const { data } = await supabaseAdmin.rpc("has_permission", {
      _user_id: userId,
      _permission: permission,
    });
    return data === true;
  }

  async function hasRole(role: string): Promise<boolean> {
    const { data } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: role,
    });
    return data === true;
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  // Path: /api-oportunidades or /api-oportunidades/{id}
  const resourceId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

  try {
    // ═══════════ GET — List or Detail ═══════════
    if (req.method === "GET") {
      // Any authenticated user can read (RLS on view allows it)
      if (resourceId) {
        // Single oportunidad
        const { data, error } = await supabaseUser
          .from("oportunidades")
          .select("*")
          .eq("id", resourceId)
          .maybeSingle();

        if (error) return json({ error: error.message }, 400);
        if (!data) return json({ error: "No encontrada" }, 404);
        return json({ data });
      }

      // List with filters
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const offset = (page - 1) * limit;

      let query = supabaseUser.from("oportunidades").select("*", { count: "exact" });

      // Filters
      const provincia = url.searchParams.get("provincia");
      const tipo = url.searchParams.get("tipo_activo");
      const ccaa = url.searchParams.get("comunidad_autonoma");
      const servicer = url.searchParams.get("servicer");
      const publicado = url.searchParams.get("publicado");
      const minScore = url.searchParams.get("min_score");
      const maxPrecio = url.searchParams.get("max_precio");
      const minRoi = url.searchParams.get("min_roi");
      const cesionRemate = url.searchParams.get("cesion_remate");
      const cesionCredito = url.searchParams.get("cesion_credito");
      const sortBy = url.searchParams.get("sort") || "created_at";
      const sortDir = url.searchParams.get("dir") === "asc" ? true : false;

      if (provincia) query = query.ilike("provincia", `%${provincia}%`);
      if (tipo) query = query.ilike("tipo_activo", `%${tipo}%`);
      if (ccaa) query = query.ilike("comunidad_autonoma", `%${ccaa}%`);
      if (servicer) query = query.ilike("servicer", `%${servicer}%`);
      if (publicado !== null && publicado !== undefined) query = query.eq("publicado", publicado === "true");
      if (minScore) query = query.gte("score_inversion", parseInt(minScore));
      if (maxPrecio) query = query.lte("precio_compra", parseFloat(maxPrecio));
      if (minRoi) query = query.gte("roi_estimado", parseFloat(minRoi));
      if (cesionRemate === "true") query = query.eq("cesion_remate", true);
      if (cesionCredito === "true") query = query.eq("cesion_credito", true);

      // Sort
      const validSorts = ["created_at", "score_inversion", "roi_estimado", "tir_estimada", "precio_compra", "valor_mercado", "provincia"];
      const safeSortBy = validSorts.includes(sortBy) ? sortBy : "created_at";
      query = query.order(safeSortBy, { ascending: sortDir });

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) return json({ error: error.message }, 400);

      return json({
        data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // ═══════════ POST — Create oportunidad extra data ═══════════
    if (req.method === "POST") {
      const canWrite = await hasPermission("escribir");
      if (!canWrite) return json({ error: "Sin permiso de escritura" }, 403);

      const body = await req.json();
      const { npl_asset_id, notas, gastos_reforma, gastos_fiscales, gastos_judiciales, gastos_notariales, fecha_publicacion } = body;

      if (!npl_asset_id) return json({ error: "npl_asset_id es obligatorio" }, 400);

      const { data, error } = await supabaseAdmin
        .from("oportunidades_extra")
        .upsert(
          {
            npl_asset_id,
            notas: notas || null,
            gastos_reforma: gastos_reforma || 0,
            gastos_fiscales: gastos_fiscales || 0,
            gastos_judiciales: gastos_judiciales || 0,
            gastos_notariales: gastos_notariales || 0,
            fecha_publicacion: fecha_publicacion || null,
            created_by: userId,
            updated_by: userId,
          },
          { onConflict: "npl_asset_id" }
        )
        .select()
        .single();

      if (error) return json({ error: error.message }, 400);

      // Log change
      await supabaseAdmin.from("historial_cambios").insert({
        entidad_tipo: "oportunidad_extra",
        entidad_id: npl_asset_id,
        campo_modificado: "upsert_completo",
        valor_nuevo: JSON.stringify(body),
        usuario_id: userId,
      });

      return json({ data }, 201);
    }

    // ═══════════ PATCH — Update oportunidad extra ═══════════
    if (req.method === "PATCH") {
      if (!resourceId) return json({ error: "Se requiere ID" }, 400);

      const canWrite = await hasPermission("escribir");
      if (!canWrite) return json({ error: "Sin permiso de escritura" }, 403);

      const body = await req.json();
      const allowedFields = [
        "notas", "gastos_reforma", "gastos_fiscales", "gastos_judiciales",
        "gastos_notariales", "roi_estimado", "tir_estimada", "score_inversion",
        "liquidez_score", "riesgo_judicial", "fecha_publicacion",
      ];

      const updates: Record<string, unknown> = { updated_by: userId };
      for (const key of allowedFields) {
        if (body[key] !== undefined) updates[key] = body[key];
      }

      // Get previous values for audit
      const { data: prev } = await supabaseAdmin
        .from("oportunidades_extra")
        .select("*")
        .eq("npl_asset_id", resourceId)
        .maybeSingle();

      const { data, error } = await supabaseAdmin
        .from("oportunidades_extra")
        .update(updates)
        .eq("npl_asset_id", resourceId)
        .select()
        .single();

      if (error) return json({ error: error.message }, 400);

      // Log each changed field
      for (const key of Object.keys(updates)) {
        if (key === "updated_by") continue;
        const oldVal = prev ? String((prev as any)[key] ?? "") : "";
        const newVal = String(updates[key] ?? "");
        if (oldVal !== newVal) {
          await supabaseAdmin.from("historial_cambios").insert({
            entidad_tipo: "oportunidad_extra",
            entidad_id: resourceId,
            campo_modificado: key,
            valor_anterior: oldVal,
            valor_nuevo: newVal,
            usuario_id: userId,
          });
        }
      }

      return json({ data });
    }

    // ═══════════ DELETE — Remove oportunidad extra ═══════════
    if (req.method === "DELETE") {
      if (!resourceId) return json({ error: "Se requiere ID" }, 400);

      const isAdmin = await hasRole("admin");
      if (!isAdmin) return json({ error: "Solo administradores pueden eliminar" }, 403);

      const { error } = await supabaseAdmin
        .from("oportunidades_extra")
        .delete()
        .eq("npl_asset_id", resourceId);

      if (error) return json({ error: error.message }, 400);

      await supabaseAdmin.from("historial_cambios").insert({
        entidad_tipo: "oportunidad_extra",
        entidad_id: resourceId,
        campo_modificado: "eliminacion",
        valor_anterior: "existia",
        valor_nuevo: "eliminada",
        usuario_id: userId,
      });

      return json({ success: true });
    }

    return json({ error: "Método no soportado" }, 405);
  } catch (e: any) {
    console.error("API Oportunidades error:", e);
    return json({ error: e.message || "Error interno" }, 500);
  }
});

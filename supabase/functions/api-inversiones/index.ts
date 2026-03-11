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

  // ─── Role gate: only admin, finanzas, analista, comercial ───
  const [isAdmin, isFinanzas, isAnalista, isComercial] = await Promise.all([
    hasRole("admin"),
    hasRole("finanzas"),
    hasRole("analista"),
    hasRole("comercial"),
  ]);

  const hasAccess = isAdmin || isFinanzas || isAnalista || isComercial;
  if (!hasAccess) {
    return json({ error: "Acceso restringido a equipo interno" }, 403);
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const resourceId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

  try {
    // ═══════════ GET — List or Detail ═══════════
    if (req.method === "GET") {
      if (resourceId) {
        const { data, error } = await supabaseAdmin
          .from("inversiones")
          .select("*, oportunidades:oportunidad_id(id, tipo_activo, provincia, municipio, precio_compra, valor_mercado, score_inversion)")
          .eq("id", resourceId)
          .maybeSingle();

        if (error) return json({ error: error.message }, 400);
        if (!data) return json({ error: "Inversión no encontrada" }, 404);

        // Comercial can only read
        const canSeeFinanciero = await hasPermission("ver_financiero");
        if (!canSeeFinanciero && !isAdmin) {
          // Redact sensitive financial fields
          const { tir, margen_neto, ...safe } = data as any;
          return json({ data: safe });
        }

        return json({ data });
      }

      // List
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const offset = (page - 1) * limit;

      let query = supabaseAdmin
        .from("inversiones")
        .select("*, oportunidades:oportunidad_id(id, tipo_activo, provincia, municipio, precio_compra, score_inversion)", { count: "exact" });

      // Filters
      const estado = url.searchParams.get("estado");
      const oportunidadId = url.searchParams.get("oportunidad_id");
      const minRoi = url.searchParams.get("min_roi");
      const sortBy = url.searchParams.get("sort") || "created_at";
      const sortDir = url.searchParams.get("dir") === "asc" ? true : false;

      if (estado) query = query.eq("estado", estado);
      if (oportunidadId) query = query.eq("oportunidad_id", oportunidadId);
      if (minRoi) query = query.gte("roi", parseFloat(minRoi));

      const validSorts = ["created_at", "roi", "tir", "inversion_total", "margen_neto", "estado", "fecha_inversion"];
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

    // ═══════════ POST — Create inversión ═══════════
    if (req.method === "POST") {
      // Only admin, finanzas, analista can create
      if (!isAdmin && !isFinanzas && !isAnalista) {
        return json({ error: "Sin permiso para crear inversiones" }, 403);
      }

      const body = await req.json();
      const {
        oportunidad_id, precio_compra, gastos_totales, inversion_total,
        valor_venta_estimado, roi, tir, margen_neto, duracion_meses,
        estado, notas, fecha_inversion,
      } = body;

      if (!oportunidad_id) return json({ error: "oportunidad_id es obligatorio" }, 400);
      if (!precio_compra && precio_compra !== 0) return json({ error: "precio_compra es obligatorio" }, 400);

      const { data, error } = await supabaseAdmin
        .from("inversiones")
        .insert({
          oportunidad_id,
          precio_compra: precio_compra || 0,
          gastos_totales: gastos_totales || 0,
          inversion_total: inversion_total || (precio_compra || 0) + (gastos_totales || 0),
          valor_venta_estimado: valor_venta_estimado || 0,
          roi: roi || 0,
          tir: tir || 0,
          margen_neto: margen_neto || 0,
          duracion_meses: duracion_meses || 12,
          estado: estado || "activa",
          notas: notas || null,
          fecha_inversion: fecha_inversion || new Date().toISOString(),
          creado_por: userId,
        })
        .select()
        .single();

      if (error) return json({ error: error.message }, 400);

      // Audit
      await supabaseAdmin.from("historial_cambios").insert({
        entidad_tipo: "inversion",
        entidad_id: data.id,
        campo_modificado: "creacion",
        valor_nuevo: JSON.stringify({ oportunidad_id, precio_compra, estado: estado || "activa" }),
        usuario_id: userId,
      });

      return json({ data }, 201);
    }

    // ═══════════ PATCH — Update inversión ═══════════
    if (req.method === "PATCH") {
      if (!resourceId) return json({ error: "Se requiere ID" }, 400);

      if (!isAdmin && !isFinanzas && !isAnalista) {
        return json({ error: "Sin permiso para editar inversiones" }, 403);
      }

      const body = await req.json();
      const allowedFields = [
        "precio_compra", "gastos_totales", "inversion_total", "valor_venta_estimado",
        "roi", "tir", "margen_neto", "duracion_meses", "estado",
        "notas", "fecha_inversion", "fecha_cierre",
      ];

      const updates: Record<string, unknown> = {};
      for (const key of allowedFields) {
        if (body[key] !== undefined) updates[key] = body[key];
      }

      if (Object.keys(updates).length === 0) {
        return json({ error: "No hay campos para actualizar" }, 400);
      }

      // Get previous
      const { data: prev } = await supabaseAdmin
        .from("inversiones")
        .select("*")
        .eq("id", resourceId)
        .maybeSingle();

      const { data, error } = await supabaseAdmin
        .from("inversiones")
        .update(updates)
        .eq("id", resourceId)
        .select()
        .single();

      if (error) return json({ error: error.message }, 400);

      // Audit each changed field
      for (const key of Object.keys(updates)) {
        const oldVal = prev ? String((prev as any)[key] ?? "") : "";
        const newVal = String(updates[key] ?? "");
        if (oldVal !== newVal) {
          await supabaseAdmin.from("historial_cambios").insert({
            entidad_tipo: "inversion",
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

    // ═══════════ DELETE — Remove inversión ═══════════
    if (req.method === "DELETE") {
      if (!resourceId) return json({ error: "Se requiere ID" }, 400);

      if (!isAdmin) {
        return json({ error: "Solo administradores pueden eliminar inversiones" }, 403);
      }

      const { error } = await supabaseAdmin
        .from("inversiones")
        .delete()
        .eq("id", resourceId);

      if (error) return json({ error: error.message }, 400);

      await supabaseAdmin.from("historial_cambios").insert({
        entidad_tipo: "inversion",
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
    console.error("API Inversiones error:", e);
    return json({ error: e.message || "Error interno" }, 500);
  }
});

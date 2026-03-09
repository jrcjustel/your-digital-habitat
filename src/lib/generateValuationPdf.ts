import jsPDF from "jspdf";
import logoUrl from "@/assets/ikesa-logo-color.png";

const BRAND_NAVY = [3, 54, 81] as const;
const BRAND_BLUE = [63, 184, 234] as const;
const BRAND_GREEN = [34, 139, 34] as const;
const BRAND_RED = [200, 50, 50] as const;
const BRAND_GOLD = [180, 140, 20] as const;
const GRAY_LIGHT = [245, 247, 250] as const;

interface TestigoCV { direccion: string; descripcion: string; precio: number; precio_m2: number; superficie: number; dem: number; distancia_km: number; diferencias: string; }
interface TestigoAlq { direccion: string; descripcion: string; precio_mensual: number; precio_m2_mes: number; superficie: number; dem: number; distancia_km: number; diferencias: string; }
interface EvTrimestral { trimestre: string; precio: number; }

interface ValuationPdfData {
  direccion: string; municipio: string; provincia: string; codigo_postal?: string;
  tipo_inmueble: string; superficie_m2: number; habitaciones?: number; banos?: number;
  anio_construccion?: number; estado?: string; planta?: number;
  tiene_garaje: boolean; tiene_trastero: boolean; tiene_ascensor: boolean;
  nombre: string; email: string; telefono?: string;
  valuation: {
    valor_min: number; valor_max: number; valor_medio: number; precio_m2: number;
    confianza: string; factores_positivos: string[]; factores_negativos: string[]; comentario: string;
    alquiler_estimado?: number; alquiler_m2?: number;
    tiempo_venta_min?: number; tiempo_venta_max?: number;
    negociacion_min?: number; negociacion_max?: number;
    precio_m2_zona_min?: number; precio_m2_zona_max?: number; precio_m2_zona_mediana?: number;
    evolucion_12m?: number; evolucion_trimestral?: EvTrimestral[];
    precio_garaje_zona?: number; precio_trastero_zona?: number;
    testigos_compraventa?: TestigoCV[]; testigos_alquiler?: TestigoAlq[];
    datos_zona?: { poblacion?: number; renta_media?: number; tasa_actividad?: number; poblacion_extranjera_pct?: number; hogares_1persona_pct?: number; hogares_familia_pct?: number; edad_media_edificacion?: number; inmuebles_residenciales?: number; };
    tipologia_zona?: { por_superficie?: { rango: string; porcentaje: number }[]; por_antiguedad?: { rango: string; porcentaje: number }[]; };
    puntos_interes?: { transporte?: number; comercio?: number; educacion?: number; sanidad?: number; zonas_verdes?: number; };
    insight?: string;
    // Legacy
    renta_media_zona?: number;
  };
  catastro?: { ref_catastral: string; uso_catastral?: string; uso_predominante?: string; clase?: string; superficie_construida?: number; superficie_suelo?: number; coeficiente_participacion?: string; usos_detalle?: { uso: string; superficie: number; planta: string }[]; urls?: { ficha_catastral?: string; cartografia?: string }; };
  catastroFachadaBase64?: string;
}

const tipoLabels: Record<string, string> = {
  piso: "Piso / Apartamento", casa: "Casa / Chalet", adosado: "Adosado / Pareado",
  atico: "Atico", duplex: "Duplex", estudio: "Estudio", local: "Local comercial",
  oficina: "Oficina", terreno: "Terreno", garaje: "Garaje", trastero: "Trastero", nave: "Nave industrial",
};
const estadoLabels: Record<string, string> = { nuevo: "Obra nueva", buen_estado: "Buen estado", reformado: "Reformado", a_reformar: "A reformar" };
const fmtN = (n: number) => n.toLocaleString("es-ES");
const fmtEur = (n: number) => `${fmtN(n)} EUR`;

const loadImageAsBase64 = (url: string): Promise<string> => new Promise((resolve, reject) => {
  const img = new Image(); img.crossOrigin = "anonymous";
  img.onload = () => { const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight; const ctx = c.getContext("2d"); if (!ctx) { reject("no ctx"); return; } ctx.drawImage(img, 0, 0); resolve(c.toDataURL("image/png")); };
  img.onerror = () => reject("err"); img.src = url;
});
const loadImageWithTimeout = async (url: string, timeout = 5000): Promise<string | null> => { try { return await Promise.race([loadImageAsBase64(url), new Promise<string>((_, r) => setTimeout(() => r("timeout"), timeout))]); } catch { return null; } };

export const generateValuationPdf = async (data: ValuationPdfData) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = 210, ph = 297, m = 16, cw = pw - m * 2;
  let y = 0;

  const checkPage = (needed = 12) => { if (y > ph - 18 - needed) { doc.addPage(); y = 20; } };

  const section = (title: string) => {
    checkPage(14); y += 4;
    doc.setFillColor(...BRAND_NAVY); doc.rect(m, y - 4, cw, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
    doc.text(title, m + 3, y + 1); y += 10;
  };

  const kv = (label: string, value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") return;
    checkPage(); doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(120, 120, 120);
    doc.text(label, m, y); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30);
    doc.text(String(value), pw - m, y, { align: "right" }); y += 5.5;
  };

  const link = (label: string, url: string) => {
    checkPage(); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(120, 120, 120);
    doc.text(label + ": ", m, y); const lw = doc.getTextWidth(label + ": ");
    doc.setTextColor(...BRAND_BLUE); const d = url.length > 55 ? url.substring(0, 52) + "..." : url;
    doc.textWithLink(d, m + lw, y, { url }); y += 5;
  };

  let logoBase64: string | null = null;
  try { logoBase64 = await loadImageAsBase64(logoUrl); } catch {}

  const v = data.valuation;

  // ═══ PAGE 1: COVER ═══════════════════════════════════
  doc.setFillColor(...BRAND_NAVY); doc.rect(0, 0, pw, ph, "F");
  doc.setFillColor(...BRAND_BLUE); doc.rect(0, 85, pw, 3, "F");

  if (logoBase64) { try { doc.addImage(logoBase64, "PNG", m, 20, 50, 20); } catch {} }
  else { doc.setFont("helvetica", "bold"); doc.setFontSize(28); doc.setTextColor(255, 255, 255); doc.text("IKESA", m, 36); }

  doc.setFont("helvetica", "bold"); doc.setFontSize(26); doc.setTextColor(255, 255, 255);
  doc.text("Informe de Valoracion", m, 65);
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(...BRAND_BLUE);
  doc.text("Estimacion de Precio | Metodo ECO/805/2003", m, 75);

  y = 100;
  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(255, 255, 255);
  const tl = doc.splitTextToSize(data.direccion, cw); doc.text(tl, m, y); y += tl.length * 7 + 4;
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(180, 210, 230);
  doc.text(`${data.municipio}, ${data.provincia}${data.codigo_postal ? ` - CP ${data.codigo_postal}` : ""}`, m, y); y += 7;
  doc.setFontSize(10); doc.setTextColor(140, 180, 200);
  doc.text(`${tipoLabels[data.tipo_inmueble] || data.tipo_inmueble} | ${data.superficie_m2} m2`, m, y); y += 15;

  // Valuation box on cover
  doc.setDrawColor(...BRAND_BLUE); doc.setLineWidth(0.8); doc.roundedRect(m, y, cw, 45, 3, 3, "S");

  const col1x = m + cw * 0.17, col2x = m + cw * 0.5, col3x = m + cw * 0.83;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(140, 180, 200);
  doc.text("Precio minimo (bid)", col1x, y + 7, { align: "center" });
  doc.text("Precio estimado cierre", col2x, y + 6, { align: "center" });
  doc.text("Precio maximo (asking)", col3x, y + 7, { align: "center" });

  doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(200, 220, 240);
  doc.text(fmtEur(v.valor_min), col1x, y + 16, { align: "center" });
  doc.setFontSize(20); doc.setTextColor(255, 255, 255);
  doc.text(fmtEur(v.valor_medio), col2x, y + 18, { align: "center" });
  doc.setFontSize(12); doc.setTextColor(200, 220, 240);
  doc.text(fmtEur(v.valor_max), col3x, y + 16, { align: "center" });

  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(140, 180, 200);
  doc.text(`${fmtEur(v.precio_m2)}/m2`, col2x, y + 26, { align: "center" });

  // KPI row on cover
  const kpis = [
    v.alquiler_estimado ? `Alquiler: ${fmtN(v.alquiler_estimado)} EUR/mes` : null,
    v.tiempo_venta_min && v.tiempo_venta_max ? `Venta: ${v.tiempo_venta_min}-${v.tiempo_venta_max} meses` : null,
    v.negociacion_min && v.negociacion_max ? `Negoc: -${v.negociacion_min}-${v.negociacion_max}%` : null,
  ].filter(Boolean);
  if (kpis.length) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(140, 180, 200);
    doc.text(kpis.join("  |  "), col2x, y + 37, { align: "center" });
  }

  // Facade on cover
  if (data.catastroFachadaBase64) {
    try { doc.addImage(data.catastroFachadaBase64, "JPEG", pw - m - 50, 190, 50, 35); doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.5); doc.rect(pw - m - 50, 190, 50, 35, "S"); } catch {}
  }

  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(140, 180, 200);
  doc.text(`Para: ${data.nombre}`, m, 250);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`, m, 257);
  doc.text("Ref.: DV-" + Date.now().toString(36).toUpperCase(), m, 264);
  doc.setFontSize(7); doc.setTextColor(100, 140, 160);
  doc.text("IKESA Inmobiliaria | www.ikesa.es | Informe Confidencial", pw / 2, 285, { align: "center" });

  // ═══ PAGE 2+: CONTENT ═══════════════════════════════
  const miniHeader = () => {
    if (logoBase64) { try { doc.addImage(logoBase64, "PNG", m, 8, 22, 9); } catch {} }
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(150, 150, 150);
    doc.text("Informe de Valoracion IKESA", pw - m, 14, { align: "right" });
    doc.setDrawColor(...BRAND_BLUE); doc.setLineWidth(0.5); doc.line(m, 19, pw - m, 19);
    y = 25;
  };

  doc.addPage(); miniHeader();

  // ── Datos del inmueble ──
  section("DATOS DEL INMUEBLE");
  kv("Direccion", data.direccion);
  kv("Municipio", data.municipio);
  kv("Provincia", data.provincia);
  if (data.codigo_postal) kv("Codigo postal", data.codigo_postal);
  kv("Tipo", tipoLabels[data.tipo_inmueble] || data.tipo_inmueble);
  kv("Superficie", `${data.superficie_m2} m2`);
  if (data.habitaciones) kv("Habitaciones", data.habitaciones);
  if (data.banos) kv("Banos", data.banos);
  if (data.anio_construccion) kv("Ano construccion", data.anio_construccion);
  if (data.estado) kv("Estado", estadoLabels[data.estado] || data.estado);
  if (data.planta != null) kv("Planta", data.planta === 0 ? "Bajo" : data.planta);
  kv("Garaje", data.tiene_garaje ? "Si" : "No");
  kv("Trastero", data.tiene_trastero ? "Si" : "No");
  kv("Ascensor", data.tiene_ascensor ? "Si" : "No");

  // Catastro
  if (data.catastro) {
    y += 2; doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BRAND_NAVY);
    doc.text("Datos Catastro", m, y); y += 5;
    kv("Ref. catastral", data.catastro.ref_catastral);
    if (data.catastro.uso_catastral) kv("Uso catastral", data.catastro.uso_catastral);
    if (data.catastro.clase) kv("Clase", data.catastro.clase);
    if (data.catastro.superficie_construida) kv("Sup. construida", `${data.catastro.superficie_construida} m2`);
    if (data.catastro.coeficiente_participacion) kv("Coef. participacion", data.catastro.coeficiente_participacion);
    if (data.catastro.urls?.ficha_catastral) link("Ficha catastral", data.catastro.urls.ficha_catastral);
  }

  // Facade image
  if (data.catastroFachadaBase64) {
    checkPage(55); y += 2;
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(80, 80, 80);
    doc.text("Fotografia de fachada (Catastro):", m, y); y += 3;
    try { doc.addImage(data.catastroFachadaBase64, "JPEG", m, y, 70, 42); y += 45; } catch {}
  }

  // ── ESTIMACIÓN ──
  checkPage(50);
  section("ESTIMACION DE PRECIO");

  // Triple price box
  doc.setFillColor(240, 247, 252); doc.setDrawColor(...BRAND_BLUE); doc.setLineWidth(0.4);
  doc.roundedRect(m, y - 2, cw, 30, 3, 3, "FD");

  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(120, 120, 120);
  doc.text("Min. estimado (bid)", col1x, y + 4, { align: "center" });
  doc.text("Precio estimado cierre", col2x, y + 3, { align: "center" });
  doc.text("Max. estimado (asking)", col3x, y + 4, { align: "center" });

  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(60, 60, 60);
  doc.text(fmtEur(v.valor_min), col1x, y + 12, { align: "center" });
  doc.setFontSize(16); doc.setTextColor(...BRAND_NAVY);
  doc.text(fmtEur(v.valor_medio), col2x, y + 14, { align: "center" });
  doc.setFontSize(11); doc.setTextColor(60, 60, 60);
  doc.text(fmtEur(v.valor_max), col3x, y + 12, { align: "center" });

  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(120, 120, 120);
  doc.text(`${fmtEur(v.precio_m2)}/m2`, col2x, y + 21, { align: "center" });

  // Confidence
  const confL = v.confianza === "alta" ? "Confianza Alta" : v.confianza === "media" ? "Confianza Media" : "Confianza Baja";
  const confC: readonly [number, number, number] = v.confianza === "alta" ? BRAND_GREEN : v.confianza === "media" ? BRAND_GOLD : BRAND_RED;
  doc.setFillColor(...confC); const confW = doc.getTextWidth(confL) + 8;
  doc.roundedRect(col3x - confW / 2, y + 23, confW, 5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(255, 255, 255);
  doc.text(confL, col3x, y + 26.5, { align: "center" });
  y += 34;

  // Garaje/Trastero
  if (v.precio_garaje_zona || v.precio_trastero_zona) {
    checkPage();
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(80, 80, 80);
    if (v.precio_garaje_zona) { doc.text(`Garaje medio zona: ${fmtEur(v.precio_garaje_zona)}`, m, y); y += 4; }
    if (v.precio_trastero_zona) { doc.text(`Trastero medio zona: ${fmtEur(v.precio_trastero_zona)}`, m, y); y += 4; }
    y += 2;
  }

  // Alquiler
  if (v.alquiler_estimado) {
    kv("Alquiler estimado", `${fmtEur(v.alquiler_estimado)}/mes`);
    if (v.alquiler_m2) kv("Alquiler por m2", `${v.alquiler_m2.toFixed(1)} EUR/m2/mes`);
    const yieldPct = ((v.alquiler_estimado * 12) / v.valor_medio * 100).toFixed(1);
    kv("Rentabilidad bruta", `${yieldPct}% anual`);
  }
  if (v.tiempo_venta_min && v.tiempo_venta_max) kv("Tiempo venta estimado", `${v.tiempo_venta_min}-${v.tiempo_venta_max} meses`);
  if (v.negociacion_min && v.negociacion_max) kv("Negociacion esperada", `-${v.negociacion_min} a -${v.negociacion_max}%`);

  // Factors
  if (v.factores_positivos?.length || v.factores_negativos?.length) {
    y += 2;
    if (v.factores_positivos?.length) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...BRAND_GREEN);
      doc.text("[+] Factores positivos", m, y); y += 4;
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(60, 60, 60);
      for (const f of v.factores_positivos) { checkPage(); doc.text(`  - ${f}`, m, y); y += 3.5; }
      y += 2;
    }
    if (v.factores_negativos?.length) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...BRAND_RED);
      doc.text("[!] Factores a considerar", m, y); y += 4;
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(60, 60, 60);
      for (const f of v.factores_negativos) { checkPage(); doc.text(`  - ${f}`, m, y); y += 3.5; }
      y += 2;
    }
  }

  // ── EVOLUCIÓN TRIMESTRAL ──
  if (v.evolucion_trimestral?.length) {
    checkPage(50);
    section("EVOLUCION DEL PRECIO ESTIMADO");

    const precios = v.evolucion_trimestral.map(e => e.precio);
    const maxP = Math.max(...precios); const minP = Math.min(...precios) * 0.92;
    const chartH = 35, chartW = cw - 10, chartX = m + 5;
    const barW = chartW / v.evolucion_trimestral.length - 2;

    v.evolucion_trimestral.forEach((e, i) => {
      const h = ((e.precio - minP) / (maxP - minP)) * chartH;
      const x = chartX + i * (barW + 2);
      const isLast = i === v.evolucion_trimestral!.length - 1;
      doc.setFillColor(isLast ? BRAND_BLUE[0] : 180, isLast ? BRAND_BLUE[1] : 210, isLast ? BRAND_BLUE[2] : 230);
      doc.roundedRect(x, y + chartH - h, barW, h, 1, 1, "F");

      doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.setTextColor(120, 120, 120);
      doc.text(e.trimestre, x + barW / 2, y + chartH + 4, { align: "center" });
      if (isLast) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(...BRAND_NAVY);
        doc.text(fmtEur(e.precio), x + barW / 2, y - 2, { align: "center" });
      }
    });

    y += chartH + 10;
    if (v.evolucion_12m != null) {
      const evoC = v.evolucion_12m >= 0 ? BRAND_GREEN : BRAND_RED;
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(evoC[0], evoC[1], evoC[2]);
      doc.text(`Variacion interanual: ${v.evolucion_12m >= 0 ? "+" : ""}${v.evolucion_12m}%`, m, y); y += 6;
    }
  }

  // ── TESTIGOS COMPRAVENTA ──
  if (v.testigos_compraventa?.length) {
    checkPage(50);
    section(`TESTIGOS DE COMPRA-VENTA (${v.testigos_compraventa.length})`);

    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100, 100, 100);
    doc.text("Inmuebles en el barrio con superficie +-30% respecto al analizado.", m, y); y += 5;

    // Table header
    doc.setFillColor(...GRAY_LIGHT); doc.rect(m, y - 3, cw, 6, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80);
    const cols = [0, cw * 0.32, cw * 0.47, cw * 0.58, cw * 0.68, cw * 0.78, cw * 0.88];
    const hdrs = ["Inmueble", "Precio", "EUR/m2", "m2", "DEM", "Dist.", "Dif."];
    hdrs.forEach((h, i) => doc.text(h, m + 2 + cols[i], y));
    y += 5;

    for (const t of v.testigos_compraventa) {
      checkPage(10);
      doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(40, 40, 40);
      const descLines = doc.splitTextToSize(`${t.direccion} - ${t.descripcion}`, cw * 0.30);
      doc.text(descLines, m + 2, y);
      doc.setFont("helvetica", "bold"); doc.text(fmtEur(t.precio), m + 2 + cols[1], y);
      doc.setFont("helvetica", "normal"); doc.text(`${fmtN(t.precio_m2)}`, m + 2 + cols[2], y);
      doc.text(`${t.superficie}`, m + 2 + cols[3], y);
      doc.text(`${t.dem}d`, m + 2 + cols[4], y);
      doc.text(`${t.distancia_km}km`, m + 2 + cols[5], y);
      doc.setFontSize(6); doc.setTextColor(100, 100, 100);
      const difLines = doc.splitTextToSize(t.diferencias, cw * 0.12);
      doc.text(difLines, m + 2 + cols[6], y);
      y += Math.max(descLines.length, difLines.length) * 3 + 2.5;
      doc.setDrawColor(230, 230, 230); doc.setLineWidth(0.15); doc.line(m, y, pw - m, y); y += 1.5;
    }
    y += 4;
  }

  // ── TESTIGOS ALQUILER ──
  if (v.testigos_alquiler?.length) {
    checkPage(40);
    section(`TESTIGOS DE ALQUILER (${v.testigos_alquiler.length})`);

    doc.setFillColor(...GRAY_LIGHT); doc.rect(m, y - 3, cw, 6, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(6.5); doc.setTextColor(80, 80, 80);
    const colsA = [0, cw * 0.32, cw * 0.47, cw * 0.58, cw * 0.68, cw * 0.78, cw * 0.88];
    ["Inmueble", "EUR/mes", "EUR/m2", "m2", "DEM", "Dist.", "Dif."].forEach((h, i) => doc.text(h, m + 2 + colsA[i], y));
    y += 5;

    for (const t of v.testigos_alquiler) {
      checkPage(8);
      doc.setFont("helvetica", "normal"); doc.setFontSize(6.5); doc.setTextColor(40, 40, 40);
      const dl = doc.splitTextToSize(`${t.direccion} - ${t.descripcion}`, cw * 0.30);
      doc.text(dl, m + 2, y);
      doc.setFont("helvetica", "bold"); doc.text(`${fmtN(t.precio_mensual)}`, m + 2 + colsA[1], y);
      doc.setFont("helvetica", "normal"); doc.text(`${t.precio_m2_mes?.toFixed(1)}`, m + 2 + colsA[2], y);
      doc.text(`${t.superficie}`, m + 2 + colsA[3], y);
      doc.text(`${t.dem}d`, m + 2 + colsA[4], y);
      doc.text(`${t.distancia_km}km`, m + 2 + colsA[5], y);
      doc.setFontSize(6); doc.setTextColor(100, 100, 100);
      doc.text(t.diferencias, m + 2 + colsA[6], y);
      y += dl.length * 3 + 2.5;
      doc.setDrawColor(230, 230, 230); doc.setLineWidth(0.15); doc.line(m, y, pw - m, y); y += 1.5;
    }
    y += 4;
  }

  // ── DATOS ZONA ──
  if (v.datos_zona) {
    checkPage(40);
    section("DATOS SOCIODEMOGRAFICOS DE LA ZONA");
    const dz = v.datos_zona;
    if (dz.poblacion) kv("Poblacion", fmtN(dz.poblacion));
    if (dz.renta_media) kv("Renta media familiar", `${fmtEur(dz.renta_media)}/ano`);
    if (dz.tasa_actividad) kv("Tasa de actividad", `${dz.tasa_actividad}%`);
    if (dz.poblacion_extranjera_pct != null) kv("Poblacion extranjera", `${dz.poblacion_extranjera_pct}%`);
    if (dz.hogares_1persona_pct != null) kv("Hogares unipersonales", `${dz.hogares_1persona_pct}%`);
    if (dz.hogares_familia_pct != null) kv("Hogares familiares", `${dz.hogares_familia_pct}%`);
    if (dz.edad_media_edificacion) kv("Edad media edificacion", `${dz.edad_media_edificacion} anos`);
    if (dz.inmuebles_residenciales) kv("Inmuebles residenciales zona", fmtN(dz.inmuebles_residenciales));
  }

  // Tipología
  if (v.tipologia_zona) {
    checkPage(30);
    y += 2; doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BRAND_NAVY);
    doc.text("Tipologia de la zona", m, y); y += 5;

    const drawBars = (items: { rango: string; porcentaje: number }[], label: string) => {
      checkPage(items.length * 5 + 8);
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(80, 80, 80);
      doc.text(label, m, y); y += 4;
      for (const it of items) {
        doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100, 100, 100);
        doc.text(it.rango, m, y); doc.text(`${it.porcentaje}%`, m + 30, y);
        doc.setFillColor(220, 230, 240); doc.rect(m + 40, y - 2.5, 80, 3.5, "F");
        doc.setFillColor(...BRAND_BLUE); doc.rect(m + 40, y - 2.5, Math.min(it.porcentaje * 0.8, 80), 3.5, "F");
        y += 5;
      }
      y += 2;
    };

    if (v.tipologia_zona.por_superficie) drawBars(v.tipologia_zona.por_superficie, "Distribucion por superficie:");
    if (v.tipologia_zona.por_antiguedad) drawBars(v.tipologia_zona.por_antiguedad, "Distribucion por antiguedad:");
  }

  // Puntos de interés
  if (v.puntos_interes) {
    checkPage(15);
    y += 2; doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BRAND_NAVY);
    doc.text("Puntos de interes cercanos", m, y); y += 5;
    const pi = v.puntos_interes;
    if (pi.transporte != null) kv("Transporte (paradas/estaciones)", pi.transporte);
    if (pi.comercio != null) kv("Comercio", pi.comercio);
    if (pi.educacion != null) kv("Centros educativos", pi.educacion);
    if (pi.sanidad != null) kv("Centros sanitarios", pi.sanidad);
    if (pi.zonas_verdes != null) kv("Parques y jardines", pi.zonas_verdes);
  }

  // ── INSIGHT IKESA ──
  if (v.insight) {
    checkPage(20);
    section("INSIGHTS IKESA");
    doc.setFillColor(240, 250, 255); doc.setDrawColor(...BRAND_BLUE); doc.setLineWidth(0.4);
    const il = doc.splitTextToSize(`"${v.insight}"`, cw - 12);
    const ih = il.length * 4.5 + 8;
    doc.roundedRect(m, y - 2, cw, ih, 3, 3, "FD");
    doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(30, 50, 70);
    doc.text(il, m + 6, y + 4);
    y += ih + 4;
  }

  // Geo links
  const geoQ = encodeURIComponent(`${data.direccion}, ${data.municipio}, ${data.provincia}, Espana`);
  link("Ver en Google Maps", `https://www.google.com/maps/search/?api=1&query=${geoQ}`);
  const ws = data.municipio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  link("Info del barrio", `https://www.wikibarrio.es/${ws}`);

  // ── METODOLOGÍA ──
  checkPage(40);
  section("METODOLOGIA");
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(60, 60, 60);
  const metLines = doc.splitTextToSize(
    "Este informe aplica el metodo de comparacion reconocido por la normativa internacional de valoracion y la Orden ECO/805/2003 (Art. 21). " +
    "Para cada inmueble se seleccionan comparables por cercania y caracteristicas, de entre los inmuebles en oferta, debidamente homogeneizados segun superficie (+-30%), tipologia, estado y ubicacion.\n\n" +
    "Precio minimo estimado (bid price): precio al que los compradores comienzan a interesarse.\n" +
    "Precio maximo estimado (asking price): precio de oferta del vendedor.\n" +
    "Precio estimado de cierre: precio acordado entre comprador y vendedor, calculado considerando precios reales de cierre y rentabilidad inversora.", cw - 4);
  doc.text(metLines, m + 2, y); y += metLines.length * 3.5 + 4;

  // ── DISCLAIMER ──
  checkPage(25); y += 3;
  doc.setFillColor(252, 248, 240); doc.setDrawColor(220, 180, 100); doc.setLineWidth(0.3);
  const disc = "Los informes de estimacion de precios tienen caracter orientativo y no constituyen tasaciones oficiales segun la Orden ECO/805/2003. Este informe no tiene validez legal. IKESA no se responsabiliza de las decisiones tomadas en base a esta estimacion. Para una tasacion oficial, consulte con un tasador homologado.";
  const dl2 = doc.splitTextToSize(disc, cw - 10);
  const dh = dl2.length * 3.5 + 8;
  doc.roundedRect(m, y - 2, cw, dh, 2, 2, "FD");
  doc.setFont("helvetica", "bold"); doc.setFontSize(7); doc.setTextColor(160, 120, 40);
  doc.text("AVISO LEGAL", m + 5, y + 3);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100, 80, 40);
  doc.text(dl2, m + 5, y + 7);

  // ── FOOTER all pages ──
  const tp = doc.getNumberOfPages();
  for (let i = 2; i <= tp; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BRAND_BLUE); doc.setLineWidth(0.5); doc.line(m, 284, pw - m, 284);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...BRAND_NAVY);
    doc.text("IKESA Inmobiliaria - Informe Confidencial", m, 289);
    doc.setTextColor(120, 120, 120);
    doc.text(`Fuente: IKESA | Catastro | INE (est.)`, pw / 2, 289, { align: "center" });
    doc.setTextColor(140, 140, 140);
    doc.text(`Pagina ${i} de ${tp}`, pw - m, 289, { align: "right" });
  }

  doc.save(`IKESA-Valoracion-${data.municipio.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const loadCatastroFachadaImage = async (refCatastral: string): Promise<string | null> => {
  const url = `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/OVCFotoFachada.svc/RecuperarFotoFachadaRC?ReferenciaCatastral=${refCatastral}`;
  return loadImageWithTimeout(url, 6000);
};

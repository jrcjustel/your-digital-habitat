import jsPDF from "jspdf";
import logoUrl from "@/assets/ikesa-logo-color.png";

const BRAND_NAVY = [3, 54, 81] as const;
const BRAND_BLUE = [63, 184, 234] as const;
const BRAND_GREEN = [34, 139, 34] as const;
const BRAND_RED = [200, 50, 50] as const;
const BRAND_GOLD = [180, 140, 20] as const;
const GRAY_LIGHT = [245, 247, 250] as const;

interface Comparable {
  descripcion: string;
  precio_m2: number;
  dias_mercado: number;
  diferencias: string;
}

interface ValuationPdfData {
  direccion: string;
  municipio: string;
  provincia: string;
  codigo_postal?: string;
  tipo_inmueble: string;
  superficie_m2: number;
  habitaciones?: number;
  banos?: number;
  anio_construccion?: number;
  estado?: string;
  planta?: number;
  tiene_garaje: boolean;
  tiene_trastero: boolean;
  tiene_ascensor: boolean;
  nombre: string;
  email: string;
  telefono?: string;
  valuation: {
    valor_min: number;
    valor_max: number;
    valor_medio: number;
    precio_m2: number;
    confianza: string;
    factores_positivos: string[];
    factores_negativos: string[];
    comentario: string;
    alquiler_estimado?: number;
    tiempo_venta_min?: number;
    tiempo_venta_max?: number;
    negociacion_min?: number;
    negociacion_max?: number;
    renta_media_zona?: number;
    precio_m2_zona_min?: number;
    precio_m2_zona_max?: number;
    precio_m2_zona_mediana?: number;
    evolucion_12m?: number;
    insight?: string;
    comparables?: Comparable[];
  };
  catastro?: {
    ref_catastral: string;
    uso_catastral?: string;
    uso_predominante?: string;
    clase?: string;
    superficie_construida?: number;
    superficie_suelo?: number;
    coeficiente_participacion?: string;
    usos_detalle?: { uso: string; superficie: number; planta: string }[];
    urls?: { ficha_catastral?: string; cartografia?: string };
  };
  catastroFachadaBase64?: string;
  catastroCartografiaBase64?: string;
}

const tipoLabels: Record<string, string> = {
  piso: "Piso / Apartamento", casa: "Casa / Chalet", adosado: "Adosado / Pareado",
  atico: "Atico", duplex: "Duplex", estudio: "Estudio", local: "Local comercial",
  oficina: "Oficina", terreno: "Terreno", garaje: "Garaje", trastero: "Trastero", nave: "Nave industrial",
};

const estadoLabels: Record<string, string> = {
  nuevo: "Obra nueva", buen_estado: "Buen estado", reformado: "Reformado", a_reformar: "A reformar",
};

const fmtEur = (n: number) => `${n.toLocaleString("es-ES")} EUR`;
const fmtK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k EUR` : `${n} EUR`;

const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject("No canvas context"); return; }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject("Image load error");
    img.src = url;
  });
};

const loadImageWithTimeout = async (url: string, timeout = 5000): Promise<string | null> => {
  try {
    const result = await Promise.race([
      loadImageAsBase64(url),
      new Promise<string>((_, reject) => setTimeout(() => reject("timeout"), timeout)),
    ]);
    return result;
  } catch {
    return null;
  }
};

export const generateValuationPdf = async (data: ValuationPdfData) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth(); // 210
  const ph = doc.internal.pageSize.getHeight(); // 297
  const m = 16; // margin
  const cw = pw - m * 2; // content width
  let y = 0;

  const checkPage = (needed = 12) => {
    if (y > ph - 18 - needed) { doc.addPage(); y = 20; }
  };

  // ─── Helpers ──────────────────────────────────────────
  const drawSectionHeader = (title: string) => {
    checkPage(14);
    y += 4;
    doc.setFillColor(...BRAND_NAVY);
    doc.rect(m, y - 4, cw, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(title, m + 3, y + 1);
    y += 10;
  };

  const addKV = (label: string, value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") return;
    checkPage();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(label, m, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(String(value), pw - m, y, { align: "right" });
    y += 5.5;
  };

  const addLink = (label: string, url: string) => {
    checkPage();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(label + ": ", m, y);
    const lw = doc.getTextWidth(label + ": ");
    doc.setTextColor(...BRAND_BLUE);
    const disp = url.length > 60 ? url.substring(0, 57) + "..." : url;
    doc.textWithLink(disp, m + lw, y, { url });
    y += 5;
  };

  // Load logo
  let logoBase64: string | null = null;
  try { logoBase64 = await loadImageAsBase64(logoUrl); } catch {}

  // ═══════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ═══════════════════════════════════════════════════════
  // Navy background
  doc.setFillColor(...BRAND_NAVY);
  doc.rect(0, 0, pw, ph, "F");

  // Accent stripe
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 85, pw, 3, "F");

  // Logo
  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", m, 20, 50, 20); } catch {}
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text("IKESA", m, 36);
  }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text("Informe DataVenue", m, 65);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Valoracion Profesional de Inmueble", m, 75);

  // Property address block
  y = 100;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(data.direccion, cw);
  doc.text(titleLines, m, y);
  y += titleLines.length * 7 + 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(180, 210, 230);
  doc.text(`${data.municipio}, ${data.provincia}${data.codigo_postal ? ` - CP ${data.codigo_postal}` : ""}`, m, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(140, 180, 200);
  doc.text(`${tipoLabels[data.tipo_inmueble] || data.tipo_inmueble} | ${data.superficie_m2} m2`, m, y);
  y += 15;

  // Valuation highlight on cover
  doc.setFillColor(255, 255, 255, 0.1);
  doc.roundedRect(m, y, cw, 35, 3, 3, "F");
  doc.setDrawColor(...BRAND_BLUE);
  doc.setLineWidth(0.8);
  doc.roundedRect(m, y, cw, 35, 3, 3, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("VALOR ESTIMADO", pw / 2, y + 8, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text(fmtEur(data.valuation.valor_medio), pw / 2, y + 22, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 230);
  doc.text(`Rango: ${fmtEur(data.valuation.valor_min)} - ${fmtEur(data.valuation.valor_max)}`, pw / 2, y + 30, { align: "center" });

  // Satellite / facade image placeholder
  if (data.catastroFachadaBase64) {
    try {
      doc.addImage(data.catastroFachadaBase64, "JPEG", pw - m - 55, 180, 55, 40);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(1);
      doc.rect(pw - m - 55, 180, 55, 40, "S");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(140, 180, 200);
      doc.text("Fachada (Catastro)", pw - m - 27, 225, { align: "center" });
    } catch {}
  }

  // Date and client
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(140, 180, 200);
  doc.text(`Preparado para: ${data.nombre}`, m, 250);
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`, m, 257);
  doc.text("Ref.: DV-" + Date.now().toString(36).toUpperCase(), m, 264);

  // Cover footer
  doc.setFontSize(7);
  doc.setTextColor(100, 140, 160);
  doc.text("IKESA Inmobiliaria | www.ikesa.es | Informe DataVenue Confidencial", pw / 2, 285, { align: "center" });

  // ═══════════════════════════════════════════════════════
  // PAGE 2 — EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════════════════
  doc.addPage();
  y = 15;

  // Mini header
  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", m, 8, 25, 10); } catch {}
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Informe DataVenue", pw - m, 14, { align: "right" });
  doc.setDrawColor(...BRAND_BLUE);
  doc.setLineWidth(0.5);
  doc.line(m, 20, pw - m, 20);
  y = 26;

  drawSectionHeader("RESUMEN EJECUTIVO");

  // KPI Cards row
  const v = data.valuation;
  const kpis = [
    { label: "Precio recomendado", value: `${fmtK(v.valor_min)}-${fmtK(v.valor_max)}`, accent: true },
    { label: "Alquiler estimado", value: v.alquiler_estimado ? `${v.alquiler_estimado} EUR/mes` : "N/D" },
    { label: "Tiempo venta est.", value: v.tiempo_venta_min && v.tiempo_venta_max ? `${v.tiempo_venta_min}-${v.tiempo_venta_max} meses` : "N/D" },
    { label: "Negociacion esperada", value: v.negociacion_min && v.negociacion_max ? `-${v.negociacion_min}-${v.negociacion_max}%` : "N/D" },
  ];

  const kpiW = (cw - 9) / 4;
  kpis.forEach((kpi, i) => {
    const x = m + i * (kpiW + 3);
    if (kpi.accent) {
      doc.setFillColor(240, 250, 255);
      doc.setDrawColor(...BRAND_BLUE);
    } else {
      doc.setFillColor(...GRAY_LIGHT);
      doc.setDrawColor(220, 220, 220);
    }
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, kpiW, 22, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(kpi.accent ? 9 : 8.5);
    doc.setTextColor(kpi.accent ? BRAND_BLUE[0] : 40, kpi.accent ? BRAND_BLUE[1] : 40, kpi.accent ? BRAND_BLUE[2] : 40);
    const valLines = doc.splitTextToSize(kpi.value, kpiW - 4);
    doc.text(valLines, x + kpiW / 2, y + 8, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    doc.text(kpi.label, x + kpiW / 2, y + 18, { align: "center" });
  });
  y += 28;

  // Confidence badge
  const confLabel = v.confianza === "alta" ? "Confianza Alta" : v.confianza === "media" ? "Confianza Media" : "Confianza Baja";
  const confColor: readonly [number, number, number] = v.confianza === "alta" ? BRAND_GREEN : v.confianza === "media" ? BRAND_GOLD : BRAND_RED;
  doc.setFillColor(...confColor);
  const confW = doc.getTextWidth(confLabel) * 1.2 + 10;
  doc.roundedRect(m, y, confW, 5.5, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(confLabel, m + confW / 2, y + 3.8, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`${fmtEur(v.precio_m2)}/m2`, m + confW + 5, y + 3.5);
  y += 10;

  // Factors
  if (v.factores_positivos?.length || v.factores_negativos?.length) {
    const halfW = (cw - 6) / 2;

    if (v.factores_positivos?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...BRAND_GREEN);
      doc.text("[+] Factores positivos", m, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      for (const f of v.factores_positivos) {
        checkPage();
        const lines = doc.splitTextToSize(`  - ${f}`, halfW);
        doc.text(lines, m, y);
        y += lines.length * 3.8;
      }
      y += 3;
    }

    if (v.factores_negativos?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...BRAND_RED);
      doc.text("[!] Factores a considerar", m, y);
      y += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      for (const f of v.factores_negativos) {
        checkPage();
        const lines = doc.splitTextToSize(`  - ${f}`, halfW);
        doc.text(lines, m, y);
        y += lines.length * 3.8;
      }
      y += 3;
    }
  }

  // ═══════════════════════════════════════════════════════
  // CHARTS SECTION — Price distribution bar + evolution
  // ═══════════════════════════════════════════════════════
  drawSectionHeader("ANALISIS DE MERCADO");

  // Zone price bar chart (horizontal bars)
  if (v.precio_m2_zona_min && v.precio_m2_zona_max && v.precio_m2_zona_mediana) {
    checkPage(45);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND_NAVY);
    doc.text("Distribucion de precios/m2 en la zona", m, y);
    y += 6;

    const chartX = m + 5;
    const chartW = cw - 10;
    const barH = 8;
    const maxVal = v.precio_m2_zona_max * 1.1;

    const bars = [
      { label: "Min. zona", value: v.precio_m2_zona_min, color: GRAY_LIGHT },
      { label: "Mediana zona", value: v.precio_m2_zona_mediana, color: [200, 220, 240] as const },
      { label: "Tu inmueble", value: v.precio_m2, color: BRAND_BLUE },
      { label: "Max. zona", value: v.precio_m2_zona_max, color: [220, 230, 240] as const },
    ];

    for (const bar of bars) {
      const w = (bar.value / maxVal) * chartW;
      doc.setFillColor(bar.color[0], bar.color[1], bar.color[2]);
      doc.roundedRect(chartX, y, Math.max(w, 8), barH, 1, 1, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 80);
      doc.text(bar.label, chartX + Math.max(w, 8) + 3, y + 5.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      const isInside = w > 35;
      if (isInside) {
        doc.setTextColor(255, 255, 255);
        doc.text(`${bar.value.toLocaleString("es-ES")} EUR/m2`, chartX + 3, y + 5.5);
      } else {
        doc.setTextColor(40, 40, 40);
        doc.text(`${bar.value.toLocaleString("es-ES")}`, chartX + Math.max(w, 8) + 3 + doc.getTextWidth(bar.label + "  "), y + 5.5);
      }

      y += barH + 3;
    }
    y += 4;
  }

  // 12m evolution indicator
  if (v.evolucion_12m !== undefined && v.evolucion_12m !== null) {
    checkPage(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND_NAVY);
    doc.text("Evolucion ultimos 12 meses", m, y);
    y += 5;

    const evoColor = v.evolucion_12m >= 0 ? BRAND_GREEN : BRAND_RED;
    const evoSign = v.evolucion_12m >= 0 ? "+" : "";
    doc.setFillColor(evoColor[0], evoColor[1], evoColor[2]);
    doc.roundedRect(m, y, 30, 8, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`${evoSign}${v.evolucion_12m}%`, m + 15, y + 5.5, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("variacion interanual de precios en la zona", m + 34, y + 5.5);
    y += 14;
  }

  // Income data
  if (v.renta_media_zona) {
    checkPage(10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Renta media familiar zona (INE est.):", m, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(`${v.renta_media_zona.toLocaleString("es-ES")} EUR/ano`, pw - m, y, { align: "right" });
    y += 6;
  }

  // Rental yield
  if (v.alquiler_estimado && v.valor_medio) {
    checkPage(10);
    const yieldPct = ((v.alquiler_estimado * 12) / v.valor_medio * 100).toFixed(1);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Rentabilidad bruta alquiler:", m, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_GREEN);
    doc.text(`${yieldPct}% anual`, pw - m, y, { align: "right" });
    y += 8;
  }

  // ═══════════════════════════════════════════════════════
  // COMPARABLES TABLE
  // ═══════════════════════════════════════════════════════
  if (v.comparables?.length) {
    checkPage(50);
    drawSectionHeader("COMPARABLES (TESTIGOS)");

    // Table header
    const colWidths = [cw * 0.35, cw * 0.18, cw * 0.17, cw * 0.30];
    const headers = ["Inmueble", "Precio/m2", "Dias mercado", "Diferencias"];
    doc.setFillColor(...GRAY_LIGHT);
    doc.rect(m, y - 3, cw, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);

    let colX = m + 2;
    headers.forEach((h, i) => {
      doc.text(h, colX, y + 1);
      colX += colWidths[i];
    });
    y += 7;

    // Table rows
    for (const comp of v.comparables) {
      checkPage(10);
      colX = m + 2;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(40, 40, 40);

      const descLines = doc.splitTextToSize(comp.descripcion, colWidths[0] - 4);
      doc.text(descLines, colX, y);
      colX += colWidths[0];

      doc.setFont("helvetica", "bold");
      doc.text(`${comp.precio_m2.toLocaleString("es-ES")} EUR`, colX, y);
      colX += colWidths[1];

      doc.setFont("helvetica", "normal");
      doc.text(`${comp.dias_mercado} dias`, colX, y);
      colX += colWidths[2];

      const diffLines = doc.splitTextToSize(comp.diferencias, colWidths[3] - 4);
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(diffLines, colX, y);

      const rowH = Math.max(descLines.length, diffLines.length) * 3.5 + 3;
      y += rowH;

      // Separator line
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(m, y, pw - m, y);
      y += 2;
    }
    y += 4;
  }

  // ═══════════════════════════════════════════════════════
  // TECHNICAL DATA
  // ═══════════════════════════════════════════════════════
  checkPage(40);
  drawSectionHeader("DATOS TECNICOS");

  addKV("Tipo de inmueble", tipoLabels[data.tipo_inmueble] || data.tipo_inmueble);
  addKV("Superficie", `${data.superficie_m2} m2`);
  if (data.habitaciones) addKV("Habitaciones", data.habitaciones);
  if (data.banos) addKV("Banos", data.banos);
  if (data.anio_construccion) addKV("Ano de construccion", data.anio_construccion);
  if (data.estado) addKV("Estado", estadoLabels[data.estado] || data.estado);
  if (data.planta !== undefined && data.planta !== null) addKV("Planta", data.planta === 0 ? "Bajo" : data.planta);
  addKV("Garaje", data.tiene_garaje ? "Si" : "No");
  addKV("Trastero", data.tiene_trastero ? "Si" : "No");
  addKV("Ascensor", data.tiene_ascensor ? "Si" : "No");

  // Catastro data
  if (data.catastro) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND_NAVY);
    doc.text("Datos Catastro", m, y);
    y += 5;

    addKV("Referencia catastral", data.catastro.ref_catastral);
    if (data.catastro.uso_catastral) addKV("Uso catastral", data.catastro.uso_catastral);
    if (data.catastro.uso_predominante) addKV("Uso predominante", data.catastro.uso_predominante);
    if (data.catastro.clase) addKV("Clase", data.catastro.clase);
    if (data.catastro.superficie_construida) addKV("Superficie construida", `${data.catastro.superficie_construida} m2`);
    if (data.catastro.superficie_suelo) addKV("Superficie suelo", `${data.catastro.superficie_suelo} m2`);
    if (data.catastro.coeficiente_participacion) addKV("Coef. participacion", data.catastro.coeficiente_participacion);

    if (data.catastro.usos_detalle?.length) {
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text("Desglose de superficies:", m, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      for (const u of data.catastro.usos_detalle) {
        checkPage();
        doc.setTextColor(100, 100, 100);
        doc.text(`${u.uso}${u.planta ? ` (${u.planta})` : ""}: ${u.superficie} m2`, m + 4, y);
        y += 3.5;
      }
      y += 2;
    }

    if (data.catastro.urls?.ficha_catastral) addLink("Ficha catastral", data.catastro.urls.ficha_catastral);
    if (data.catastro.urls?.cartografia) addLink("Cartografia", data.catastro.urls.cartografia);
  }

  // INE data
  if (v.renta_media_zona) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND_NAVY);
    doc.text("Datos Socioeconomicos (INE est.)", m, y);
    y += 5;
    addKV("Renta media familiar", `${v.renta_media_zona.toLocaleString("es-ES")} EUR/ano`);
  }

  // Facade image
  if (data.catastroFachadaBase64) {
    checkPage(55);
    y += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text("Fotografia de fachada (Catastro):", m, y);
    y += 3;
    try {
      doc.addImage(data.catastroFachadaBase64, "JPEG", m, y, 75, 45);
      y += 48;
    } catch {}
  }

  // ═══════════════════════════════════════════════════════
  // IKESA INSIGHTS
  // ═══════════════════════════════════════════════════════
  checkPage(30);
  drawSectionHeader("INSIGHTS IKESA");

  // Professional insight box
  const insightText = v.insight || v.comentario || "";
  if (insightText) {
    doc.setFillColor(240, 250, 255);
    doc.setDrawColor(...BRAND_BLUE);
    doc.setLineWidth(0.5);
    const iLines = doc.splitTextToSize(`"${insightText}"`, cw - 14);
    const iH = iLines.length * 4.5 + 10;
    doc.roundedRect(m, y - 2, cw, iH, 3, 3, "FD");

    // Lightning icon placeholder
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND_BLUE);
    doc.text("[>]", m + 4, y + 5);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(30, 50, 70);
    doc.text(iLines, m + 14, y + 5);
    y += iH + 5;
  }

  // Summary comment if different from insight
  if (v.comentario && v.insight && v.comentario !== v.insight) {
    checkPage(15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const cLines = doc.splitTextToSize(v.comentario, cw - 4);
    doc.text(cLines, m + 2, y);
    y += cLines.length * 3.8 + 4;
  }

  // Geolocation links
  y += 3;
  const geoQuery = encodeURIComponent(`${data.direccion}, ${data.municipio}, ${data.provincia}, Espana`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${geoQuery}`;
  addLink("Ver en Google Maps", mapsUrl);
  const wikiSlug = data.municipio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  addLink("Info del barrio (Wikibarrio)", `https://www.wikibarrio.es/${wikiSlug}`);

  // ═══════════════════════════════════════════════════════
  // DISCLAIMER
  // ═══════════════════════════════════════════════════════
  checkPage(25);
  y += 5;
  doc.setFillColor(252, 248, 240);
  doc.setDrawColor(220, 180, 100);
  doc.setLineWidth(0.3);
  const discText = "Este informe es una estimacion orientativa generada mediante inteligencia artificial y datos publicos del mercado inmobiliario espanol. No constituye una tasacion oficial. Para una valoracion vinculante, consulte con un tasador homologado. IKESA no se responsabiliza de las decisiones tomadas en base a esta estimacion.";
  const discLines = doc.splitTextToSize(discText, cw - 10);
  const discH = discLines.length * 3.5 + 8;
  doc.roundedRect(m, y - 2, cw, discH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(160, 120, 40);
  doc.text("AVISO LEGAL", m + 5, y + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 80, 40);
  doc.text(discLines, m + 5, y + 7);

  // ═══════════════════════════════════════════════════════
  // FOOTER on all pages
  // ═══════════════════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      doc.setDrawColor(...BRAND_BLUE);
      doc.setLineWidth(0.5);
      doc.line(m, 284, pw - m, 284);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...BRAND_NAVY);
      doc.text("IKESA Inmobiliaria - Informe DataVenue Confidencial", m, 289);
      doc.setTextColor(140, 140, 140);
      doc.text(`Pagina ${i} de ${totalPages}`, pw - m, 289, { align: "right" });
    }
  }

  const filename = `IKESA-DataVenue-${data.municipio.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

/** Attempt to load catastro facade image as base64 */
export const loadCatastroFachadaImage = async (refCatastral: string): Promise<string | null> => {
  const url = `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/OVCFotoFachada.svc/RecuperarFotoFachadaRC?ReferenciaCatastral=${refCatastral}`;
  return loadImageWithTimeout(url, 6000);
};

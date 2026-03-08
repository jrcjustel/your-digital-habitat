import jsPDF from "jspdf";
import logoUrl from "@/assets/ikesa-logo-color.png";

const BRAND_NAVY = [3, 54, 81] as const;
const BRAND_BLUE = [63, 184, 234] as const;
const BRAND_GREEN = [34, 139, 34] as const;
const BRAND_RED = [200, 50, 50] as const;

interface ValuationPdfData {
  // Property info
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
  // Contact
  nombre: string;
  email: string;
  telefono?: string;
  // Valuation result
  valuation: {
    valor_min: number;
    valor_max: number;
    valor_medio: number;
    precio_m2: number;
    confianza: string;
    factores_positivos: string[];
    factores_negativos: string[];
    comentario: string;
  };
  // Catastro data (optional)
  catastro?: {
    ref_catastral: string;
    uso_catastral?: string;
    uso_predominante?: string;
    clase?: string;
    superficie_construida?: number;
    superficie_suelo?: number;
    coeficiente_participacion?: string;
    usos_detalle?: { uso: string; superficie: number; planta: string }[];
    urls?: {
      ficha_catastral?: string;
      cartografia?: string;
    };
  };
  // Catastro images (base64)
  catastroFachadaBase64?: string;
  catastroCartografiaBase64?: string;
}

const tipoLabels: Record<string, string> = {
  piso: "Piso / Apartamento", casa: "Casa / Chalet", adosado: "Adosado / Pareado",
  atico: "Ático", duplex: "Dúplex", estudio: "Estudio", local: "Local comercial",
  oficina: "Oficina", terreno: "Terreno", garaje: "Garaje", trastero: "Trastero", nave: "Nave industrial",
};

const estadoLabels: Record<string, string> = {
  nuevo: "Obra nueva", buen_estado: "Buen estado", reformado: "Reformado", a_reformar: "A reformar",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

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
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // ── Helpers ──────────────────────────────────────────────
  const checkPage = (needed = 12) => {
    if (y > 282 - needed) { doc.addPage(); y = 20; }
  };

  const addLine = (label: string, value: string | number | undefined | null) => {
    if (value === undefined || value === null || value === "") return;
    checkPage();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(String(value), pageWidth - margin, y, { align: "right" });
    y += 5.5;
  };

  const addSection = (title: string) => {
    checkPage(14);
    y += 3;
    doc.setFillColor(...BRAND_NAVY);
    doc.rect(margin, y - 4, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, y + 1);
    y += 10;
  };

  const addLink = (label: string, url: string) => {
    checkPage();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(label + ": ", margin, y);
    const labelWidth = doc.getTextWidth(label + ": ");
    doc.setTextColor(...BRAND_BLUE);
    const displayUrl = url.length > 65 ? url.substring(0, 62) + "..." : url;
    doc.textWithLink(displayUrl, margin + labelWidth, y, { url });
    y += 5;
  };

  // ── Header ────────────────────────────────────────────────
  doc.setFillColor(...BRAND_NAVY);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 40, pageWidth, 1.5, "F");

  try {
    const logoBase64 = await loadImageAsBase64(logoUrl);
    doc.addImage(logoBase64, "PNG", margin, 7, 35, 14);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("IKESA", margin, 20);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("Informe de Valoración", pageWidth - margin, 17, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`, pageWidth - margin, 24, { align: "right" });
  doc.setTextColor(180, 200, 220);
  doc.text(`Para: ${data.nombre}`, pageWidth - margin, 30, { align: "right" });

  y = 48;

  // ── Property Title ────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_NAVY);
  const title = `${tipoLabels[data.tipo_inmueble] || data.tipo_inmueble} en ${data.direccion}`;
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 1;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`${data.municipio}, ${data.provincia}${data.codigo_postal ? ` · CP ${data.codigo_postal}` : ""}`, margin, y);
  y += 8;

  // ── Valuation Summary (highlighted box) ────────────────────
  const boxH = 32;
  doc.setFillColor(240, 247, 252);
  doc.roundedRect(margin, y - 3, contentWidth, boxH, 3, 3, "F");
  doc.setDrawColor(...BRAND_BLUE);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y - 3, contentWidth, boxH, 3, 3, "S");

  const col1 = margin + contentWidth * 0.17;
  const col2 = margin + contentWidth * 0.5;
  const col3 = margin + contentWidth * 0.83;

  // Min
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Valor mínimo", col1, y + 5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(60, 60, 60);
  doc.text(fmt(data.valuation.valor_min), col1, y + 14, { align: "center" });

  // Mid (highlighted)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("Valor estimado", col2, y + 4, { align: "center" });
  doc.setFontSize(18);
  doc.setTextColor(...BRAND_NAVY);
  doc.text(fmt(data.valuation.valor_medio), col2, y + 16, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`${fmt(data.valuation.precio_m2)}/m²`, col2, y + 22, { align: "center" });

  // Max
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Valor máximo", col3, y + 5, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(60, 60, 60);
  doc.text(fmt(data.valuation.valor_max), col3, y + 14, { align: "center" });

  // Confidence badge
  const confLabel = data.valuation.confianza === "alta" ? "Confianza Alta" : data.valuation.confianza === "media" ? "Confianza Media" : "Confianza Baja";
  const confColor: readonly [number, number, number] = data.valuation.confianza === "alta" ? BRAND_GREEN : data.valuation.confianza === "media" ? [180, 140, 20] as const : BRAND_RED;
  doc.setFillColor(...confColor);
  const confW = doc.getTextWidth(confLabel) + 8;
  doc.roundedRect(col3 - confW / 2, y + 20, confW, 5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text(confLabel, col3, y + 23.5, { align: "center" });

  y += boxH + 6;

  // ── Factors ────────────────────────────────────────────────
  if (data.valuation.factores_positivos?.length || data.valuation.factores_negativos?.length) {
    addSection("Análisis de Factores");

    const halfW = (contentWidth - 6) / 2;

    if (data.valuation.factores_positivos?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND_GREEN);
      doc.text("[+] Factores positivos", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      for (const f of data.valuation.factores_positivos) {
        checkPage();
        const lines = doc.splitTextToSize(`• ${f}`, halfW);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4;
      }
      y += 3;
    }

    if (data.valuation.factores_negativos?.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND_RED);
      doc.text("[!] Factores a considerar", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      for (const f of data.valuation.factores_negativos) {
        checkPage();
        const lines = doc.splitTextToSize(`• ${f}`, halfW);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4;
      }
      y += 3;
    }
  }

  // ── Professional Comment ──────────────────────────────────
  if (data.valuation.comentario) {
    checkPage(20);
    doc.setFillColor(245, 250, 255);
    doc.setDrawColor(...BRAND_BLUE);
    doc.setLineWidth(0.3);
    const commentLines = doc.splitTextToSize(`"${data.valuation.comentario}"`, contentWidth - 10);
    const commentH = commentLines.length * 4.5 + 8;
    doc.roundedRect(margin, y - 2, contentWidth, commentH, 2, 2, "FD");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(40, 60, 80);
    doc.text(commentLines, margin + 5, y + 4);
    y += commentH + 4;
  }

  // ── Property Characteristics ──────────────────────────────
  addSection("Características del Inmueble");
  addLine("Tipo de inmueble", tipoLabels[data.tipo_inmueble] || data.tipo_inmueble);
  addLine("Superficie", `${data.superficie_m2} m²`);
  if (data.habitaciones) addLine("Habitaciones", data.habitaciones);
  if (data.banos) addLine("Baños", data.banos);
  if (data.anio_construccion) addLine("Año de construcción", data.anio_construccion);
  if (data.estado) addLine("Estado", estadoLabels[data.estado] || data.estado);
  if (data.planta !== undefined && data.planta !== null) addLine("Planta", data.planta === 0 ? "Bajo" : data.planta);
  addLine("Garaje", data.tiene_garaje ? "Sí" : "No");
  addLine("Trastero", data.tiene_trastero ? "Sí" : "No");
  addLine("Ascensor", data.tiene_ascensor ? "Sí" : "No");

  // ── Catastro Section ──────────────────────────────────────
  if (data.catastro) {
    addSection("Datos Catastrales");
    addLine("Referencia catastral", data.catastro.ref_catastral);
    if (data.catastro.uso_catastral) addLine("Uso catastral", data.catastro.uso_catastral);
    if (data.catastro.uso_predominante) addLine("Uso predominante", data.catastro.uso_predominante);
    if (data.catastro.clase) addLine("Clase", data.catastro.clase);
    if (data.catastro.superficie_construida) addLine("Superficie construida (Catastro)", `${data.catastro.superficie_construida} m²`);
    if (data.catastro.superficie_suelo) addLine("Superficie suelo", `${data.catastro.superficie_suelo} m²`);
    if (data.catastro.coeficiente_participacion) addLine("Coef. participación", data.catastro.coeficiente_participacion);

    // Usos detalle
    if (data.catastro.usos_detalle?.length) {
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("Desglose de superficies:", margin, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      for (const u of data.catastro.usos_detalle) {
        checkPage();
        doc.setTextColor(100, 100, 100);
        doc.text(`${u.uso}${u.planta ? ` (${u.planta})` : ""}: ${u.superficie} m²`, margin + 4, y);
        y += 3.5;
      }
      y += 2;
    }

    // Catastro links
    if (data.catastro.urls?.ficha_catastral) {
      addLink("Ficha catastral completa", data.catastro.urls.ficha_catastral);
    }
    if (data.catastro.urls?.cartografia) {
      addLink("Cartografía catastral", data.catastro.urls.cartografia);
    }

    // Catastro facade photo
    if (data.catastroFachadaBase64) {
      checkPage(55);
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("Fotografía de fachada (Catastro):", margin, y);
      y += 3;
      try {
        doc.addImage(data.catastroFachadaBase64, "JPEG", margin, y, 80, 50);
        y += 53;
      } catch {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text("No disponible", margin, y + 5);
        y += 8;
      }
    }

    // Catastro cartography
    if (data.catastroCartografiaBase64) {
      checkPage(55);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("Cartografía catastral:", margin, y);
      y += 3;
      try {
        doc.addImage(data.catastroCartografiaBase64, "PNG", margin, y, 80, 50);
        y += 53;
      } catch {
        // Skip silently
      }
    }
  }

  // ── Geolocation Section ───────────────────────────────────
  addSection("Geolocalización");

  // Static map from OpenStreetMap tiles
  const geoQuery = encodeURIComponent(`${data.direccion}, ${data.municipio}, ${data.provincia}, España`);
  const osmUrl = `https://nominatim.openstreetmap.org/search?q=${geoQuery}&format=json&limit=1`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`> ${data.direccion}`, margin, y);
  y += 4;
  doc.text(`${data.municipio}, ${data.provincia}${data.codigo_postal ? ` (${data.codigo_postal})` : ""}`, margin, y);
  y += 5;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${geoQuery}`;
  addLink("Ver en Google Maps", mapsUrl);

  const wikibarrioSlug = data.municipio.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  addLink("Info del barrio (Wikibarrio)", `https://www.wikibarrio.es/${wikibarrioSlug}`);

  // ── Disclaimer ────────────────────────────────────────────
  checkPage(25);
  y += 4;
  doc.setFillColor(252, 248, 240);
  doc.setDrawColor(220, 180, 100);
  doc.setLineWidth(0.3);
  const disclaimerText = "Este informe es una estimación orientativa generada mediante inteligencia artificial y datos públicos del mercado inmobiliario español. No constituye una tasación oficial. Para una valoración vinculante, consulte con un tasador homologado. IKESA no se responsabiliza de las decisiones tomadas en base a esta estimación.";
  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 10);
  const disclaimerH = disclaimerLines.length * 3.5 + 8;
  doc.roundedRect(margin, y - 2, contentWidth, disclaimerH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(160, 120, 40);
  doc.text("⚠ AVISO LEGAL", margin + 5, y + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 80, 40);
  doc.text(disclaimerLines, margin + 5, y + 7);
  y += disclaimerH + 4;

  // ── Footer on all pages ───────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BRAND_BLUE);
    doc.setLineWidth(0.5);
    doc.line(margin, 284, pageWidth - margin, 284);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND_NAVY);
    doc.text("IKESA Inmobiliaria — Informe de Valoración Confidencial", margin, 289);
    doc.setTextColor(140, 140, 140);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 289, { align: "right" });
  }

  const filename = `IKESA-Valoracion-${data.municipio.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};

/** Attempt to load catastro facade image as base64 */
export const loadCatastroFachadaImage = async (refCatastral: string): Promise<string | null> => {
  const url = `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/OVCFotoFachada.svc/RecuperarFotoFachadaRC?ReferenciaCatastral=${refCatastral}`;
  return loadImageWithTimeout(url, 6000);
};

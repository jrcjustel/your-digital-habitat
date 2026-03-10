import jsPDF from "jspdf";
import type { Property } from "@/data/property-types";
import { occupancyLabels, judicialPhaseLabels, saleTypes } from "@/data/property-types";
import logoUrl from "@/assets/ikesa-logo-color.png";

const typeLabels: Record<string, string> = {
  vivienda: "Vivienda", local: "Local comercial", oficina: "Oficina", terreno: "Terreno",
  nave: "Nave industrial", edificio: "Edificio", "obra-parada": "Obra parada",
};

// Brand colors from manual
const BRAND_NAVY = [3, 54, 81] as const;   // #033651
const BRAND_BLUE = [63, 184, 234] as const; // #3FB8EA

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
    img.onerror = reject;
    img.src = url;
  });
};

export const generatePropertyPdf = async (property: Property) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // ── Helpers ──────────────────────────────────────────────
  const addLine = (label: string, value: string | number | undefined | null) => {
    if (value === undefined || value === null) return;
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(String(value), pageWidth - margin, y, { align: "right" });
    y += 6;
  };

  const addSection = (title: string) => {
    if (y > 260) { doc.addPage(); y = 20; }
    y += 4;
    doc.setFillColor(...BRAND_NAVY);
    doc.rect(margin, y - 4, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, y + 1);
    y += 10;
  };

  const addLink = (label: string, url: string) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(label + ": ", margin, y);
    const labelWidth = doc.getTextWidth(label + ": ");
    doc.setTextColor(...BRAND_BLUE);
    doc.textWithLink(url.length > 70 ? url.substring(0, 67) + "..." : url, margin + labelWidth, y, { url });
    y += 5;
  };

  // ── Header with logo ────────────────────────────────────
  // Navy banner at top
  doc.setFillColor(...BRAND_NAVY);
  doc.rect(0, 0, pageWidth, 38, "F");

  // Accent line
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 38, pageWidth, 1.5, "F");

  // Logo
  try {
    const logoBase64 = await loadImageAsBase64(logoUrl);
    // Logo aspect ratio ~2.5:1, render at 35mm wide
    doc.addImage(logoBase64, "PNG", margin, 6, 35, 14);
  } catch {
    // Fallback text if logo fails to load
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("IKESA", margin, 18);
  }

  // Header text (right side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("Ficha del Activo", pageWidth - margin, 16, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(`Ref: ${property.reference}`, pageWidth - margin, 23, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(180, 200, 220);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, pageWidth - margin, 29, { align: "right" });

  y = 46;

  // ── Title + Location summary ────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND_NAVY);
  const titleLines = doc.splitTextToSize(property.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`${property.municipality}, ${property.province} · ${property.community}`, margin, y);
  y += 8;

  // ── Price summary bar ───────────────────────────────────
  doc.setFillColor(240, 247, 252);
  doc.roundedRect(margin, y - 3, contentWidth, 18, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(`${property.price.toLocaleString("es-ES")} EUR`, margin + 4, y + 5);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Precio orientativo", margin + 4, y + 11);

  if (property.marketValue) {
    const disc = Math.round(((property.marketValue - property.price) / property.marketValue) * 100);
    doc.setFontSize(11);
    doc.setTextColor(130, 130, 130);
    doc.text(`${property.marketValue.toLocaleString("es-ES")} EUR`, pageWidth / 2, y + 5);
    doc.setFontSize(8);
    doc.text("Valor de mercado", pageWidth / 2, y + 11);

    if (disc > 0) {
      doc.setFontSize(12);
      doc.setTextColor(220, 50, 50);
      doc.text(`-${disc}%`, pageWidth - margin - 4, y + 5, { align: "right" });
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text("Descuento", pageWidth - margin - 4, y + 11, { align: "right" });
    }
  }

  y += 22;

  // ── General ─────────────────────────────────────────────
  addSection("Datos Generales");
  addLine("Tipo de activo", typeLabels[property.type] || property.type);
  const saleLabel = saleTypes.find((s) => s.value === property.saleType)?.label || property.saleType;
  addLine("Canal de venta", saleLabel);
  addLine("Operación", property.operation === "venta" ? "Venta" : "Alquiler");
  if (property.profitability) addLine("Rentabilidad estimada", `${property.profitability}%`);

  // ── Location ────────────────────────────────────────────
  addSection("Ubicación");
  addLine("Comunidad autónoma", property.community);
  addLine("Provincia", property.province);
  addLine("Municipio", property.municipality);
  if (property.postalCode) addLine("Código postal", property.postalCode);

  // Google Maps link
  const mapsUrl = `https://www.google.com/maps?q=${property.lat},${property.lng}`;
  addLink("Ver en Google Maps", mapsUrl);

  // Wikibarrio link
  const wikibarrioSlug = property.municipality.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  const wikibarrioUrl = `https://www.wikibarrio.es/${wikibarrioSlug}`;
  addLink("Info del barrio (Wikibarrio)", wikibarrioUrl);

  // ── Property details ────────────────────────────────────
  addSection("Características del Inmueble");
  addLine("Metros construidos", `${property.area} m²`);
  if (property.landArea) addLine("Metros suelo", `${property.landArea} m²`);
  if (property.bedrooms) addLine("Dormitorios", property.bedrooms);
  if (property.bathrooms) addLine("Baños", property.bathrooms);
  if (property.year) addLine("Año construcción", property.year);
  addLine("VPO", property.isVPO ? "SÍ" : "NO");
  if (property.catastralRef) addLine("Referencia catastral", property.catastralRef);
  addLine("Estado ocupacional", occupancyLabels[property.occupancyStatus]);
  addLine("Vivienda habitual", property.isHabitualResidence ? "SÍ" : "NO");
  if (property.ownershipPercent) addLine("Titularidad", `${property.ownershipPercent}%`);

  // Features
  if (property.features.length > 0) {
    y += 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const featText = property.features.join(" · ");
    const lines = doc.splitTextToSize(featText, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }

  // ── Judicial ────────────────────────────────────────────
  if (property.judicialInfo) {
    addSection("Información Judicial");
    addLine("Judicializado", property.judicialInfo.judicializado ? "SÍ" : "NO");
    if (property.judicialInfo.phase) addLine("Fase judicial", judicialPhaseLabels[property.judicialInfo.phase]);
    if (property.judicialInfo.court) addLine("Juzgado", property.judicialInfo.court);
    if (property.judicialInfo.proceedingNumber) addLine("Nº procedimiento", property.judicialInfo.proceedingNumber);
  }

  // ── Debt ────────────────────────────────────────────────
  if (property.debtInfo) {
    addSection("Información de la Deuda");
    if (property.debtInfo.debtType) addLine("Tipo de deuda", property.debtInfo.debtType);
    if (property.debtInfo.guaranteeType) addLine("Tipo de garantía", property.debtInfo.guaranteeType);
    if (property.debtInfo.outstandingDebt) addLine("Deuda pendiente", `${property.debtInfo.outstandingDebt.toLocaleString("es-ES")} EUR`);
  }

  // ── Description ─────────────────────────────────────────
  addSection("Descripción");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const descLines = doc.splitTextToSize(property.description, contentWidth);
  if (y + descLines.length * 5 > 280) { doc.addPage(); y = 20; }
  doc.text(descLines, margin, y);

  // ── Footer on all pages ─────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(...BRAND_BLUE);
    doc.setLineWidth(0.5);
    doc.line(margin, 284, pageWidth - margin, 284);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND_NAVY);
    doc.text("IKESA Inmobiliaria Real - Documento confidencial", margin, 289);
    doc.setTextColor(140, 140, 140);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 289, { align: "right" });
  }

  doc.save(`IKESA-Ficha-${property.reference}.pdf`);
};

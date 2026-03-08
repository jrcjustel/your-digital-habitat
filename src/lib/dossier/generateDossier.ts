import jsPDF from "jspdf";
import type { DossierData } from "./types";
import {
  MARGIN, CONTENT_WIDTH, PAGE_WIDTH,
  BRAND_NAVY, BRAND_BLUE, BRAND_GRAY, BRAND_DARK, WHITE, GREEN, RED,
  operationTypeLabels, propertyTypeLabels,
} from "./constants";
import {
  loadImageAsBase64, fmt, drawSectionHeader, drawRow, drawBarChart,
  drawTimeline, drawTable, ensureSpace,
} from "./helpers";
import logoUrl from "@/assets/ikesa-logo-color.png";

/** Generate professional investment dossier PDF. Returns the jsPDF doc. */
export const buildDossierDoc = async (data: DossierData): Promise<jsPDF> => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = 0;

  // ═══════════════════════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════════════════════
  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(0, 0, PAGE_WIDTH, 297, "F");

  // Logo
  try {
    const logoBase64 = await loadImageAsBase64(logoUrl);
    doc.addImage(logoBase64, "PNG", MARGIN, 20, 45, 18);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("IKESA", MARGIN, 35);
  }

  // Operation type badge
  const opLabel = operationTypeLabels[data.operationType] || data.operationType;
  doc.setFillColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
  doc.roundedRect(MARGIN, 60, doc.getTextWidth(opLabel) * 1.5 + 20, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(opLabel, MARGIN + 5, 67);

  // Reference
  doc.setFontSize(10);
  doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
  doc.text(`Ref: ${data.reference}`, MARGIN, 82);

  // Title / Address
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  const titleText = data.address || data.municipality || "Activo de Inversión";
  const titleLines = doc.splitTextToSize(titleText, CONTENT_WIDTH);
  doc.text(titleLines, MARGIN, 100);

  // Location line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(180, 210, 230);
  const locParts = [data.municipality, data.province, data.community].filter(Boolean);
  doc.text(locParts.join(", "), MARGIN, 115 + (titleLines.length - 1) * 8);

  // Price block
  y = 150;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
  doc.text("Precio potencial de compra", MARGIN, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(`${fmt(data.potentialPurchasePrice)} €`, MARGIN, y + 14);

  if (data.estimatedAssetValue) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
    doc.text("Valor estimado del activo", MARGIN, y + 28);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(180, 210, 230);
    doc.text(`${fmt(data.estimatedAssetValue)} €`, MARGIN, y + 38);
  }

  if (data.discount && data.discount > 0) {
    doc.setFillColor(RED[0], RED[1], RED[2]);
    doc.roundedRect(PAGE_WIDTH - MARGIN - 30, y, 30, 14, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`-${data.discount}%`, PAGE_WIDTH - MARGIN - 15, y + 10, { align: "center" });
  }

  // Summary text
  y = 210;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 200, 220);
  const summaryLines = doc.splitTextToSize(data.investmentSummary, CONTENT_WIDTH);
  doc.text(summaryLines, MARGIN, y);

  // Footer on cover
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 130, 160);
  doc.text("IKESA Inmobiliaria Real — Dossier de Inversión Confidencial", MARGIN, 280);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, PAGE_WIDTH - MARGIN, 280, { align: "right" });

  // Accent line at bottom
  doc.setFillColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
  doc.rect(0, 290, PAGE_WIDTH, 2, "F");

  // ═══════════════════════════════════════════════════════
  // PAGE 2+ – Content pages
  // ═══════════════════════════════════════════════════════
  doc.addPage();
  y = 20;

  // ── SECTION 1: Información General ────────────────────
  y = drawSectionHeader(doc, "Información General de la Operación", y, 1);
  y = drawRow(doc, "Tipo de operación", opLabel, y);
  y = drawRow(doc, "Identificador", data.reference, y);
  y = drawRow(doc, "Precio potencial compra", `${fmt(data.potentialPurchasePrice)} €`, y);
  y = drawRow(doc, "Valor estimado activo", `${fmt(data.estimatedAssetValue)} €`, y);
  if (data.profitability) y = drawRow(doc, "Rentabilidad estimada", `${data.profitability}%`, y);
  if (data.discount) y = drawRow(doc, "Descuento s/ mercado", `${data.discount}%`, y);
  y += 2;
  // Description box
  doc.setFillColor(240, 247, 252);
  const descLines = doc.splitTextToSize(data.description, CONTENT_WIDTH - 8);
  const descH = descLines.length * 4.5 + 6;
  y = ensureSpace(doc, y, descH + 2);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, descH, 1, 1, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.text(descLines, MARGIN + 4, y + 5);
  y += descH + 6;

  // ── SECTION 2: Datos del Colateral ────────────────────
  y = drawSectionHeader(doc, "Datos del Colateral (Inmueble)", y, 2);
  y = drawRow(doc, "Tipología inmueble", propertyTypeLabels[data.propertyType] || data.propertyType, y);
  y = drawRow(doc, "Referencia catastral", data.catastralRef, y);
  y = drawRow(doc, "Superficie construida", data.builtArea ? `${fmt(data.builtArea)} m²` : undefined, y);
  y = drawRow(doc, "Superficie suelo", data.landArea ? `${fmt(data.landArea)} m²` : undefined, y);
  y = drawRow(doc, "Año construcción", data.yearBuilt, y);
  y = drawRow(doc, "Estado conservación", data.conservationState, y);
  y = drawRow(doc, "Estado ocupacional", data.occupancyStatus, y);
  y = drawRow(doc, "Fecha vencimiento alquiler", data.leaseExpiryDate || "-", y);
  y = drawRow(doc, "Renta bruta mensual", data.grossMonthlyRent ? `${fmt(data.grossMonthlyRent)} €` : "-", y);
  y = drawRow(doc, "Cargas preferentes", data.preferentialCharges ? `${fmt(data.preferentialCharges)} €` : "-", y);
  y = drawRow(doc, "VPO", data.isVPO ? "Sí" : "No", y);
  y += 4;

  // ── SECTION 3: Deuda y Procedimiento ──────────────────
  y = drawSectionHeader(doc, "Datos de Deuda y Procedimiento", y, 3);
  y = drawRow(doc, "Importe deuda actual", data.currentDebt ? `${fmt(data.currentDebt)} €` : "-", y);
  y = drawRow(doc, "Tipología deudor", data.debtorType || "-", y);
  y = drawRow(doc, "Valor efectos subasta", data.auctionEffectsValue ? `${fmt(data.auctionEffectsValue)} €` : "-", y);
  y = drawRow(doc, "Fase judicial", data.judicialPhase || "-", y);
  y = drawRow(doc, "Juzgado", data.court, y);
  y = drawRow(doc, "Nº procedimiento", data.proceedingNumber, y);
  y = drawRow(doc, "Fecha último hito judicial", data.lastJudicialDate || "-", y);
  y += 4;

  // ── SECTION 4: Valoración del Colateral ───────────────
  y = drawSectionHeader(doc, "Valoración del Colateral", y, 4);
  y = drawRow(doc, "Precio medio m² zona", `${fmt(data.pricePerSqm)} €/m²`, y);
  y = drawRow(doc, "Superficie adoptada", `${fmt(data.adoptedArea)} m²`, y);
  y = drawRow(doc, "Valoración total inmueble", `${fmt(data.totalValuation)} €`, y);
  y += 4;

  // Comparative bar chart
  const chartItems = [
    { label: "Deuda actual", value: data.currentDebt || 0, color: RED as unknown as readonly [number, number, number] },
    { label: "Valor subasta", value: data.auctionEffectsValue || data.potentialPurchasePrice, color: BRAND_BLUE as unknown as readonly [number, number, number] },
    { label: "Valor mercado", value: data.marketValue || data.totalValuation, color: GREEN as unknown as readonly [number, number, number] },
  ];
  y = drawBarChart(doc, y, chartItems);
  y += 4;

  // ── SECTION 5: Información de la Zona ─────────────────
  y = drawSectionHeader(doc, "Información de la Zona", y, 5);
  y = drawRow(doc, "Dirección", data.address, y);
  y = drawRow(doc, "Código postal", data.postalCode, y);
  y = drawRow(doc, "Municipio", data.municipality, y);
  y = drawRow(doc, "Provincia", data.province, y);
  if (data.absorptionRate) y = drawRow(doc, "Tasa de absorción", `${data.absorptionRate}%`, y);
  if (data.population) y = drawRow(doc, "Población", fmt(data.population), y);
  if (data.unemploymentRate) y = drawRow(doc, "Tasa de paro", `${data.unemploymentRate}%`, y);
  if (data.averageFamilyIncome) y = drawRow(doc, "Renta media familiar", `${fmt(data.averageFamilyIncome)} €`, y);

  // Google Maps link
  if (data.lat && data.lng) {
    y = ensureSpace(doc, y, 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(BRAND_GRAY[0], BRAND_GRAY[1], BRAND_GRAY[2]);
    doc.text("Ver en Google Maps:", MARGIN + 2, y + 3);
    const mapsUrl = `https://www.google.com/maps?q=${data.lat},${data.lng}`;
    doc.setTextColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
    doc.textWithLink(mapsUrl.substring(0, 60) + "...", MARGIN + 35, y + 3, { url: mapsUrl });
    y += 8;
  }
  y += 4;

  // ── SECTION 6: Descripción del Activo ─────────────────
  y = drawSectionHeader(doc, "Descripción del Activo", y, 6);
  const autoDesc = data.detailedDescription || buildAutoDescription(data);
  const autoDescLines = doc.splitTextToSize(autoDesc, CONTENT_WIDTH - 4);
  y = ensureSpace(doc, y, autoDescLines.length * 4 + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text(autoDescLines, MARGIN + 2, y);
  y += autoDescLines.length * 4 + 6;

  // ── SECTION 7: Calendario de Operación ────────────────
  if (data.calendar) {
    y = drawSectionHeader(doc, "Calendario de Operación", y, 7);
    const cal = data.calendar;
    const phases = [
      { label: "Arras", startMonth: 0, durationMonths: cal.arras, color: BRAND_BLUE },
      { label: "Escritura", startMonth: cal.arras, durationMonths: cal.escritura, color: BRAND_NAVY },
      { label: "Test. Judicial", startMonth: cal.arras + cal.escritura, durationMonths: cal.testimonioJudicial, color: [150, 100, 50] as const },
      { label: "Posesión", startMonth: cal.arras + cal.escritura + cal.testimonioJudicial, durationMonths: cal.posesion, color: RED },
      { label: "Reforma", startMonth: cal.arras + cal.escritura + cal.testimonioJudicial + cal.posesion, durationMonths: cal.reforma, color: [180, 130, 50] as const },
      { label: "Venta", startMonth: cal.arras + cal.escritura + cal.testimonioJudicial + cal.posesion + cal.reforma, durationMonths: cal.venta, color: GREEN },
    ];
    const totalMonths = phases[phases.length - 1].startMonth + phases[phases.length - 1].durationMonths;
    y = drawTimeline(doc, y, phases, totalMonths);
    y = drawRow(doc, "Duración total estimada", `${totalMonths} meses`, y);
    y += 4;
  }

  // ── SECTION 8: Análisis Financiero – Escenario 1 ──────
  if (data.scenario1) {
    y = drawSectionHeader(doc, "Análisis Financiero — Escenario 1: Adjudicación, Posesión y Venta", y, 8);
    const s = data.scenario1;

    // Summary
    y = ensureSpace(doc, y, 12);
    doc.setFillColor(240, 247, 252);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 10, 1, 1, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(
      `Compra del credito > Adjudicacion > Posesion > Reforma > Venta. Margen estimado: ${fmt(s.operationMargin)} EUR | TIR Bruta: ${s.grossIRR}% | Duracion: ${s.durationMonths} meses`,
      MARGIN + 4, y + 6
    );
    y += 14;

    y = drawRow(doc, "Precio compra crédito", `${fmt(s.purchasePrice)} €`, y);
    y = drawRow(doc, "Impuestos", `${fmt(s.taxes)} €`, y);
    y = drawRow(doc, "Costes judiciales", `${fmt(s.judicialCosts)} €`, y);
    y = drawRow(doc, "Costes reforma", `${fmt(s.reformCosts)} €`, y);
    y = drawRow(doc, "Precio venta estimado", `${fmt(s.estimatedSalePrice)} €`, y);
    y = drawRow(doc, "Margen operación", `${fmt(s.operationMargin)} €`, y);
    y = drawRow(doc, "TIR Bruta", `${s.grossIRR}%`, y);
    y = drawRow(doc, "Duración estimada", `${s.durationMonths} meses`, y);
    y += 4;

    // Cash flow table
    const years = Math.ceil(s.durationMonths / 12);
    const totalInvest = s.purchasePrice + s.taxes + s.judicialCosts + s.reformCosts;
    const cfHeaders = ["Concepto", ...Array.from({ length: years }, (_, i) => `Año ${i + 1}`), "TOTAL"];
    const colW = [40, ...Array(years).fill((CONTENT_WIDTH - 40 - 22) / years), 22];
    const cfRows = [
      ["CF Inversión", ...distributeCosts(totalInvest, years), fmt(totalInvest)],
      ["CF Venta", ...Array(years - 1).fill("-"), fmt(s.estimatedSalePrice), fmt(s.estimatedSalePrice)],
      ["CF Neto", ...Array(years - 1).fill("-"), fmt(s.operationMargin), fmt(s.operationMargin)],
    ];
    y = drawTable(doc, y, cfHeaders, cfRows, colW as number[]);
    y += 4;
  }

  // ── SECTION 9: Análisis Financiero – Escenario 2 ──────
  if (data.scenario2) {
    y = drawSectionHeader(doc, "Análisis Financiero — Escenario 2: Cesión de Remate", y, 9);
    const s = data.scenario2;

    y = ensureSpace(doc, y, 12);
    doc.setFillColor(240, 247, 252);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 10, 1, 1, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(
      `Compra credito > Acuerdo con postor > Cesion de remate. Margen: ${fmt(s.estimatedMargin)} EUR | TIR: ${s.operationIRR}% | Duracion: ${s.durationMonths} meses`,
      MARGIN + 4, y + 6
    );
    y += 14;

    y = drawRow(doc, "Precio compra crédito", `${fmt(s.purchasePrice)} €`, y);
    y = drawRow(doc, "Ingreso por cesión", `${fmt(s.assignmentIncome)} €`, y);
    y = drawRow(doc, "Costes legales", `${fmt(s.legalCosts)} €`, y);
    y = drawRow(doc, "Margen estimado", `${fmt(s.estimatedMargin)} €`, y);
    y = drawRow(doc, "TIR operación", `${s.operationIRR}%`, y);
    y = drawRow(doc, "Duración operación", `${s.durationMonths} meses`, y);
    y += 4;
  }

  // ── SECTION 10: Gráficos Financieros ──────────────────
  y = drawSectionHeader(doc, "Gráficos Financieros", y, 10);

  // Comparativa de valores
  y = ensureSpace(doc, y, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text("Comparativa de Valores (€)", MARGIN + 2, y);
  y += 5;

  const compValues = [
    { label: "Compra", value: data.potentialPurchasePrice, color: BRAND_BLUE as unknown as readonly [number, number, number] },
    { label: "Deuda", value: data.currentDebt || 0, color: RED as unknown as readonly [number, number, number] },
    { label: "Mercado", value: data.marketValue || data.totalValuation, color: GREEN as unknown as readonly [number, number, number] },
  ];
  y = drawBarChart(doc, y, compValues);

  // Rentabilidad
  if (data.profitability) {
    y = ensureSpace(doc, y, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
    doc.text("Rentabilidad Estimada", MARGIN + 2, y);
    y += 6;

    // Large profitability number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(GREEN[0], GREEN[1], GREEN[2]);
    doc.text(`${data.profitability}%`, MARGIN + 2, y + 6);
    y += 14;
  }
  y += 4;

  // ── SECTION 11: Datos de Contacto ─────────────────────
  y = drawSectionHeader(doc, "Datos de Contacto", y, 11);
  y = ensureSpace(doc, y, 30);

  doc.setFillColor(240, 247, 252);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 25, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text("IKESA Inmobiliaria Real", MARGIN + 4, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("Email: info@ikesa.es", MARGIN + 4, y + 13);
  doc.text("Tel: +34 900 000 000", MARGIN + 70, y + 13);
  doc.text("WhatsApp: +34 600 000 000", MARGIN + 4, y + 19);
  doc.text("Web: www.ikesa.es", MARGIN + 70, y + 19);

  // ═══════════════════════════════════════════════════════
  // FOOTERS on all pages
  // ═══════════════════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i === 1) continue; // skip cover footer

    doc.setDrawColor(BRAND_BLUE[0], BRAND_BLUE[1], BRAND_BLUE[2]);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, 284, PAGE_WIDTH - MARGIN, 284);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
    doc.text("IKESA - Dossier de Inversion Confidencial", MARGIN, 288);
    doc.setTextColor(140, 140, 140);
    doc.text(`Ref: ${data.reference}`, PAGE_WIDTH / 2, 288, { align: "center" });
    doc.text(`Página ${i} de ${totalPages}`, PAGE_WIDTH - MARGIN, 288, { align: "right" });
  }

  return doc;
};

/** Generate and download dossier PDF */
export const generateInvestmentDossier = async (data: DossierData) => {
  const doc = await buildDossierDoc(data);
  doc.save(`IKESA-Dossier-${data.reference}.pdf`);
};

/** Generate dossier and return as Blob */
export const generateDossierBlob = async (data: DossierData): Promise<Blob> => {
  const doc = await buildDossierDoc(data);
  return doc.output("blob");
};

function buildAutoDescription(data: DossierData): string {
  const type = propertyTypeLabels[data.propertyType] || data.propertyType;
  const parts = [
    `${type} ubicada en ${data.municipality || "zona no especificada"}`,
    data.province ? `(${data.province})` : "",
    data.builtArea ? `, con una superficie construida de ${data.builtArea} m²` : "",
    data.bedrooms ? ` y ${data.bedrooms} dormitorios` : "",
    data.bathrooms ? `, ${data.bathrooms} baños` : "",
    data.yearBuilt ? `. Año de construcción: ${data.yearBuilt}` : "",
    ". ",
    data.occupancyStatus ? `Estado ocupacional: ${data.occupancyStatus}. ` : "",
    data.features?.length ? `Características destacadas: ${data.features.join(", ")}. ` : "",
    data.potentialPurchasePrice && data.marketValue
      ? `El precio potencial de compra (${fmt(data.potentialPurchasePrice)} €) supone un descuento del ${data.discount || Math.round(((data.marketValue - data.potentialPurchasePrice) / data.marketValue) * 100)}% sobre el valor de mercado estimado (${fmt(data.marketValue)} €).`
      : "",
  ];
  return parts.join("");
}

function distributeCosts(total: number, years: number): string[] {
  // Distribute investment mostly in year 1
  const result: string[] = [];
  for (let i = 0; i < years; i++) {
    if (i === 0) result.push(`(${fmt(Math.round(total * 0.85))})`);
    else if (i === 1) result.push(`(${fmt(Math.round(total * 0.1))})`);
    else result.push(`(${fmt(Math.round(total * 0.05 / Math.max(years - 2, 1)))})`);
  }
  return result;
}

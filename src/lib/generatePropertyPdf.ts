import jsPDF from "jspdf";
import type { Property } from "@/data/properties";
import { occupancyLabels, judicialPhaseLabels, saleTypes } from "@/data/properties";

const typeLabels: Record<string, string> = {
  vivienda: "Vivienda", local: "Local comercial", oficina: "Oficina", terreno: "Terreno",
  nave: "Nave industrial", edificio: "Edificio", "obra-parada": "Obra parada",
};

export const generatePropertyPdf = (property: Property) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

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
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 4, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(title, margin + 2, y + 1);
    y += 10;
  };

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text("IKESA — Ficha del Activo", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Referencia: ${property.reference}`, margin, y);
  y += 5;
  doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, margin, y);
  y += 4;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // General
  addSection("Datos Generales");
  addLine("Tipo de activo", typeLabels[property.type] || property.type);
  const saleLabel = saleTypes.find((s) => s.value === property.saleType)?.label || property.saleType;
  addLine("Canal de venta", saleLabel);
  addLine("Operación", property.operation === "venta" ? "Venta" : "Alquiler");
  addLine("Precio orientativo", `${property.price.toLocaleString("es-ES")} €`);
  if (property.marketValue) addLine("Valor de mercado", `${property.marketValue.toLocaleString("es-ES")} €`);
  if (property.marketValue) {
    const disc = Math.round(((property.marketValue - property.price) / property.marketValue) * 100);
    if (disc > 0) addLine("Descuento", `-${disc}%`);
  }
  if (property.profitability) addLine("Rentabilidad estimada", `${property.profitability}%`);

  // Location
  addSection("Ubicación");
  addLine("Comunidad autónoma", property.community);
  addLine("Provincia", property.province);
  addLine("Municipio", property.municipality);
  if (property.postalCode) addLine("Código postal", property.postalCode);

  // Property details
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
    addSection("Características");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const featText = property.features.join(" · ");
    const lines = doc.splitTextToSize(featText, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }

  // Judicial
  if (property.judicialInfo) {
    addSection("Información Judicial");
    addLine("Judicializado", property.judicialInfo.judicializado ? "SÍ" : "NO");
    if (property.judicialInfo.phase) addLine("Fase judicial", judicialPhaseLabels[property.judicialInfo.phase]);
    if (property.judicialInfo.court) addLine("Juzgado", property.judicialInfo.court);
    if (property.judicialInfo.proceedingNumber) addLine("Nº procedimiento", property.judicialInfo.proceedingNumber);
  }

  // Debt
  if (property.debtInfo) {
    addSection("Información de la Deuda");
    if (property.debtInfo.debtType) addLine("Tipo de deuda", property.debtInfo.debtType);
    if (property.debtInfo.guaranteeType) addLine("Tipo de garantía", property.debtInfo.guaranteeType);
    if (property.debtInfo.outstandingDebt) addLine("Deuda pendiente", `${property.debtInfo.outstandingDebt.toLocaleString("es-ES")} €`);
  }

  // Description
  addSection("Descripción");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const descLines = doc.splitTextToSize(property.description, contentWidth);
  if (y + descLines.length * 5 > 280) { doc.addPage(); y = 20; }
  doc.text(descLines, margin, y);

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text("IKESA — Documento confidencial", margin, 290);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 290, { align: "right" });
  }

  doc.save(`IKESA-Ficha-${property.reference}.pdf`);
};

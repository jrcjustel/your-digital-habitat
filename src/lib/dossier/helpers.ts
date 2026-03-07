import jsPDF from "jspdf";
import {
  MARGIN, CONTENT_WIDTH, PAGE_WIDTH,
  BRAND_NAVY, BRAND_BLUE, BRAND_GRAY, BRAND_DARK, WHITE, BRAND_LIGHT_BG,
} from "./constants";

export const loadImageAsBase64 = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if (!ctx) { reject("No canvas"); return; }
      ctx.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });

export const fmt = (n: number | undefined | null): string =>
  n != null ? n.toLocaleString("es-ES") : "-";

export const fmtK = (n: number | undefined | null): string =>
  n != null ? `${(n / 1000).toFixed(1)}k` : "-";

/** Ensure page break if needed. Returns new y. */
export const ensureSpace = (doc: jsPDF, y: number, needed: number): number => {
  if (y + needed > 275) {
    doc.addPage();
    return 20;
  }
  return y;
};

/** Draw a section header bar */
export const drawSectionHeader = (doc: jsPDF, title: string, y: number, sectionNum?: number): number => {
  y = ensureSpace(doc, y, 14);
  y += 4;
  doc.setFillColor(...BRAND_NAVY);
  doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 9, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  const label = sectionNum ? `${sectionNum}. ${title}` : title;
  doc.text(label, MARGIN + 4, y + 2);
  return y + 12;
};

/** Draw a data row: label left, value right */
export const drawRow = (doc: jsPDF, label: string, value: string | number | undefined | null, y: number): number => {
  if (value == null || value === "") return y;
  y = ensureSpace(doc, y, 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_GRAY);
  doc.text(label, MARGIN + 2, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND_DARK);
  doc.text(String(value), PAGE_WIDTH - MARGIN - 2, y, { align: "right" });
  // subtle line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.2);
  doc.line(MARGIN + 2, y + 2, PAGE_WIDTH - MARGIN - 2, y + 2);
  return y + 6;
};

/** Draw a horizontal bar chart comparing values */
export const drawBarChart = (
  doc: jsPDF,
  y: number,
  items: { label: string; value: number; color: readonly [number, number, number] }[],
  maxWidth: number = CONTENT_WIDTH - 40,
): number => {
  const max = Math.max(...items.map((i) => i.value), 1);
  const barHeight = 8;
  const gap = 4;

  y = ensureSpace(doc, y, items.length * (barHeight + gap) + 10);

  items.forEach((item) => {
    const barW = (item.value / max) * maxWidth;
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(MARGIN + 38, y, maxWidth, barHeight, 1, 1, "F");
    doc.setFillColor(...item.color);
    doc.roundedRect(MARGIN + 38, y, Math.max(barW, 2), barHeight, 1, 1, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND_DARK);
    doc.text(item.label, MARGIN + 2, y + 5.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND_NAVY);
    doc.text(`${fmt(item.value)} €`, MARGIN + 40 + maxWidth, y + 5.5);

    y += barHeight + gap;
  });

  return y + 2;
};

/** Draw a timeline / Gantt-style calendar */
export const drawTimeline = (
  doc: jsPDF,
  y: number,
  phases: { label: string; startMonth: number; durationMonths: number; color: readonly [number, number, number] }[],
  totalMonths: number,
): number => {
  const chartLeft = MARGIN + 35;
  const chartWidth = CONTENT_WIDTH - 37;
  const rowH = 7;
  const gap = 3;

  y = ensureSpace(doc, y, phases.length * (rowH + gap) + 15);

  // Month scale
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...BRAND_GRAY);
  for (let m = 0; m <= totalMonths; m += Math.max(1, Math.floor(totalMonths / 8))) {
    const x = chartLeft + (m / totalMonths) * chartWidth;
    doc.text(`${m}`, x, y);
  }
  doc.text("meses", chartLeft + chartWidth + 2, y);
  y += 4;

  phases.forEach((p) => {
    const x = chartLeft + (p.startMonth / totalMonths) * chartWidth;
    const w = Math.max((p.durationMonths / totalMonths) * chartWidth, 3);

    doc.setFillColor(240, 240, 240);
    doc.roundedRect(chartLeft, y, chartWidth, rowH, 1, 1, "F");
    doc.setFillColor(...p.color);
    doc.roundedRect(x, y, w, rowH, 1, 1, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND_DARK);
    doc.text(p.label, MARGIN + 2, y + 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(...WHITE);
    if (w > 10) doc.text(`${p.durationMonths}m`, x + 2, y + 5);

    y += rowH + gap;
  });

  return y + 2;
};

/** Draw a simple table */
export const drawTable = (
  doc: jsPDF,
  y: number,
  headers: string[],
  rows: (string | number)[][],
  colWidths: number[],
): number => {
  const rowH = 7;
  y = ensureSpace(doc, y, (rows.length + 1) * rowH + 5);

  let x = MARGIN;
  // Header
  doc.setFillColor(...BRAND_NAVY);
  doc.rect(x, y, CONTENT_WIDTH, rowH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y + 5);
    x += colWidths[i];
  });
  y += rowH;

  // Data rows
  rows.forEach((row, ri) => {
    x = MARGIN;
    const bg = ri % 2 === 0 ? BRAND_LIGHT_BG : WHITE;
    doc.setFillColor(...bg);
    doc.rect(x, y, CONTENT_WIDTH, rowH, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND_DARK);
    row.forEach((cell, ci) => {
      const align = ci === 0 ? "left" : "right";
      const textX = ci === 0 ? x + 2 : x + colWidths[ci] - 2;
      doc.text(String(cell), textX, y + 5, { align } as any);
      x += colWidths[ci];
    });
    y += rowH;
  });

  return y + 3;
};

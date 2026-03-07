import { useState } from "react";
import { FileText, Download, Send, Building2, Scale, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import jsPDF from "jspdf";

const BRAND_NAVY = [3, 54, 81] as const;
const BRAND_BLUE = [63, 184, 234] as const;

type FormType = "reserva" | "compraventa" | "demanda";

interface FormData {
  // Common
  buyerName: string;
  buyerDni: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerEmail: string;
  // Property
  propertyRef: string;
  propertyAddress: string;
  propertyRegistry: string;
  // Financial
  price: string;
  deposit: string;
  // Reserva specific
  reservaExpiry: string;
  // Demanda specific
  courtName: string;
  proceedingNumber: string;
  claimDescription: string;
}

const emptyForm: FormData = {
  buyerName: "", buyerDni: "", buyerAddress: "", buyerPhone: "", buyerEmail: "",
  propertyRef: "", propertyAddress: "", propertyRegistry: "",
  price: "", deposit: "",
  reservaExpiry: "",
  courtName: "", proceedingNumber: "", claimDescription: "",
};

const generateLegalPdf = (type: FormType, data: FormData) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // Header
  doc.setFillColor(...BRAND_NAVY);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 32, pageWidth, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  const titles: Record<FormType, string> = {
    reserva: "CONTRATO DE RESERVA",
    compraventa: "CONTRATO DE COMPRAVENTA",
    demanda: "FORMULARIO DE DEMANDA",
  };
  doc.text(titles[type], margin, 20);
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_BLUE);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, pageWidth - margin, 20, { align: "right" });
  doc.text("IKESA Inmobiliaria Real", pageWidth - margin, 26, { align: "right" });

  y = 42;

  const addField = (label: string, value: string) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(value || "—", pageWidth - margin, y, { align: "right" });
    y += 7;
  };

  const addSectionHeader = (title: string) => {
    y += 4;
    doc.setFillColor(...BRAND_NAVY);
    doc.rect(margin, y - 4, contentWidth, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3, y + 1);
    y += 10;
  };

  // Buyer data
  addSectionHeader("DATOS DEL COMPRADOR / SOLICITANTE");
  addField("Nombre completo", data.buyerName);
  addField("DNI / NIE / CIF", data.buyerDni);
  addField("Dirección", data.buyerAddress);
  addField("Teléfono", data.buyerPhone);
  addField("Email", data.buyerEmail);

  // Property data
  addSectionHeader("DATOS DEL INMUEBLE");
  addField("Referencia", data.propertyRef);
  addField("Dirección del inmueble", data.propertyAddress);
  addField("Registro de la propiedad", data.propertyRegistry);

  if (type === "reserva" || type === "compraventa") {
    addSectionHeader("CONDICIONES ECONÓMICAS");
    addField("Precio de compra", data.price ? `${Number(data.price).toLocaleString("es-ES")} €` : "—");
    addField(type === "reserva" ? "Señal de reserva" : "Arras", data.deposit ? `${Number(data.deposit).toLocaleString("es-ES")} €` : "—");
    if (type === "reserva" && data.reservaExpiry) {
      addField("Validez de la reserva hasta", data.reservaExpiry);
    }
  }

  if (type === "demanda") {
    addSectionHeader("INFORMACIÓN JUDICIAL");
    addField("Juzgado", data.courtName);
    addField("Nº Procedimiento", data.proceedingNumber);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const descLines = doc.splitTextToSize(data.claimDescription || "—", contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 5;
  }

  // Signatures
  y += 15;
  if (y > 240) { doc.addPage(); y = 30; }
  addSectionHeader("FIRMAS");
  y += 20;
  doc.setDrawColor(180, 180, 180);
  doc.line(margin, y, margin + 60, y);
  doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("El comprador / solicitante", margin, y);
  doc.text("IKESA Inmobiliaria Real", pageWidth - margin - 60, y);

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...BRAND_BLUE);
    doc.setLineWidth(0.5);
    doc.line(margin, 284, pageWidth - margin, 284);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND_NAVY);
    doc.text("IKESA Inmobiliaria Real — Documento confidencial", margin, 289);
    doc.setTextColor(140, 140, 140);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 289, { align: "right" });
  }

  doc.save(`IKESA-${titles[type].replace(/\s+/g, "-")}-${data.propertyRef || "DOC"}.pdf`);
};

const LegalForms = () => {
  const [formData, setFormData] = useState<FormData>({ ...emptyForm });

  const updateField = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const Field = ({ label, field, type = "text", colSpan }: { label: string; field: keyof FormData; type?: string; colSpan?: boolean }) => (
    <div className={colSpan ? "col-span-2" : ""}>
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={formData[field]} onChange={(e) => updateField(field, e.target.value)} className="mt-1" />
    </div>
  );

  const handleGenerate = (formType: FormType) => {
    if (!formData.buyerName || !formData.buyerDni) {
      toast.error("Rellena al menos el nombre y DNI del comprador");
      return;
    }
    generateLegalPdf(formType, formData);
    toast.success("PDF generado correctamente");
  };

  const BuyerFields = () => (
    <>
      <h4 className="col-span-2 text-xs font-bold text-foreground mt-2">Datos del comprador</h4>
      <Field label="Nombre completo" field="buyerName" />
      <Field label="DNI / NIE / CIF" field="buyerDni" />
      <Field label="Dirección" field="buyerAddress" colSpan />
      <Field label="Teléfono" field="buyerPhone" />
      <Field label="Email" field="buyerEmail" type="email" />
    </>
  );

  const PropertyFields = () => (
    <>
      <h4 className="col-span-2 text-xs font-bold text-foreground mt-2">Datos del inmueble</h4>
      <Field label="Referencia IKESA" field="propertyRef" />
      <Field label="Registro de la propiedad" field="propertyRegistry" />
      <Field label="Dirección del inmueble" field="propertyAddress" colSpan />
    </>
  );

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2 mb-2">
        <Scale className="w-5 h-5 text-accent" />
        Formularios Legales
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Genera documentos legales en PDF con los datos del comprador y del inmueble.
      </p>

      <Tabs defaultValue="reserva">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="reserva" className="gap-2"><Bookmark className="w-3.5 h-3.5" /> Reserva</TabsTrigger>
          <TabsTrigger value="compraventa" className="gap-2"><Building2 className="w-3.5 h-3.5" /> Compraventa</TabsTrigger>
          <TabsTrigger value="demanda" className="gap-2"><FileText className="w-3.5 h-3.5" /> Demanda</TabsTrigger>
        </TabsList>

        <TabsContent value="reserva">
          <div className="grid grid-cols-2 gap-4">
            <BuyerFields />
            <PropertyFields />
            <h4 className="col-span-2 text-xs font-bold text-foreground mt-2">Condiciones</h4>
            <Field label="Precio de compra (€)" field="price" type="number" />
            <Field label="Señal de reserva (€)" field="deposit" type="number" />
            <Field label="Validez hasta" field="reservaExpiry" type="date" />
          </div>
          <Button onClick={() => handleGenerate("reserva")} className="mt-6 gap-2">
            <Download className="w-4 h-4" /> Generar contrato de reserva
          </Button>
        </TabsContent>

        <TabsContent value="compraventa">
          <div className="grid grid-cols-2 gap-4">
            <BuyerFields />
            <PropertyFields />
            <h4 className="col-span-2 text-xs font-bold text-foreground mt-2">Condiciones económicas</h4>
            <Field label="Precio de compra (€)" field="price" type="number" />
            <Field label="Arras (€)" field="deposit" type="number" />
          </div>
          <Button onClick={() => handleGenerate("compraventa")} className="mt-6 gap-2">
            <Download className="w-4 h-4" /> Generar contrato de compraventa
          </Button>
        </TabsContent>

        <TabsContent value="demanda">
          <div className="grid grid-cols-2 gap-4">
            <BuyerFields />
            <PropertyFields />
            <h4 className="col-span-2 text-xs font-bold text-foreground mt-2">Información judicial</h4>
            <Field label="Juzgado" field="courtName" />
            <Field label="Nº Procedimiento" field="proceedingNumber" />
            <div className="col-span-2">
              <Label className="text-xs">Descripción de la reclamación</Label>
              <textarea
                value={formData.claimDescription}
                onChange={(e) => updateField("claimDescription", e.target.value)}
                className="w-full mt-1 bg-background border border-input rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <Button onClick={() => handleGenerate("demanda")} className="mt-6 gap-2">
            <Download className="w-4 h-4" /> Generar formulario de demanda
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LegalForms;

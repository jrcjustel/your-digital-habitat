import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, CheckSquare, FileText } from "lucide-react";
import jsPDF from "jspdf";

type AssetType = "npl" | "cdr" | "ocupado" | "reo-libre";

const checklists: Record<AssetType, { label: string; color: string; items: { category: string; tasks: string[] }[] }> = {
  npl: {
    label: "NPL — Credito Impagado",
    color: "bg-accent/10 text-accent",
    items: [
      { category: "Pre-analisis", tasks: [
        "Verificar existencia y tipo de garantia hipotecaria",
        "Consultar estado del procedimiento judicial (ejecutivo/concursal)",
        "Comprobar cargas registrales en Registro de la Propiedad",
        "Identificar numero de titulares del prestamo",
        "Solicitar nota simple actualizada",
      ]},
      { category: "Valoracion", tasks: [
        "Obtener valor de mercado del activo garantia",
        "Calcular descuento sobre deuda pendiente (OB)",
        "Estimar costes judiciales de ejecucion",
        "Analizar liquidez de la zona del inmueble",
        "Calcular ROI segun estrategia de salida",
      ]},
      { category: "Due Diligence", tasks: [
        "Revisar contrato de cesion de credito",
        "Verificar subrogacion en posicion acreedora",
        "Comprobar estado ocupacional del inmueble",
        "Consultar con abogado especialista en NPL",
        "Verificar que el servicer tiene facultades de cesion",
      ]},
      { category: "Ejecucion", tasks: [
        "Firmar contrato de cesion ante notario",
        "Inscribir cesion en Registro de la Propiedad",
        "Comunicar cesion al Juzgado (si procede)",
        "Planificar estrategia de recuperacion/posesion",
        "Contratar seguro de responsabilidad civil",
      ]},
    ],
  },
  cdr: {
    label: "Cesion de Remate",
    color: "bg-primary/10 text-primary",
    items: [
      { category: "Pre-analisis", tasks: [
        "Verificar que la subasta ha quedado desierta o adjudicada al ejecutante",
        "Comprobar el auto de adjudicacion",
        "Solicitar nota simple actualizada del inmueble",
        "Verificar estado ocupacional",
        "Consultar cargas anteriores y posteriores",
      ]},
      { category: "Valoracion", tasks: [
        "Obtener valor de mercado actualizado",
        "Calcular precio total (adjudicacion + cesion)",
        "Estimar costes de reforma si aplica",
        "Evaluar tiempo hasta posesion efectiva",
        "Calcular ROI neto tras costes",
      ]},
      { category: "Due Diligence", tasks: [
        "Revisar decreto de adjudicacion",
        "Verificar que la cesion es viable legalmente",
        "Comprobar identidad y capacidad del cedente",
        "Consultar con procurador del juzgado",
        "Verificar inexistencia de terceros con derecho preferente",
      ]},
      { category: "Ejecucion", tasks: [
        "Formalizar cesion mediante escrito al Juzgado",
        "Obtener auto de aprobacion de cesion",
        "Solicitar mandamiento de cancelacion de cargas",
        "Inscribir en Registro de la Propiedad",
        "Gestionar toma de posesion (lanzamiento si ocupado)",
      ]},
    ],
  },
  ocupado: {
    label: "Inmueble Ocupado",
    color: "bg-destructive/10 text-destructive",
    items: [
      { category: "Pre-analisis", tasks: [
        "Determinar tipo de ocupacion (titulo vencido, sin titulo, vulnerable)",
        "Consultar padronal y servicios contratados",
        "Obtener nota simple actualizada",
        "Verificar existencia de procedimientos judiciales previos",
        "Consultar normativa autonomica de desahucio",
      ]},
      { category: "Valoracion", tasks: [
        "Obtener valor de mercado en estado vacio",
        "Calcular descuento por ocupacion (30-50% tipico)",
        "Estimar costes legales del lanzamiento",
        "Estimar plazo judicial hasta posesion (6-24 meses)",
        "Calcular ROI incluyendo coste de oportunidad temporal",
      ]},
      { category: "Due Diligence", tasks: [
        "Verificar situacion registral completa",
        "Comprobar si hay menores o personas vulnerables",
        "Consultar con abogado especialista en desahucios",
        "Evaluar viabilidad de negociacion directa",
        "Revisar jurisprudencia local sobre plazos",
      ]},
      { category: "Ejecucion", tasks: [
        "Iniciar procedimiento de desahucio o verbal de posesion",
        "Intentar mediacion/acuerdo extrajudicial",
        "Seguimiento judicial activo",
        "Coordinar con cerrajero y fuerzas de orden (lanzamiento)",
        "Planificar reforma post-posesion",
      ]},
    ],
  },
  "reo-libre": {
    label: "REO Libre (Vacío)",
    color: "bg-[hsl(142,71%,45%)]/10 text-[hsl(142,71%,45%)]",
    items: [
      { category: "Pre-analisis", tasks: [
        "Solicitar nota simple actualizada",
        "Verificar estado fisico del inmueble (visita)",
        "Comprobar certificado energetico",
        "Consultar IBI y comunidad al dia",
        "Verificar que esta efectivamente vacio",
      ]},
      { category: "Valoracion", tasks: [
        "Comparar con testigos de zona (precio/m2)",
        "Estimar costes de reforma si necesario",
        "Calcular rentabilidad bruta por alquiler",
        "Evaluar potencial de revalorizacion",
        "Calcular ROI neto a 3 y 5 anios",
      ]},
      { category: "Due Diligence", tasks: [
        "Verificar titularidad y capacidad de venta",
        "Comprobar inexistencia de cargas o gravamenes",
        "Revisar estatutos de comunidad de propietarios",
        "Verificar licencias urbanisticas",
        "Consultar plan general de ordenacion urbana",
      ]},
      { category: "Ejecucion", tasks: [
        "Negociar precio y condiciones",
        "Firmar contrato de arras",
        "Gestionar financiacion si necesario",
        "Firma ante notario",
        "Inscripcion en Registro de la Propiedad",
      ]},
    ],
  },
};

const generatePdf = (type: AssetType) => {
  const c = checklists[type];
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("IKESA - Checklist de Inversion", 20, 25);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(c.label, 20, 35);
  doc.setFontSize(9);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, 20, 42);

  let y = 55;
  c.items.forEach((cat) => {
    if (y > 260) { doc.addPage(); y = 25; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(cat.category.toUpperCase(), 20, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    cat.tasks.forEach((task) => {
      if (y > 275) { doc.addPage(); y = 25; }
      doc.rect(22, y - 3, 3, 3);
      doc.text(task, 28, y);
      y += 6;
    });
    y += 4;
  });

  doc.save(`checklist-${type}-ikesa.pdf`);
};

const InvestmentChecklistGenerator = () => {
  const [selected, setSelected] = useState<AssetType>("npl");
  const c = checklists[selected];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <CheckSquare className="w-5 h-5 text-accent" />
        <h3 className="font-heading text-lg font-bold text-foreground">Checklist de Inversion</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Selecciona un tipo de activo para ver y descargar la checklist profesional paso a paso.
      </p>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(checklists) as AssetType[]).map((key) => (
          <Button
            key={key}
            variant={selected === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelected(key)}
          >
            {checklists[key].label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              <Badge className={c.color}>{c.label}</Badge>
            </div>
            <Button size="sm" onClick={() => generatePdf(selected)} className="gap-2">
              <Download className="w-4 h-4" /> Descargar PDF
            </Button>
          </div>
          <div className="space-y-6">
            {c.items.map((cat) => (
              <div key={cat.category}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{cat.category}</h4>
                <div className="space-y-2">
                  {cat.tasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-muted rounded-lg p-2.5">
                      <div className="w-4 h-4 rounded border-2 border-border mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentChecklistGenerator;

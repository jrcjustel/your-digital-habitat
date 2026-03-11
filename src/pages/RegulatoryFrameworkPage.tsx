import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Scale, BookOpen, AlertTriangle, Shield, FileText, Gavel, ArrowRight, Building2, Clock, Users } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const laws = [
  {
    id: "lec",
    title: "Ley de Enjuiciamiento Civil (LEC)",
    articles: "Arts. 681–698",
    icon: Gavel,
    relevance: "Crítica",
    description: "Regula el procedimiento de ejecución hipotecaria, subastas judiciales, cesión de remate y el proceso de lanzamiento. Base legal de la mayoría de operaciones distressed.",
    keyPoints: [
      "Art. 671: Subasta sin postores — adjudicación al ejecutante por 50% (vivienda habitual) o 60%",
      "Art. 674: Cesión de remate a tercero antes del auto de adjudicación",
      "Art. 704: Lanzamiento de ocupantes del inmueble hipotecado",
      "Art. 693: Reclamación de totalidad del préstamo por vencimiento anticipado",
    ],
  },
  {
    id: "lh",
    title: "Ley Hipotecaria (LH)",
    articles: "Arts. 1–332",
    icon: Building2,
    relevance: "Alta",
    description: "Regula la inscripción de derechos reales, la cancelación de cargas, y la protección registral del adquirente de buena fe.",
    keyPoints: [
      "Art. 34: Protección del tercero hipotecario de buena fe",
      "Art. 131: Cancelación de cargas posteriores tras adjudicación",
      "Art. 114: Límite de intereses de demora en hipotecas sobre vivienda",
      "Art. 82: Cancelación de inscripciones",
    ],
  },
  {
    id: "cc",
    title: "Código Civil — Cesión de créditos",
    articles: "Arts. 1526–1536",
    icon: FileText,
    relevance: "Alta",
    description: "Marco legal de la cesión de créditos (NPL). Regula la transmisión de derechos del acreedor y las obligaciones del cesionario.",
    keyPoints: [
      "Art. 1526: El cesionario se subroga en todos los derechos del cedente",
      "Art. 1527: El deudor puede oponer al cesionario las excepciones que tuviera contra el cedente",
      "Art. 1535: Retracto del deudor en créditos litigiosos (precio + costas + intereses)",
      "No es necesario el consentimiento del deudor para la cesión",
    ],
  },
  {
    id: "lau",
    title: "Ley de Arrendamientos Urbanos (LAU)",
    articles: "Ley 29/1994",
    icon: Users,
    relevance: "Media",
    description: "Aplicable cuando el inmueble está ocupado con contrato de arrendamiento vigente. Regula derechos del inquilino, plazos mínimos y proceso de desahucio por impago.",
    keyPoints: [
      "Art. 14: Derecho del arrendatario frente a adquirente — contratos inscritos vs no inscritos",
      "Art. 9: Duración mínima del contrato (5 años persona física, 7 jurídica)",
      "Reforma 2023: Nuevas protecciones para zonas tensionadas",
      "Desahucio express por impago: 3-6 meses en juzgados ágiles",
    ],
  },
  {
    id: "lcsp",
    title: "Ley Concursal",
    articles: "RDL 1/2020",
    icon: AlertTriangle,
    relevance: "Media",
    description: "Regula la venta de activos en procedimientos concursales (empresas en insolvencia). Afecta a NPLs con deudores en concurso de acreedores.",
    keyPoints: [
      "Fase de liquidación: venta de activos por administrador concursal",
      "Plan de liquidación: puede incluir venta directa sin subasta",
      "Créditos con garantía real: privilegio especial en el cobro",
      "Convenio: posibilidad de quita y espera sobre la deuda",
    ],
  },
  {
    id: "vulnerabilidad",
    title: "Protección de Consumidores Vulnerables",
    articles: "RDL 11/2020 y extensiones",
    icon: Shield,
    relevance: "Crítica",
    description: "Medidas de protección para deudores y ocupantes vulnerables que pueden suspender lanzamientos. Impacta directamente en plazos y viabilidad de operaciones con inmuebles ocupados.",
    keyPoints: [
      "Suspensión de lanzamientos para hogares vulnerables (vigente con extensiones periódicas)",
      "Definición de vulnerabilidad: ingresos < 3x IPREM, circunstancias agravantes",
      "Obligación de ofrecer alquiler social antes del lanzamiento",
      "Fondo social de vivienda para grandes tenedores",
    ],
  },
];

const timelines = [
  { process: "Ejecución hipotecaria", duration: "12–24 meses", ccaa: "Media nacional" },
  { process: "Cesión de remate", duration: "1–3 meses (post-subasta)", ccaa: "Media nacional" },
  { process: "Desahucio por precario", duration: "6–18 meses", ccaa: "Variable por CCAA" },
  { process: "Desahucio por impago alquiler", duration: "3–12 meses", ccaa: "Variable por CCAA" },
  { process: "Verbal de posesión (art. 250.1.7 LEC)", duration: "4–10 meses", ccaa: "Variable por CCAA" },
];

const RegulatoryFrameworkPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />

    <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-14 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
            <Scale className="w-6 h-6 text-accent" />
          </div>
          <Badge variant="secondary" className="text-xs">Guía Legal</Badge>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Marco Legal de la Inversión Distressed
        </h1>
        <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl">
          Guía educativa sobre la normativa clave que afecta a la inversión en activos NPL, REO,
          cesiones de remate e inmuebles ocupados en España.
        </p>
      </div>
    </section>

    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-12">

      {/* Disclaimer */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Aviso importante</p>
          <p className="text-xs text-muted-foreground">
            Esta guía tiene carácter exclusivamente informativo y educativo. No constituye asesoramiento jurídico.
            Consulta siempre con un abogado especializado antes de realizar cualquier operación de inversión.
          </p>
        </div>
      </div>

      {/* Laws */}
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Scale className="w-5 h-5 text-accent" /> Normativa Clave
        </h2>
        <Accordion type="multiple" className="space-y-3">
          {laws.map((law) => (
            <AccordionItem key={law.id} value={law.id} className="bg-card rounded-2xl border border-border px-5">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <law.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{law.title}</span>
                      <Badge variant="outline" className="text-[10px]">{law.articles}</Badge>
                      <Badge variant={law.relevance === "Crítica" ? "destructive" : "secondary"} className="text-[10px]">
                        {law.relevance}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{law.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="space-y-2 ml-13">
                  {law.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 bg-muted rounded-lg p-3">
                      <span className="text-accent font-bold text-xs mt-0.5 shrink-0">{i + 1}.</span>
                      <span className="text-sm text-foreground">{point}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Timelines */}
      <div>
        <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" /> Plazos Judiciales Orientativos
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground">Procedimiento</th>
                    <th className="text-left p-4 font-semibold text-foreground">Duración estimada</th>
                    <th className="text-left p-4 font-semibold text-foreground">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {timelines.map((t, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="p-4 font-medium text-foreground">{t.process}</td>
                      <td className="p-4">
                        <Badge variant="outline">{t.duration}</Badge>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">{t.ccaa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-accent/20">
          <CardContent className="p-6 flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-accent shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground mb-1">Profundiza en la Academia</p>
              <p className="text-xs text-muted-foreground mb-3">Rutas formativas especializadas por tipo de activo con casos prácticos.</p>
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <Link to="/academia"><ArrowRight className="w-3 h-3" /> Ir a la Academia</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-accent/20">
          <CardContent className="p-6 flex items-start gap-4">
            <Gavel className="w-8 h-8 text-accent shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground mb-1">Asesoramiento legal</p>
              <p className="text-xs text-muted-foreground mb-3">Conecta con abogados especializados en inversión distressed a través de IKESA.</p>
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <Link to="/contacto"><ArrowRight className="w-3 h-3" /> Contactar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <Footer />
  </div>
);

export default RegulatoryFrameworkPage;

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, FileText, Scale, Building2, BarChart3, ShieldCheck, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const serviciosIncluidos = [
  {
    icon: FileText,
    title: "Análisis documental",
    description: "Revisamos y estructuramos la información y documentación de la oportunidad. Tras realizar una oferta, solicitamos la documentación necesaria para presentarla siguiendo los protocolos del fondo.",
  },
  {
    icon: Scale,
    title: "Análisis jurídico",
    description: "Analizamos la situación legal de la oportunidad para ayudarte a entender la operación con claridad: qué posición estás adquiriendo y qué implicaciones puede tener el proceso.",
  },
  {
    icon: Building2,
    title: "Análisis inmobiliario",
    description: "Evaluamos el activo inmobiliario vinculado a la oportunidad como parte del análisis previo, para aportar una visión más completa antes de avanzar.",
  },
  {
    icon: BarChart3,
    title: "Análisis financiero",
    description: "Analizamos la oportunidad desde una perspectiva financiera, calculando rentabilidades esperadas, costes asociados y escenarios de salida para que tomes decisiones informadas.",
  },
  {
    icon: ShieldCheck,
    title: "Proceso de PBC",
    description: "Te guiamos en el proceso de Prevención de Blanqueo de Capitales, requisito indispensable para formalizar cualquier operación con entidades financieras y fondos.",
  },
  {
    icon: CheckCircle2,
    title: "Cierre de la operación",
    description: "Te acompañamos durante todo el proceso de cierre, desde la negociación final hasta la firma ante notario, asegurando que cada paso se ejecute correctamente.",
  },
];

const tarifasGestoria = [
  { categoria: "Escrituras", items: [
    { concepto: "Compraventa", honorarios: "380,00 €" },
    { concepto: "Cancelación de hipoteca", honorarios: "350,00 €" },
    { concepto: "Obra nueva", honorarios: "300 € – 1.000 €" },
    { concepto: "División horizontal", honorarios: "350 € – 2.000 €" },
    { concepto: "Herencias", honorarios: "450 € – 2.500 €" },
    { concepto: "Donaciones", honorarios: "250 € – 700 €" },
    { concepto: "Fin de obra", honorarios: "300 € – 1.000 €" },
  ]},
  { categoria: "Catastro", items: [
    { concepto: "Cambio titularidad catastral", honorarios: "30,00 €" },
    { concepto: "Subsanación referencia catastral", honorarios: "75,00 €" },
  ]},
  { categoria: "VPO / VPP", items: [
    { concepto: "Certificado precio máximo venta VPO", honorarios: "210,00 €" },
    { concepto: "Autorización de venta VPO", honorarios: "210,00 €" },
  ]},
  { categoria: "Certificados", items: [
    { concepto: "Tanteo y retracto", honorarios: "175,00 €" },
    { concepto: "CEE (Certificado Energético)", honorarios: "210,00 €" },
  ]},
  { categoria: "Deudas (IBI y CCPP)", items: [
    { concepto: "Obtención deuda y pago IBI", honorarios: "60,00 €" },
    { concepto: "Obtención deuda comunidad propietarios", honorarios: "60,00 €" },
  ]},
  { categoria: "Fiscalidad", items: [
    { concepto: "Análisis fiscal", honorarios: "120,00 €" },
    { concepto: "Pago ITP / AJD", honorarios: "120,00 €" },
    { concepto: "Pago sucesiones y donaciones", honorarios: "300,00 €" },
    { concepto: "No residentes (Modelo 211)", honorarios: "120,00 €" },
  ]},
  { categoria: "Plusvalía", items: [
    { concepto: "Comunicación transmisión Ayto.", honorarios: "30,00 €" },
    { concepto: "Estudio y cálculo", honorarios: "120,00 €" },
  ]},
];

const tarifasMediacion = [
  {
    categoria: "Informes Ocupacionales / Pre Due Diligence",
    descripcion: "Análisis integral del estado y ocupación de inmuebles. Elaboramos informes completos sobre la situación ocupacional y física de los activos, ofreciendo información precisa y verificable para agilizar decisiones y prevenir riesgos en operaciones inmobiliarias.",
    gestiones: [
      "Informes previos a la compra de carteras",
      "Informes de localización de ocupantes",
      "Informes de mediación NPLs y REOS",
      "Informes tomas de posesión y lanzamiento",
    ],
    items: [
      { concepto: "Informes ocupacionales (1–5 uds.)", honorarios: "250 €/ud" },
      { concepto: "Informes ocupacionales (+5 uds.)", honorarios: "200 €/ud" },
      { concepto: "Informe jurídico precompra (24h) — 1 a 5 uds.", honorarios: "250 €/ud" },
      { concepto: "Informe jurídico precompra (24h) — +5 uds.", honorarios: "200 €/ud" },
      { concepto: "Due Diligence jurídica (48h) — 1 a 5 uds.", honorarios: "Desde 600 €" },
      { concepto: "Pack: Inf. Jurídico + Inf. Ocupacional", honorarios: "400 €/ud" },
    ],
  },
  {
    categoria: "Mediación (Cash for Keys)",
    descripcion: "Soluciones negociadas para la recuperación pacífica de inmuebles. Gestionamos la mediación y negociación con los ocupantes para alcanzar acuerdos amistosos que permitan recuperar la posesión de los inmuebles de forma ágil y eficaz.",
    gestiones: [
      "Mediación con los ocupantes",
      "Solución amistosa y mutuamente beneficiosa",
      "Mediaciones con cualquier tipología de ocupantes: deudores hipotecarios, inquilinos u ocupantes sin título",
    ],
    items: [
      { concepto: "Mediación extrajudicial — Resolución CFK (3–15 días)", honorarios: "250 €/ud" },
      { concepto: "Mediación extrajudicial (21 días)", honorarios: "200 €/ud" },
      { concepto: "Negociación amistosa (0–3 meses)", honorarios: "1.500 € + 50% ahorro sobre 5% valor inmueble" },
    ],
  },
  {
    categoria: "Door Knocking / Prenegociación",
    descripcion: "Evaluación inicial y acercamiento estratégico al deudor. Realizamos intervenciones directas con los deudores para evaluar la situación ocupacional y establecer acuerdos de mediación que permitan recuperar el valor máximo de la deuda de manera ágil y segura.",
    gestiones: [
      "Informe ocupacional en relación con la situación del deudor",
      "Firma de carta de intenciones aceptando una mediación en relación con su deuda",
    ],
    items: [],
  },
  {
    categoria: "Gestión de procedimientos judiciales",
    descripcion: "Gestión integral de procedimientos judiciales. Aseguramos la continuidad de los procedimientos judiciales tras la compraventa de inmuebles ocupados o alquilados, garantizando la fluidez en las operaciones y minimizando riesgos legales.",
    gestiones: [
      "Ejecuciones Hipotecarias",
      "Desahucios por precario",
      "Desahucios por falta de pago",
      "Efectividad de derechos reales inscritos",
      "Propiedad Horizontal",
      "Denuncias por ocupación",
      "Reclamaciones de cantidad y daños",
    ],
    items: [
      { concepto: "Asistencia judicial completa (incl. procurador)", honorarios: "2.950 €" },
      { concepto: "Personación y gestión CDR (pago inicial + fin)", honorarios: "1.000 € + 1.800 €" },
      { concepto: "Sucesión + homologación ocupante (incl. desistimiento)", honorarios: "750 €" },
    ],
  },
  {
    categoria: "Comercialización de Activos (Real Estate)",
    descripcion: "Comercialización estratégica de activos ocupados y desocupados. Facilitamos soluciones integrales para la comercialización de activos, incluso en situación de ocupación, aprovechando una red consolidada de agentes e inversores que permite cerrar operaciones de forma rápida y segura.",
    gestiones: [
      "Intermediación en venta de activos",
      "Contratos de arras y compraventa",
      "Contratos de arrendamiento",
    ],
    items: [],
  },
  {
    categoria: "Servicios de Gestoría (FyG)",
    descripcion: "Soluciones integrales de gestoría para operaciones inmobiliarias. A través de FyG, empresa matriz y referente en el sector del Servicing inmobiliario en España, ofrecemos servicios de gestoría que agilizan procesos, garantizan cumplimiento normativo y aportan seguridad jurídica.",
    gestiones: [
      "Gestión de Adquisición de Carteras (NPLs y REOS)",
      "Inscripción de documentos (Notariales, Judiciales y Admvos.) y Gestiones de Adecuación",
      "Gestión Prejudicial",
      "Fiscalidad Inmobiliaria",
      "Gestión de Tributos Municipales y CCPP",
      "Closing (Formalización y Asistencia a Firmas)",
      "Gestión Hipotecaria para Entidades Financieras",
    ],
    items: [],
  },
];

const Servicios = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Servicios y Honorarios | IKESA"
        description="Servicios incluidos en cada operación y tarifas de gestoría y mediación legal. Acompañamiento experto de principio a fin."
        canonical="/servicios"
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Servicios & Honorarios
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Todo lo que necesitas para invertir con claridad, criterio y acompañamiento experto.
          </p>
          <p className="text-primary-foreground/60 max-w-2xl mx-auto mt-2">
            En IKESA te damos el análisis y el soporte necesarios para tomar decisiones informadas y ejecutar cada operación con seguridad.
          </p>
        </div>
      </section>

      {/* Servicios incluidos */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Servicios incluidos en cada operación
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Los honorarios contemplados en cada producto incluyen acompañamiento y análisis experto. De la oferta a la firma, y el seguimiento.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <Link to="/valorar">
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                Solicitar presupuesto personalizado
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviciosIncluidos.map((service) => (
              <div
                key={service.title}
                className="bg-card rounded-2xl border border-border p-6 hover:border-accent/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <service.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifas y Honorarios */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Tarifas y honorarios
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Servicios complementarios de gestoría y mediación legal para cubrir todas las necesidades de tu operación.
            </p>
          </div>

          <Tabs defaultValue="gestoria" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="gestoria">Gestoría</TabsTrigger>
              <TabsTrigger value="mediacion">Mediación Legal</TabsTrigger>
            </TabsList>

            <TabsContent value="gestoria">
              <div className="space-y-6">
                {tarifasGestoria.map((grupo) => (
                  <div key={grupo.categoria} className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="bg-primary/5 px-5 py-3 border-b border-border">
                      <h3 className="font-heading font-bold text-foreground text-sm uppercase tracking-wide">
                        {grupo.categoria}
                      </h3>
                    </div>
                    <div className="divide-y divide-border">
                      {grupo.items.map((item) => (
                        <div key={item.concepto} className="flex items-center justify-between px-5 py-3">
                          <span className="text-sm text-foreground">{item.concepto}</span>
                          <span className="text-sm font-semibold text-accent whitespace-nowrap ml-4">
                            {item.honorarios}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mediacion">
              <Accordion type="single" collapsible className="space-y-4">
                {tarifasMediacion.map((grupo) => (
                  <AccordionItem key={grupo.categoria} value={grupo.categoria} className="bg-card rounded-xl border border-border overflow-hidden">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline bg-primary/5">
                      <h3 className="font-heading font-bold text-foreground text-sm uppercase tracking-wide text-left">
                        {grupo.categoria}
                      </h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 pt-3">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {grupo.descripcion}
                      </p>
                      {grupo.gestiones.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Gestiones que realizamos:</p>
                          <ul className="space-y-1">
                            {grupo.gestiones.map((g) => (
                              <li key={g} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {grupo.items.length > 0 && (
                        <div className="border-t border-border pt-4">
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Tarifas:</p>
                          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                            {grupo.items.map((item) => (
                              <div key={item.concepto} className="flex items-center justify-between px-4 py-2.5 bg-secondary/30">
                                <span className="text-sm text-foreground">{item.concepto}</span>
                                <span className="text-sm font-semibold text-accent whitespace-nowrap ml-4">
                                  {item.honorarios}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center mt-6 max-w-2xl mx-auto">
            * Todos los importes son orientativos y no incluyen IVA. Consulta con nuestro equipo para un presupuesto personalizado.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
            ¿Necesitas asesoramiento personalizado?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Nuestro equipo está disponible para resolver tus dudas y acompañarte en todo el proceso de inversión.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/inmuebles">
              <Button size="lg" className="gap-2">
                Ver oportunidades <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/como-funciona">
              <Button size="lg" variant="outline">
                Cómo funciona
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Servicios;

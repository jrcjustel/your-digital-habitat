import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, FileText, Scale, Building2, BarChart3, ShieldCheck, CheckCircle2, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

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

      {/* Hero — asymmetric split */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-accent blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent blur-[100px] -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-accent font-medium text-sm tracking-widest uppercase mb-4"
            >
              Transparencia total
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-5 leading-tight"
            >
              Servicios & Honorarios
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-primary-foreground/75 text-lg md:text-xl max-w-2xl leading-relaxed"
            >
              Cada operación incluye análisis experto. Y si necesitas más, aquí tienes todos los servicios complementarios con sus tarifas.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <Link to="/valorar">
                <Button size="lg" variant="secondary" className="gap-2 font-semibold">
                  <Mail className="w-4 h-4" />
                  Solicitar presupuesto personalizado
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Servicios incluidos — horizontal scrolling cards on mobile, staggered grid on desktop */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-1 rounded-full bg-accent" />
            <p className="text-accent font-semibold text-sm tracking-widest uppercase">Incluido en cada operación</p>
          </div>
          <h2 className="font-heading text-2xl md:text-4xl font-bold text-foreground mb-4">
            Tu equipo de análisis
          </h2>
          <p className="text-muted-foreground max-w-xl mb-12 text-lg">
            Los honorarios de cada producto ya incluyen este acompañamiento. De la oferta a la firma.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {serviciosIncluidos.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card p-8 group hover:bg-secondary/30 transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                  <service.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-heading text-base font-bold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-border" />
      </div>

      {/* Tarifas — unified view with two columns */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-1 rounded-full bg-accent" />
            <p className="text-accent font-semibold text-sm tracking-widest uppercase">Servicios complementarios</p>
          </div>
          <h2 className="font-heading text-2xl md:text-4xl font-bold text-foreground mb-4">
            Tarifas y honorarios
          </h2>
          <p className="text-muted-foreground max-w-xl mb-12 text-lg">
            Gestoría y mediación legal para cubrir cada fase de tu operación, con total transparencia.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left column — Gestoría */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-5 h-5 text-accent" />
                <h3 className="font-heading text-xl font-bold text-foreground">Gestoría</h3>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {tarifasGestoria.map((grupo) => (
                  <AccordionItem key={grupo.categoria} value={grupo.categoria} className="bg-card rounded-xl border border-border overflow-hidden">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-secondary/30 transition-colors">
                      <span className="font-heading font-semibold text-foreground text-sm text-left flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-accent shrink-0 transition-transform" />
                        {grupo.categoria}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 pt-1">
                      <div className="space-y-0 divide-y divide-border">
                        {grupo.items.map((item) => (
                          <div key={item.concepto} className="flex items-center justify-between py-2.5">
                            <span className="text-sm text-muted-foreground">{item.concepto}</span>
                            <span className="text-sm font-semibold text-foreground whitespace-nowrap ml-4 tabular-nums">
                              {item.honorarios}
                            </span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Right column — Mediación Legal */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Scale className="w-5 h-5 text-accent" />
                <h3 className="font-heading text-xl font-bold text-foreground">Mediación Legal</h3>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {tarifasMediacion.map((grupo) => (
                  <AccordionItem key={grupo.categoria} value={grupo.categoria} className="bg-card rounded-xl border border-border overflow-hidden">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-secondary/30 transition-colors">
                      <span className="font-heading font-semibold text-foreground text-sm text-left flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-accent shrink-0 transition-transform" />
                        {grupo.categoria}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 pt-3">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {grupo.descripcion}
                      </p>
                      {grupo.gestiones.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Gestiones que realizamos:</p>
                          <ul className="space-y-1.5">
                            {grupo.gestiones.map((g) => (
                              <li key={g} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {grupo.items.length > 0 && (
                        <div className="border-t border-border pt-4 mt-4">
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Tarifas:</p>
                          <div className="space-y-0 divide-y divide-border">
                            {grupo.items.map((item) => (
                              <div key={item.concepto} className="flex items-center justify-between py-2.5">
                                <span className="text-sm text-muted-foreground">{item.concepto}</span>
                                <span className="text-sm font-semibold text-foreground whitespace-nowrap ml-4 tabular-nums">
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
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-10 max-w-2xl mx-auto">
            * Todos los importes son orientativos y no incluyen IVA. Consulta con nuestro equipo para un presupuesto personalizado.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
            ¿Necesitas asesoramiento personalizado?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Nuestro equipo está disponible para resolver tus dudas y acompañarte en todo el proceso.
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

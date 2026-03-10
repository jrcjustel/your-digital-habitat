import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead, { createFAQSchema, createBreadcrumbSchema } from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Gavel,
  Handshake,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  Clock,
  Users,
  BadgePercent,
  X,
  FileText,
  Home,
  Play,
  ChevronRight,
  Building2,
  Scale,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PriceCycleGraph from "@/components/PriceCycleGraph";
import ProcessTimeline from "@/components/ProcessTimeline";
import { motion } from "framer-motion";
import { useState } from "react";

/* ── Reusable pieces ── */
const Bullet = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <li className="flex items-start gap-2 text-sm text-muted-foreground">
    <span className="mt-0.5 flex-shrink-0">{icon}</span>
    {text}
  </li>
);

/* ── 3 Main Steps (Fencia-inspired cards) ── */
const mainSteps = [
  {
    number: 1,
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Analiza las oportunidades",
    description:
      "Accede a una selección exclusiva de oportunidades como NPLs, cesiones de remate e inmuebles ocupados. Te mostramos de forma estructurada toda la información contractual, judicial, catastral y financiera para que inviertas con confianza.",
    highlights: ["Documentación verificada", "Datos reales de mercado", "Análisis de rentabilidad"],
  },
  {
    number: 2,
    icon: <Gavel className="w-8 h-8" />,
    title: "Haz tu oferta",
    description:
      "Presenta tu oferta mediante nuestro sistema de ofertas directas o participa en subastas privadas online. Define tus condiciones con total libertad y seguridad. Garantizamos un proceso ágil, transparente y trazable.",
    highlights: ["Oferta vinculante digital", "Proceso 100% online", "Transparencia total"],
  },
  {
    number: 3,
    icon: <Handshake className="w-8 h-8" />,
    title: "Materializa la inversión",
    description:
      "Aceptada tu oferta, te acompañamos y asesoramos hasta la formalización notarial. Con IKESA, invertir en activos judicializados o créditos impagados es más sencillo, seguro y rentable que nunca.",
    highlights: ["Asesoramiento integral", "Soporte legal incluido", "Seguimiento post-venta"],
  },
];

/* ── Investment Modalities ── */
const modalities = [
  {
    id: "npl",
    icon: <FileText className="w-7 h-7" />,
    title: "Compraventa de créditos (NPLs)",
    subtitle: "Non-Performing Loans",
    description:
      "Invierte en créditos hipotecarios impagados con garantía inmobiliaria. Conviértete en acreedor y obtén rentabilidad mediante la gestión o recuperación del activo subyacente.",
    details: [
      "Adquieres el derecho de crédito del banco a descuento",
      "Te subrogas como nuevo acreedor hipotecario",
      "Puedes negociar con el deudor o ejecutar la garantía",
      "Descuentos habituales del 40% al 70% sobre valor de mercado",
    ],
    color: "bg-primary",
    cta: "/npl",
  },
  {
    id: "cesion",
    icon: <Scale className="w-7 h-7" />,
    title: "Cesión de remate",
    subtitle: "Adjudicación judicial",
    description:
      "Adquiere inmuebles ya adjudicados en subasta judicial, sin competir en la puja del BOE. El adjudicatario original cede sus derechos a tu favor con descuento y respaldo jurídico.",
    details: [
      "El acreedor-ejecutante cede la adjudicación a tu favor",
      "No necesitas participar directamente en la subasta",
      "Precio habitualmente inferior al valor de mercado",
      "Requiere aprobación del juzgado competente",
    ],
    color: "bg-accent",
    cta: "/inversores/cdr",
  },
  {
    id: "ocupados",
    icon: <Home className="w-7 h-7" />,
    title: "Inmuebles sin posesión",
    subtitle: "Con descuento por ocupación",
    description:
      "Compra inmuebles ocupados a precios reducidos. Una vez recuperada la posesión (por vía amistosa o judicial), el valor se revaloriza sustancialmente.",
    details: [
      "Descuentos del 30% al 60% por situación ocupacional",
      "Análisis previo del tipo de ocupación y vía de resolución",
      "Acompañamiento legal hasta la recuperación de posesión",
      "Plusvalía inmediata tras la desocupación",
    ],
    color: "bg-[hsl(160,60%,35%)]",
    cta: "/inversores/ocupados",
  },
];

/* ── Pros / Cons ── */
const balancePros = [
  "Accede a descuentos del 10-70% según tipología",
  "Inversión con margen de seguridad",
  "Altas rentabilidades que merecen la espera",
  "Asesoramiento integral de IKESA en cada paso",
];
const balanceCons = [
  "Sin financiación hipotecaria directa (posible préstamo personal)",
  "Inmuebles generalmente no visitables antes de la compra",
  "3-9 meses hasta ser propietario registral",
];

/* ── FAQ ── */
const faqs = [
  {
    q: "¿Es necesario registrarse como usuario?",
    a: "El acceso al portal es libre, pero para visualizar sin limitación toda la información y documentación, y participar en ofertas, debes registrarte. Al registrarte firmarás un acuerdo de confidencialidad (NDA) para proteger los datos personales de los expedientes. El registro es ágil, gratuito y te permitirá acceder a tu área de usuario personalizada.",
  },
  {
    q: "¿Qué tipo de oportunidades puedo encontrar en IKESA?",
    a: "En IKESA encontrarás cuatro tipologías: (i) compraventa de préstamos hipotecarios impagados (NPL), (ii) acordar postura en subasta pública del BOE, (iii) cesión de remate del inmueble adjudicado, y (iv) compraventa de inmuebles con o sin posesión.",
  },
  {
    q: "¿Cómo funciona el proceso de participación?",
    a: "Tras realizar tu oferta, contactamos contigo para verificar tu interés. Te facilitamos la documentación completa de la oportunidad para confirmar que avanzamos. Bloqueamos tu oferta, firmas el documento de oferta en la plataforma y la elevamos formalmente al titular. Cuando recibamos la aprobación, te informamos para que procedas al depósito.",
  },
  {
    q: "Si hay varias ofertas, ¿quién tiene prioridad?",
    a: "Para ofertas por debajo del precio orientativo, tiene prioridad la oferta de mayor importe. Para ofertas por encima del precio orientativo, la primera oferta realizada tiene prioridad. Si ésta no confirma su interés, contactamos con la siguiente.",
  },
  {
    q: "¿Una oferta en precio orientativo es siempre aceptada?",
    a: "No necesariamente. En IKESA definimos un precio orientativo basado en análisis financiero, inmobiliario y jurídico. Toda oferta debe ser elevada al titular para su aprobación.",
  },
  {
    q: "¿Qué valores visualizo en cada ficha?",
    a: "Verás: deuda actual aproximada (importe de crédito), valor de tasación a efectos de subasta, valor orientativo de mercado del inmueble, y precio orientativo para la oferta. Cada valor tiene un contexto explicativo en la propia ficha.",
  },
  {
    q: "¿IKESA presta servicios una vez formalizada la operación?",
    a: "Sí. Nuestros honorarios cubren análisis y acompañamiento hasta la formalización. Con posterioridad, prestamos servicio integral para la desinversión o gestión de la posición adquirida.",
  },
  {
    q: "¿En qué consiste una cesión de remate?",
    a: "Tiene lugar en un procedimiento de ejecución hipotecaria. Cuando una subasta queda desierta, el acreedor-ejecutante puede ceder su derecho de adjudicación a un tercero (tú) a cambio de un precio pactado. Esto evita que el banco integre el inmueble en su balance y te permite adquirir a precio inferior al de mercado.",
  },
  {
    q: "¿En qué consiste la compraventa de inmueble sin posesión?",
    a: "Un inmueble puede estar ocupado por personas que residen en él sin título válido (contrato expirado, impagos, ocupación ilegal). El propietario vende el inmueble con descuento por la ocupación. IKESA te asesora en la gestión de la desocupación por vía amistosa o judicial.",
  },
  {
    q: "¿Debo hacer un depósito para participar?",
    a: "Puedes realizar tu oferta sin depósito inicial. Solo una vez aceptada tu oferta se te solicitará un depósito de reserva (habitualmente el 10% del precio) en las 24-48 horas siguientes, junto con la documentación KYC de prevención de blanqueo.",
  },
];

/* ──────────────────── COMPONENT ──────────────────── */

const ComoFunciona = () => {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(false);
  const visibleFaqs = expandedFaq ? faqs : faqs.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Cómo Funciona IKESA — Guía Completa de Inversión Inmobiliaria Alternativa"
        description="Aprende paso a paso cómo invertir en activos NPL, cesiones de remate, subastas BOE e inmuebles ocupados. Guía completa del proceso de inversión con IKESA."
        canonical="/como-funciona"
        keywords="cómo invertir inmuebles, guía inversión NPL, proceso cesión remate, cómo comprar subasta BOE, inversión inmobiliaria paso a paso"
        jsonLd={[
          createBreadcrumbSchema([
            { name: "Inicio", url: "/" },
            { name: "Cómo Funciona", url: "/como-funciona" },
          ]),
          createFAQSchema(faqs.map((f) => ({ question: f.q, answer: f.a }))),
        ]}
      />
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(199_82%_58%/0.15),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl py-20 md:py-28">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[11px] font-bold tracking-widest uppercase text-accent mb-5"
          >
            Un proceso seguro y transparente
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5"
          >
            Cómo funciona{" "}
            <span className="text-accent">IKESA</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-primary-foreground/70 leading-relaxed max-w-2xl mx-auto"
          >
            Invierte en activos inmobiliarios alternativos con total transparencia.
            Te guiamos paso a paso desde el análisis hasta la formalización.
          </motion.p>
        </div>
      </section>

      {/* ── 3 MAIN STEPS (Fencia-style dark cards) ── */}
      <section className="relative -mt-1 bg-primary pb-16 pt-2">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-5">
            {mainSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="bg-primary-foreground/8 border-primary-foreground/10 backdrop-blur-sm h-full hover:bg-primary-foreground/12 transition-all duration-300 group">
                  <CardContent className="p-7">
                    {/* Header: icon + number */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center text-accent group-hover:bg-accent/25 transition-colors">
                        {step.icon}
                      </div>
                      <span className="text-5xl font-black text-primary-foreground/10 group-hover:text-primary-foreground/15 transition-colors">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-primary-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-primary-foreground/60 text-sm leading-relaxed mb-5">
                      {step.description}
                    </p>

                    {/* Highlights */}
                    <ul className="space-y-2">
                      {step.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-xs text-accent font-medium">
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Price Cycle Graph ── */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
              Bajo Riesgo y Alto Rendimiento
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
              Una jugada <span className="text-accent">inteligente</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              El valor del inmueble cae durante el proceso judicial y se recupera tras la adquisición.
              Compra en el punto más bajo y captura toda la plusvalía.
            </p>
          </div>
          <PriceCycleGraph />

          <div className="grid sm:grid-cols-2 gap-6 mt-12 max-w-3xl mx-auto">
            <Card className="border-red-200/50 bg-red-50/30 dark:bg-red-950/10 dark:border-red-900/30">
              <CardContent className="p-6">
                <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">A tener en cuenta</h4>
                <ul className="space-y-3">
                  {balanceCons.map((c, i) => (
                    <Bullet key={i} icon={<X className="w-4 h-4 text-red-500" />} text={c} />
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-green-200/50 bg-green-50/30 dark:bg-green-950/10 dark:border-green-900/30">
              <CardContent className="p-6">
                <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Ventajas</h4>
                <ul className="space-y-3">
                  {balancePros.map((p, i) => (
                    <Bullet key={i} icon={<CheckCircle className="w-4 h-4 text-green-600" />} text={p} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Process Timeline ── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
              Nuestro equipo de expertos a tu disposición
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
              Soporte integral para un proceso{" "}
              <span className="text-accent">sin sorpresas</span>
            </h2>
          </div>
          <ProcessTimeline />
        </div>
      </section>

      {/* ── INVESTMENT MODALITIES (Fencia-style) ── */}
      <section className="bg-secondary/30 border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold tracking-widest uppercase text-accent">
              Modalidades de inversión
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
              ¿En qué puedes invertir?
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Conoce en detalle cada modalidad, sus particularidades y cómo operar en cada una de ellas.
            </p>
          </div>

          <div className="space-y-8">
            {modalities.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden border-border hover:shadow-lg transition-shadow">
                  <div className="grid lg:grid-cols-5 gap-0">
                    {/* Left accent bar + icon */}
                    <div className={`${mod.color} p-8 flex flex-col justify-center items-center text-white lg:col-span-1`}>
                      <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
                        {mod.icon}
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-center opacity-80">
                        {mod.subtitle}
                      </p>
                    </div>

                    {/* Content */}
                    <CardContent className="p-8 lg:col-span-4">
                      <h3 className="text-xl font-bold text-foreground mb-3">{mod.title}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-5">{mod.description}</p>

                      <div className="grid sm:grid-cols-2 gap-3 mb-6">
                        {mod.details.map((d, j) => (
                          <div key={j} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <span className="text-foreground/80">{d}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => navigate(mod.cta)}
                        variant="outline"
                        className="gap-2"
                      >
                        Ver oportunidades
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold tracking-widest uppercase text-accent">Preguntas frecuentes</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
              Resolvemos tus dudas
            </h2>
            <p className="text-muted-foreground mt-3">
              Todo lo que necesitas saber sobre procesos, riesgos, documentación y funcionamiento de la plataforma.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {visibleFaqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="bg-background border border-border rounded-xl px-6 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {faqs.length > 6 && (
            <div className="text-center mt-6">
              <Button
                variant="ghost"
                onClick={() => setExpandedFaq(!expandedFaq)}
                className="gap-2 text-accent hover:text-accent/80"
              >
                {expandedFaq ? "Ver menos preguntas" : `Ver todas las preguntas (${faqs.length})`}
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedFaq ? "rotate-90" : ""}`} />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <Zap className="w-8 h-8 text-accent mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            ¿Listo para invertir con IKESA?
          </h2>
          <p className="text-primary-foreground/60 mb-8">
            Regístrate gratis, firma el NDA y accede a toda la documentación confidencial de nuestros activos. Con anticipación, criterio y seguridad.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Users className="w-4 h-4" />
              Crear cuenta gratuita
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/inmuebles")}
              className="gap-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5"
            >
              <BadgePercent className="w-4 h-4" />
              Explorar oportunidades
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ComoFunciona;

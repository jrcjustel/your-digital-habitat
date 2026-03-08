import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Gavel,
  Home,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Shield,
  Clock,
  Users,
  BadgePercent,
  X,
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

/* ── Small reusable pieces ── */

const Step = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
      {number}
    </div>
    <div>
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

const Bullet = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <li className="flex items-start gap-2 text-sm text-muted-foreground">
    <span className="mt-0.5 flex-shrink-0">{icon}</span>
    {text}
  </li>
);

/* ── Timeline step for the "Ciclo" section ── */
const TimelineStep = ({
  number,
  title,
  description,
  duration,
}: {
  number: number;
  title: string;
  description: string;
  duration: string;
}) => (
  <div className="relative flex gap-5 group">
    {/* vertical line */}
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm z-10">
        {number}
      </div>
      <div className="flex-1 w-px bg-border group-last:hidden" />
    </div>
    <div className="pb-10 group-last:pb-0">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">{duration}</span>
      <h4 className="font-bold text-foreground mt-1 mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

/* ── Product data ── */

const products = [
  {
    id: "npl",
    icon: <FileText className="w-7 h-7" />,
    title: "NPL — Deuda Inmobiliaria",
    subtitle: "Non-Performing Loans",
    description:
      "Adquiere créditos hipotecarios impagados a descuento. Al comprar la deuda, te subrogas en la posición del acreedor y puedes negociar con el deudor o ejecutar la garantía hipotecaria para obtener el inmueble.",
    color: "from-primary to-primary/80",
    steps: [
      { title: "Analiza el activo", description: "Revisa la ficha completa: deuda pendiente, valor de mercado, estado judicial y tipo de procedimiento." },
      { title: "Firma el NDA", description: "Accede a la documentación confidencial (nota simple, tasación, escrituras) tras firmar el acuerdo de confidencialidad." },
      { title: "Presenta tu oferta", description: "Envía una oferta vinculante a través de la plataforma. Nuestro equipo la traslada al servicer." },
      { title: "Cesión del crédito", description: "Una vez aceptada, se formaliza la cesión notarial del crédito hipotecario a tu favor." },
      { title: "Gestiona el activo", description: "Negocia directamente con el deudor, acuerda una dación o continúa el procedimiento judicial." },
    ],
    pros: [
      "Descuentos del 40-70% sobre el valor de mercado",
      "Diversificación con tickets desde 30.000 €",
      "Alta rentabilidad potencial (15-40% anual)",
    ],
    risks: [
      "Proceso judicial puede durar 12-36 meses",
      "Requiere conocimiento del marco legal",
      "El estado del inmueble puede ser incierto",
    ],
    cta: "/npl",
    ctaLabel: "Ver activos NPL disponibles",
  },
  {
    id: "cesion-remate",
    icon: <Gavel className="w-7 h-7" />,
    title: "Cesión de Remate",
    subtitle: "Subasta judicial",
    description:
      "Participa en subastas judiciales con la posibilidad de ceder el remate. El adjudicatario original te transfiere sus derechos sobre el inmueble subastado, evitando los riesgos de participar directamente en la subasta.",
    color: "from-accent to-accent/80",
    steps: [
      { title: "Identifica oportunidades", description: "Filtra inmuebles con cesión de remate disponible en nuestro marketplace." },
      { title: "Revisa la documentación", description: "Estudia el decreto de adjudicación, cargas registrales y estado posesorio del inmueble." },
      { title: "Negocia la cesión", description: "Acuerda con el adjudicatario el precio de cesión y las condiciones de la operación." },
      { title: "Formalización", description: "Se solicita la aprobación judicial de la cesión de remate y se inscribe en el Registro." },
      { title: "Toma de posesión", description: "Obtén las llaves y gestiona el inmueble: reforma, alquila o vende." },
    ],
    pros: [
      "Precio por debajo de mercado (subasta judicial)",
      "Proceso más rápido que una ejecución completa",
      "Inmueble con adjudicación judicial firme",
    ],
    risks: [
      "Posibles cargas anteriores no canceladas",
      "El inmueble puede estar ocupado",
      "La cesión requiere aprobación del juzgado",
    ],
    cta: "/inversores/cesiones-remate",
    ctaLabel: "Ver cesiones de remate",
  },
  {
    id: "ocupados",
    icon: <Home className="w-7 h-7" />,
    title: "Inmuebles Ocupados",
    subtitle: "Con descuento por ocupación",
    description:
      "Inmuebles con ocupantes (inquilinos, precaristas u okupas) que se venden con descuento significativo. Una vez recuperada la posesión, el valor del inmueble se revaloriza sustancialmente.",
    color: "from-emerald-600 to-emerald-500",
    steps: [
      { title: "Selecciona el inmueble", description: "Consulta las fichas con estado ocupacional, tipo de ocupante y situación jurídica detallada." },
      { title: "Due diligence", description: "Verifica cargas, situación registral y valoración del inmueble una vez libre de ocupantes." },
      { title: "Adquisición", description: "Compra el inmueble a precio reducido. Nuestro equipo legal te asesora en todo el proceso." },
      { title: "Recuperación de posesión", description: "Gestiona la desocupación por vía amistosa o judicial con apoyo de abogados especializados." },
      { title: "Monetización", description: "Vende al precio de mercado o alquila para generar rentas periódicas." },
    ],
    pros: [
      "Descuentos del 30-60% por ocupación",
      "Activo tangible (inmueble físico)",
      "Plusvalía inmediata tras la desocupación",
    ],
    risks: [
      "Plazos de desahucio variables (6-18 meses)",
      "Posibles daños en el inmueble",
      "Costes legales de recuperación",
    ],
    cta: "/inversores/ocupados",
    ctaLabel: "Ver inmuebles ocupados",
  },
];

/* ── Cycle timeline data (inspired by Auctree) ── */
const cycleSteps = [
  {
    title: "Haz tu oferta",
    description:
      "Encuentra tu activo y envía una oferta por debajo, igual o superior al precio orientativo. Recibirás notificaciones sobre el estado de tu oferta en tiempo real.",
    duration: "Oferta",
  },
  {
    title: "Revisión y depósito de reserva",
    description:
      "Revisamos tu oferta y confirmamos si ha sido pre-aprobada. En las siguientes 24-48h tras la pre-aprobación, el comprador abona el depósito de reserva.",
    duration: "2-3 días",
  },
  {
    title: "Prevención de blanqueo de capitales",
    description:
      "Te solicitamos documentación sobre el origen de los fondos. Por ley, es obligatorio verificar que los fondos provengan de fuentes legítimas (Ley 10/2010).",
    duration: "1-2 semanas",
  },
  {
    title: "Contrato de arras o reserva",
    description:
      "Se establece las condiciones de la operación y garantiza el cumplimiento entre las partes. El comprador habrá pagado el 10% para reservar su derecho de compra.",
    duration: "1 semana",
  },
  {
    title: "Transferencia de propiedad",
    description:
      "En inmuebles judiciales, un tribunal local supervisa la transferencia. El juez revisará la operación y cancelará las cargas pendientes para que la propiedad quede inscrita libre de cargas a tu nombre.",
    duration: "2-5 meses",
  },
  {
    title: "¡Llaves en mano!",
    description:
      "Acabas de adquirir un inmueble por debajo del precio de mercado. Ya puedes inscribirlo en el Registro de la Propiedad y empezar a rentabilizar tu inversión.",
    duration: "Entrega",
  },
];

/* ── Pros / Cons balance (Auctree style) ── */
const balancePros = [
  "Accede a descuentos del 10-70% según tipología",
  "Inversión con margen de seguridad",
  "Altas rentabilidades que merecen la espera",
  "Asesoramiento integral de Ikesa en cada paso",
];

const balanceCons = [
  "Sin financiación hipotecaria directa (posible préstamo personal)",
  "Inmuebles generalmente no visitables antes de la compra",
  "3-9 meses hasta ser propietario registral",
];

/* ── FAQ ── */
const faqs = [
  {
    q: "¿Por qué los activos tienen información restringida?",
    a: "En Ikesa protegemos la confidencialidad de los datos. Algunos activos requieren la firma de un NDA (acuerdo de confidencialidad) para acceder a la documentación completa. Registrarte es gratuito y rápido.",
  },
  {
    q: "¿Puedo financiar la compra de un inmueble judicial?",
    a: "Muchos de nuestros inversores negocian un préstamo a título personal con su entidad financiera durante el periodo de espera previo a la adjudicación. Una vez obtienen la adjudicación, modifican el préstamo a una hipoteca convencional sobre el inmueble.",
  },
  {
    q: "¿Cómo presento una oferta?",
    a: "Es muy sencillo: revisa la ficha del activo, fíjate en el precio orientativo y envía tu oferta a través de la plataforma. Puede ser por debajo, igual o superior al precio guía. Recibirás notificaciones sobre el estado de tu oferta.",
  },
  {
    q: "¿Cuándo tengo que transferir el depósito?",
    a: "Si tu oferta es aceptada, te solicitaremos un depósito de reserva (habitualmente el 10% del precio) en las 24-48 horas siguientes. Además, deberás completar la documentación KYC de prevención de blanqueo de capitales.",
  },
  {
    q: "¿Qué pasa si el inmueble está ocupado?",
    a: "Los inmuebles ocupados se venden con descuento adicional. Ikesa te asesora en la gestión de la desocupación: desde la negociación amistosa (cash for keys) hasta el procedimiento judicial. El plazo varía según la CCAA (45-180 días).",
  },
  {
    q: "¿Qué es una cesión de remate?",
    a: "Es cuando el adjudicatario de una subasta judicial (generalmente un banco) cede sus derechos sobre el inmueble a un tercero (tú) a cambio de un precio pactado. Requiere aprobación judicial y permite adquirir con un descuento adicional del 10-25% sobre el precio de remate.",
  },
];

/* ──────────────────── COMPONENT ──────────────────── */

const ComoFunciona = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero (Auctree-inspired) ── */}
      <section className="relative bg-primary text-primary-foreground py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(199_82%_58%/0.15),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-accent mb-4">
            El ciclo de los activos judiciales
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
            Gran oportunidad,{" "}
            <span className="text-accent">tiempo limitado.</span>
          </h1>
          <p className="text-lg text-primary-foreground/70 leading-relaxed max-w-2xl mx-auto mb-8">
            Los inmuebles judiciales son aquellos que los bancos se ven obligados a adquirir
            cuando el propietario no puede pagar la hipoteca. Para evitar quedarse con el activo,
            los bancos los venden a precios muy atractivos. Esta es tu oportunidad de comprar
            por debajo del mercado y obtener un alto rendimiento.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/inmuebles")}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            Ver inmuebles <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ── Price Cycle Graph (Auctree-inspired visual) ── */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Bajo Riesgo y Alto Rendimiento</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
              Una jugada <span className="text-accent">inteligente</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              El valor del inmueble cae durante el proceso judicial y se recupera tras la adquisición. Compra en el punto más bajo y captura toda la plusvalía.
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

      {/* ── Visual Process Timeline ── */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">Nuestro equipo de expertos a tu disposición</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
              Soporte integral para un proceso{" "}
              <span className="text-accent">sin sorpresas</span>
            </h2>
          </div>
          <ProcessTimeline />
        </div>
      </section>

      {/* ── Quick nav for product types ── */}
      <section className="border-b border-border bg-card sticky top-16 z-40">
        <div className="container mx-auto px-4 flex gap-2 py-3 overflow-x-auto">
          {products.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full border border-border hover:bg-secondary transition-colors text-foreground"
            >
              {p.title.split("—")[0].trim()}
            </a>
          ))}
        </div>
      </section>

      {/* ── Product sections ── */}
      <div className="container mx-auto px-4 py-16 space-y-24">
        {products.map((product, idx) => (
          <section key={product.id} id={product.id} className="scroll-mt-32">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: Info */}
              <div>
                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r ${product.color} text-white mb-6`}>
                  {product.icon}
                  <div>
                    <p className="font-bold text-sm">{product.title}</p>
                    <p className="text-xs opacity-80">{product.subtitle}</p>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-8 text-base">
                  {product.description}
                </p>

                {/* Pros & Risks */}
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <Card className="border-green-200/50 bg-green-50/30 dark:bg-green-950/10 dark:border-green-900/30">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Ventajas
                      </h4>
                      <ul className="space-y-2">
                        {product.pros.map((p, i) => (
                          <Bullet key={i} icon={<CheckCircle className="w-4 h-4 text-green-600" />} text={p} />
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/10 dark:border-amber-900/30">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-amber-600" />
                        Riesgos a considerar
                      </h4>
                      <ul className="space-y-2">
                        {product.risks.map((r, i) => (
                          <Bullet key={i} icon={<AlertTriangle className="w-4 h-4 text-amber-500" />} text={r} />
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  onClick={() => navigate(product.cta)}
                  className="gap-2"
                  size="lg"
                >
                  {product.ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Right: Steps */}
              <Card className="border-border">
                <CardContent className="p-8">
                  <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    Proceso paso a paso
                  </h3>
                  <div className="space-y-6">
                    {product.steps.map((step, i) => (
                      <Step key={i} number={i + 1} title={step.title} description={step.description} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {idx < products.length - 1 && (
              <div className="border-b border-border mt-24" />
            )}
          </section>
        ))}
      </div>

      {/* ── FAQ (Auctree-inspired) ── */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold tracking-widest uppercase text-accent">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mt-2">
              Preguntas frecuentes
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-sm"
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
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="hero-section py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            ¿Listo para invertir?
          </h2>
          <p className="text-primary-foreground/60 mb-8">
            Regístrate gratis, firma el NDA y accede a toda la documentación confidencial de nuestros activos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Users className="w-4 h-4" />
              Crear cuenta gratuita
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/inversores")} className="gap-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/5">
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

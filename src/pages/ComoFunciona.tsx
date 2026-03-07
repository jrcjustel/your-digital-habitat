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
  Scale,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const Step = ({ number, title, description }: StepProps) => (
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

interface BulletProps {
  icon: React.ReactNode;
  text: string;
}

const Bullet = ({ icon, text }: BulletProps) => (
  <li className="flex items-start gap-2 text-sm text-muted-foreground">
    <span className="mt-0.5 text-accent flex-shrink-0">{icon}</span>
    {text}
  </li>
);

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

const ComoFunciona = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(199_82%_58%/0.15),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full bg-accent/20 text-accent">
            Guía de inversión
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            ¿Cómo funciona?
          </h1>
          <p className="text-lg text-primary-foreground/70 leading-relaxed max-w-2xl mx-auto">
            Tres vehículos de inversión inmobiliaria con alto potencial de rentabilidad.
            Descubre el proceso paso a paso para cada tipo de producto.
          </p>
        </div>
      </section>

      {/* Quick nav */}
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

      {/* Product sections */}
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
                  <Card className="border-green-200 bg-green-50/50">
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
                  <Card className="border-amber-200 bg-amber-50/50">
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

      {/* CTA final */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            ¿Listo para invertir?
          </h2>
          <p className="text-muted-foreground mb-8">
            Regístrate gratis, firma el NDA y accede a toda la documentación confidencial de nuestros activos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
              <Users className="w-4 h-4" />
              Crear cuenta gratuita
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/inversores")} className="gap-2">
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

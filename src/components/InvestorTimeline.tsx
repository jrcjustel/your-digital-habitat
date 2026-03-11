import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Search, FileText, ShieldCheck, BarChart3, Gavel,
  Key, TrendingUp, PartyPopper,
} from "lucide-react";

interface JourneyStep {
  icon: typeof Search;
  phase: string;
  title: string;
  description: string;
  duration: string;
  ikesaRole: string;
}

const steps: JourneyStep[] = [
  {
    icon: Search,
    phase: "Descubrimiento",
    title: "Encuentra tu oportunidad",
    description: "Explora el catálogo filtrado por tipo, zona, presupuesto y rentabilidad estimada.",
    duration: "1-2 días",
    ikesaRole: "Plataforma de búsqueda inteligente con scoring automático",
  },
  {
    icon: FileText,
    phase: "Due Diligence",
    title: "Analiza la documentación",
    description: "Accede al dossier completo: nota simple, cargas, catastro, situación procesal y valoración.",
    duration: "3-5 días",
    ikesaRole: "Dossier automatizado con datos verificados",
  },
  {
    icon: ShieldCheck,
    phase: "NDA & Acceso",
    title: "Firma el NDA digital",
    description: "Desbloquea la información confidencial del activo: datos del deudor, importes exactos y documentación judicial.",
    duration: "5 minutos",
    ikesaRole: "Firma digital integrada en la plataforma",
  },
  {
    icon: BarChart3,
    phase: "Análisis",
    title: "Evalúa la inversión",
    description: "Usa la calculadora de rentabilidad, compara estrategias de salida y consulta el Invest Score.",
    duration: "1-3 días",
    ikesaRole: "Motor de enriquecimiento con 4 estrategias de salida",
  },
  {
    icon: Gavel,
    phase: "Oferta",
    title: "Presenta tu oferta",
    description: "Envía tu oferta vinculante. El servicer evalúa y responde. Puedes negociar o mejorar la oferta.",
    duration: "1-4 semanas",
    ikesaRole: "Intermediación y seguimiento con el servicer",
  },
  {
    icon: Key,
    phase: "Cierre",
    title: "Firma y adquisición",
    description: "Escritura de compraventa o cesión de crédito. Inscripción registral y toma de posesión.",
    duration: "2-8 semanas",
    ikesaRole: "Coordinación con notaría, registro y abogados",
  },
  {
    icon: TrendingUp,
    phase: "Gestión",
    title: "Gestiona tu activo",
    description: "Reforma, alquila o revende. Monitoriza tu inversión desde el dashboard.",
    duration: "Variable",
    ikesaRole: "Red de profesionales y seguimiento de rentabilidad",
  },
  {
    icon: PartyPopper,
    phase: "Exit",
    title: "Materializa tu beneficio",
    description: "Ejecuta la estrategia de salida elegida y recoge el retorno de tu inversión.",
    duration: "3-24 meses",
    ikesaRole: "Asesoramiento fiscal y de salida óptima",
  },
];

const InvestorTimeline = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-14">
        <Badge variant="secondary" className="mb-3 text-xs font-semibold tracking-wider uppercase">
          Tu recorrido
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          El journey completo del inversor
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Desde el descubrimiento hasta el beneficio, paso a paso. IKESA te acompaña en cada fase.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Center line (desktop) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

        <div className="space-y-8 md:space-y-0">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.phase}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative md:flex md:items-start md:min-h-[140px]"
              >
                {/* Mobile: vertical line */}
                <div className="md:hidden absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

                {/* Center dot (desktop) */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-4 z-10 w-10 h-10 rounded-full bg-accent text-accent-foreground items-center justify-center shadow-md">
                  <Icon className="w-5 h-5" />
                </div>

                {/* Mobile dot */}
                <div className="md:hidden absolute left-3 top-4 z-10 w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Icon className="w-3 h-3" />
                </div>

                {/* Content card */}
                <div className={`md:w-[calc(50%-2rem)] ${isLeft ? "md:pr-0 md:mr-auto" : "md:pl-0 md:ml-auto"} pl-12 md:pl-0`}>
                  <div className={`bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${isLeft ? "md:text-right" : ""}`}>
                    <div className={`flex items-center gap-2 mb-2 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                      <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
                        Fase {i + 1}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {step.duration}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <div className={`flex items-start gap-2 text-xs text-accent ${isLeft ? "md:flex-row-reverse md:text-right" : ""}`}>
                      <span className="font-semibold shrink-0">IKESA:</span>
                      <span className="text-muted-foreground">{step.ikesaRole}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

export default InvestorTimeline;

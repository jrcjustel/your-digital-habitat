import { motion } from "framer-motion";
import {
  Landmark, Briefcase, Building2, Users, ArrowRight,
  ShieldCheck, Search, FileCheck, BarChart3, CheckCircle2,
  Eye, Lock, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ── Pipeline steps ── */
const pipeline = [
  {
    icon: Landmark,
    label: "Entidad financiera",
    subtitle: "Banco · Fondo · SAREB",
    desc: "Gestiona carteras de créditos impagados (NPLs) y activos adjudicados que necesita desinvertir.",
    color: "from-primary to-primary/70",
  },
  {
    icon: Briefcase,
    label: "Servicer",
    subtitle: "Aliseda · Hipoges · Servihabitat…",
    desc: "Recibe el mandato de comercialización, valora los activos y define precios orientativos.",
    color: "from-accent to-accent/70",
  },
  {
    icon: Building2,
    label: "IKESA",
    subtitle: "Selección · Análisis · Publicación",
    desc: "Filtra, enriquece y publica solo las oportunidades con mejor relación riesgo-rentabilidad.",
    color: "from-[hsl(160,60%,35%)] to-[hsl(160,60%,50%)]",
  },
  {
    icon: Users,
    label: "Inversor",
    subtitle: "Tú",
    desc: "Accedes a oportunidades verificadas con documentación completa, análisis y soporte integral.",
    color: "from-primary to-accent",
  },
];

/* ── Due Diligence phases ── */
const dueDiligenceSteps = [
  {
    icon: Search,
    title: "Prospección",
    desc: "Monitorizamos carteras de +15 servicers y +200 fondos activos en España.",
  },
  {
    icon: FileCheck,
    title: "Due Diligence",
    desc: "Verificamos situación registral, judicial, catastral y ocupacional de cada activo.",
  },
  {
    icon: BarChart3,
    title: "Valoración",
    desc: "Cruzamos datos de mercado, comparables y tasaciones para fijar un precio justo.",
  },
  {
    icon: CheckCircle2,
    title: "Publicación",
    desc: "Solo publicamos activos que superan nuestro filtro de calidad y transparencia.",
  },
];

/* ── Trust metrics ── */
const trustMetrics = [
  { value: "100%", label: "Oportunidades verificadas", icon: ShieldCheck },
  { value: "+15", label: "Servicers colaboradores", icon: Briefcase },
  { value: "3 capas", label: "Filtro de calidad", icon: Eye },
  { value: "NDA", label: "Confidencialidad garantizada", icon: Lock },
];

const SourcingTransparencyPanel = () => (
  <section className="py-16 md:py-20">
    <div className="container mx-auto px-4 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-3 text-xs font-semibold tracking-wider uppercase gap-1">
          <Sparkles className="w-3 h-3" /> Transparencia
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          ¿De dónde vienen nuestras oportunidades?
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Cada activo publicado en IKESA atraviesa una cadena institucional de distribución y un riguroso proceso de selección interno. 
          No publicamos todo: solo lo que merece tu atención.
        </p>
      </div>

      {/* ── Visual Pipeline ── */}
      <div className="relative mb-16">
        {/* Connection line (desktop) */}
        <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20 -translate-y-1/2 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative z-10">
          {pipeline.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                <step.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-xl p-4 w-full">
                <p className="text-sm font-bold text-foreground">{step.label}</p>
                <p className="text-[10px] text-accent font-semibold mt-0.5">{step.subtitle}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{step.desc}</p>
              </div>

              {/* Arrow between steps (mobile) */}
              {i < pipeline.length - 1 && (
                <ArrowRight className="w-5 h-5 text-muted-foreground/30 my-2 rotate-90 md:hidden" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Due Diligence Process ── */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-foreground mb-2">Nuestro proceso de selección</h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Antes de que veas una oportunidad, ha pasado por 4 fases de verificación.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dueDiligenceSteps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-5 relative overflow-hidden group hover:border-accent/30 transition-colors"
            >
              {/* Step number watermark */}
              <span className="absolute top-3 right-3 text-4xl font-black text-muted-foreground/5 group-hover:text-accent/10 transition-colors">
                {i + 1}
              </span>

              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                <step.icon className="w-5 h-5 text-accent" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">{step.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Trust Metrics ── */}
      <div className="bg-secondary/50 border border-border rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustMetrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <m.icon className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default SourcingTransparencyPanel;

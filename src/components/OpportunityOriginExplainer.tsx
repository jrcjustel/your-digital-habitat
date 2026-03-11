import { motion } from "framer-motion";
import { Building2, ArrowRight, Briefcase, Users, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const pipeline = [
  { icon: Landmark, label: "Banco / Fondo", desc: "Entidad financiera con cartera de activos distressed" },
  { icon: Briefcase, label: "Servicer", desc: "Gestiona y comercializa los activos (Aliseda, Hipoges…)" },
  { icon: Building2, label: "IKESA", desc: "Selecciona, analiza y publica las mejores oportunidades" },
  { icon: Users, label: "Inversor", desc: "Tú accedes a oportunidades filtradas y analizadas" },
];

const OpportunityOriginExplainer = () => (
  <section className="py-12">
    <div className="text-center mb-8">
      <Badge variant="secondary" className="mb-3 text-xs font-semibold tracking-wider uppercase">
        Transparencia
      </Badge>
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        ¿De dónde vienen las oportunidades?
      </h2>
      <p className="text-sm text-muted-foreground max-w-lg mx-auto">
        Cada activo en IKESA proviene de la cadena institucional de distribución de activos distressed en España.
      </p>
    </div>

    <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0">
      {pipeline.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-5 text-center w-48"
          >
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <step.icon className="w-5 h-5 text-accent" />
            </div>
            <p className="text-sm font-bold text-foreground">{step.label}</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{step.desc}</p>
          </motion.div>
          {i < pipeline.length - 1 && (
            <ArrowRight className="w-5 h-5 text-muted-foreground/30 mx-2 shrink-0 hidden md:block" />
          )}
        </div>
      ))}
    </div>
  </section>
);

export default OpportunityOriginExplainer;

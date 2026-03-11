import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { assetTypes, type AssetTypeInfo } from "@/data/asset-type-content";

interface HowThisWorksProps {
  assetType: "npl" | "cesion" | "ocupado";
}

const HowThisWorks = ({ assetType }: HowThisWorksProps) => {
  const info: AssetTypeInfo = assetTypes[assetType];
  if (!info) return null;

  return (
    <section className="py-10">
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <info.icon className="w-5 h-5 text-accent" />
        ¿Cómo funciona esta inversión?
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        {info.steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="relative"
          >
            <div className="bg-card border border-border rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg ${info.bg} flex items-center justify-center`}>
                  <span className="text-sm font-bold text-accent">{i + 1}</span>
                </div>
                <step.icon className={`w-4 h-4 ${info.color}`} />
              </div>
              <p className="text-sm font-semibold text-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{step.detail}</p>
            </div>
            {i < info.steps.length - 1 && (
              <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 z-10" />
            )}
          </motion.div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "ROI típico", value: info.typicalRoi },
          { label: "Plazo", value: info.typicalTimeline },
          { label: "Descuento", value: info.typicalDiscount },
          { label: "Nivel", value: info.recommendedLevel },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
            <p className="text-sm font-bold text-foreground mt-0.5">{kpi.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowThisWorks;

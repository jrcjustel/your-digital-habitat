import { GraduationCap, BarChart3, Rocket } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    icon: GraduationCap,
    title: "Aprende",
    desc: "Aprende los fundamentos de la inversión inmobiliaria",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Analiza",
    desc: "Analiza oportunidades con herramientas profesionales",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Invierte",
    desc: "Invierte con conocimiento y estrategia",
  },
];

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 bg-primary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="section-label mb-2">Cómo funciona</p>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight">
            Tres pasos hacia tu primera inversión
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Step circle */}
                <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center relative">
                  <Icon className="w-7 h-7 text-accent" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-[11px] font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-bold text-primary-foreground text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-primary-foreground/50 leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

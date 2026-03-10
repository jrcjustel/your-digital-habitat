import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, Mail, Sparkles, Gavel, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import AnimatedCounter from "@/components/servicios/AnimatedCounter";
import ColumnCard from "@/components/servicios/ColumnCard";
import ExpandableSection from "@/components/servicios/ExpandableSection";
import { incluidoItems, gestoriaItems, legalItems } from "@/data/servicios-data";

const Servicios = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Servicios y Honorarios | IKESA"
        description="Servicios incluidos en cada operación y tarifas de gestoría y mediación legal. Acompañamiento experto de principio a fin."
        canonical="/servicios"
      />
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden bg-primary">
        <motion.div className="absolute inset-0 opacity-10" style={{ y: bgY }}>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-accent blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent blur-[100px] -translate-x-1/3 translate-y-1/3" />
        </motion.div>
        <motion.div className="container mx-auto px-4 py-12 md:py-16 relative z-10" style={{ y: textY, opacity: heroOpacity }}>
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
              Todo claro desde el primer día. Tres columnas, cero sorpresas.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <Link to="/contacto">
                <Button size="lg" variant="secondary" className="gap-2 font-semibold">
                  <Mail className="w-4 h-4" />
                  Solicitar presupuesto
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Three columns */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6">

            {/* INCLUIDO */}
            <ColumnCard
              color="bg-gradient-to-br from-accent to-accent/80"
              icon={Sparkles}
              title="Incluido"
              subtitle="En cada operación, sin coste adicional"
              badge="Gratis"
              delay={0}
            >
              <AnimatedCounter target={incluidoItems.length} label="servicios incluidos sin coste adicional en cada operación" />
              <div className="p-5 pt-0 space-y-1">
                {incluidoItems.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                    className="flex items-start gap-3 py-3 border-b border-border/40 last:border-b-0 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <item.icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <div className="bg-accent/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-accent font-bold uppercase tracking-wider mb-1">Sin coste adicional</p>
                  <p className="text-[11px] text-muted-foreground">Incluido en los honorarios del producto</p>
                </div>
              </div>
            </ColumnCard>

            {/* GESTORÍA */}
            <ColumnCard
              color="bg-gradient-to-br from-primary to-primary/80"
              icon={ClipboardList}
              title="Gestoría"
              subtitle="Trámites administrativos y fiscales"
              delay={0.1}
            >
              <AnimatedCounter target={gestoriaItems.reduce((acc, g) => acc + g.items.length, 0)} label="trámites administrativos y fiscales disponibles" />
              {gestoriaItems.map((grupo, i) => (
                <ExpandableSection
                  key={grupo.cat}
                  emoji={grupo.emoji}
                  title={grupo.cat}
                  items={grupo.items}
                  defaultOpen={i === 0}
                />
              ))}
              <div className="px-5 py-4">
                <Link to="/contacto">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5" /> Pedir presupuesto
                  </Button>
                </Link>
              </div>
            </ColumnCard>

            {/* LEGAL */}
            <ColumnCard
              color="bg-gradient-to-br from-foreground to-foreground/80"
              icon={Gavel}
              title="Legal"
              subtitle="Mediación, procedimientos y comercialización"
              delay={0.2}
            >
              <AnimatedCounter target={legalItems.reduce((acc, g) => acc + g.items.length, 0)} label="servicios legales y de mediación disponibles" />
              {legalItems.map((grupo, i) => (
                <ExpandableSection
                  key={grupo.cat}
                  icon={grupo.icon}
                  title={grupo.cat}
                  items={grupo.items}
                  defaultOpen={i === 0}
                />
              ))}
              <div className="px-5 py-4">
                <Link to="/contacto">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5" /> Pedir presupuesto
                  </Button>
                </Link>
              </div>
            </ColumnCard>

          </div>

          <p className="text-xs text-muted-foreground text-center mt-10 max-w-2xl mx-auto">
            * Importes orientativos, IVA no incluido. Solicita presupuesto personalizado.
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

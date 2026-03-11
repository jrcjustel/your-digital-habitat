import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import trustCity from "@/assets/trust-city.jpg";
import analysisDesk from "@/assets/analysis-desk.jpg";

const pillars = [
  {
    number: "01",
    title: "Acceso institucional",
    description: "Las mismas oportunidades que gestionan los grandes fondos — subastas, carteras NPL, cesiones de remate — ahora al alcance de cualquier inversor.",
  },
  {
    number: "02",
    title: "Análisis profesional",
    description: "Cada activo con valoración de mercado, scoring de inversión, datos registrales y análisis judicial. Sin conjeturas.",
  },
  {
    number: "03",
    title: "Transparencia total",
    description: "Ficha completa con documentación legal, estado ocupacional, cargas y situación procesal. Nada queda fuera.",
  },
  {
    number: "04",
    title: "Acompañamiento experto",
    description: "Nuestro equipo te guía en cada fase: análisis, oferta, negociación y cierre. No estás solo en el proceso.",
  },
];

const WhyInvest = () => {
  return (
    <section className="py-20 md:py-28 bg-background" id="inversores">
      <div className="container mx-auto px-4">
        {/* Header with image */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="section-label"
            >
              Por qué IKESA
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-foreground mt-3 leading-tight tracking-tight"
            >
              La inversión inmobiliaria profesional,
              <span className="text-accent"> democratizada.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground mt-5 text-lg leading-relaxed max-w-lg"
            >
              Operamos con los mismos servicers que los fondos institucionales.
              Nuestra diferencia: ponemos esa información y esas oportunidades
              a disposición de cualquier inversor con criterio.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/como-funciona"
                className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-accent hover:text-accent/80 transition-colors group"
              >
                Cómo funciona la plataforma
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Image composition */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={trustCity}
                alt="Vista aérea de inmuebles en España"
                className="w-full h-[340px] object-cover"
              />
            </div>
            {/* Overlapping analysis image */}
            <div className="absolute -bottom-8 -left-6 w-48 h-32 rounded-xl overflow-hidden shadow-xl border-4 border-background">
              <img
                src={analysisDesk}
                alt="Análisis profesional de inversión"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Pillars grid - numbered, no icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-card p-8 group"
            >
              <span className="text-3xl font-extrabold text-accent/20 group-hover:text-accent/40 transition-colors duration-300 block mb-4 tracking-tight">
                {pillar.number}
              </span>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2 tracking-tight">
                {pillar.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyInvest;
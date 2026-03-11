import { Shield, Eye, Award, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "Sin puertas cerradas",
    description: "Hasta ahora, estas oportunidades solo llegaban a grandes fondos. Nosotros las ponemos en tu mesa.",
  },
  {
    icon: Eye,
    title: "Todo a la vista",
    description: "Cada activo con su ficha completa: datos registrales, judiciales y valoración. Nada escondido.",
  },
  {
    icon: Award,
    title: "Datos que trabajan por ti",
    description: "Valoraciones automáticas, scoring de inversión y análisis de mercado para que decidas con criterio.",
  },
  {
    icon: Headphones,
    title: "No vas solo",
    description: "Si tienes dudas, las resolvemos. Nuestro equipo te acompaña de principio a fin.",
  },
];

const WhyInvest = () => {
  return (
    <section className="py-16 md:py-24" id="inversores">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-14">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="section-label"
          >
            ¿Por qué IKESA?
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
            className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3"
          >
            Invertir en inmobiliario no debería ser solo para unos pocos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground mt-4 text-lg leading-relaxed"
          >
            Creemos que la información y el acceso son derechos, no privilegios.
            Por eso construimos herramientas que nivelan el terreno de juego.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-card rounded-2xl p-8 card-elevated group cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-5 group-hover:bg-accent/10 group-hover:rotate-3 transition-all duration-300">
                <feat.icon className="w-6 h-6 text-accent group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyInvest;

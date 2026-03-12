import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  {
    title: "Analizar inversión",
    desc: "ROI estimado, nivel de riesgo y estrategia de salida. En segundos.",
    href: "/analisis-inversion",
    primary: true,
  },
  {
    title: "Hablar con el equipo",
    desc: "Sin compromiso. Te escuchamos y orientamos según tu perfil.",
    href: "/contacto",
  },
  {
    title: "Formación para inversores",
    desc: "Guías prácticas, casos reales y rutas formativas por tipología.",
    href: "/academia",
  },
  {
    title: "Vender activos",
    desc: "¿Eres banco, fondo o gestor? Hablemos de distribución.",
    href: "/vendedores",
  },
];

const ConversionCtas = () => {
  return (
    <section className="py-10 md:py-14 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mb-12">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="section-label"
          >
            Siguiente paso
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-3xl md:text-4xl font-extrabold text-foreground mt-3 tracking-tight"
          >
            ¿Por dónde quieres empezar?
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
          {actions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link
                to={action.href}
                className={`group flex flex-col justify-between h-full p-7 transition-all duration-300 ${
                  action.primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-card hover:bg-secondary/50"
                }`}
              >
                <div>
                  <h3 className={`font-heading text-lg font-bold mb-2 tracking-tight ${
                    action.primary ? "" : "text-foreground group-hover:text-accent transition-colors"
                  }`}>
                    {action.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-6 ${
                    action.primary ? "text-primary-foreground/65" : "text-muted-foreground"
                  }`}>
                    {action.desc}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all ${
                  action.primary ? "text-accent" : "text-accent"
                }`}>
                  Ir <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConversionCtas;
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Phone, BookOpen, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  {
    icon: BarChart3,
    title: "Quiero analizar una inversión",
    desc: "Nuestro motor calcula ROI, riesgo y estrategia de salida en segundos.",
    href: "/analisis-inversion",
    primary: true,
  },
  {
    icon: Phone,
    title: "Necesito hablar con alguien",
    desc: "Llámanos o escríbenos. Sin compromiso, sin presión.",
    href: "/contacto",
  },
  {
    icon: BookOpen,
    title: "Prefiero aprender primero",
    desc: "Guías prácticas y casos reales para empezar con buen pie.",
    href: "/academia",
  },
  {
    icon: Building2,
    title: "Quiero vender activos",
    desc: "¿Eres banco, fondo o gestor? Hablemos de distribución.",
    href: "/vendedores",
  },
];

const ConversionCtas = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-12">
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
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
            className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3"
          >
            ¿Por dónde quieres empezar?
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {actions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.08 }}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            >
              <Link
                to={action.href}
                className={`group block h-full rounded-2xl p-6 border transition-all duration-300 active:scale-[0.98] ${
                  action.primary
                    ? "bg-accent text-accent-foreground border-accent hover:brightness-110 shadow-lg shadow-accent/20"
                    : "bg-card border-border hover:border-accent/40 card-elevated"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300 ${
                  action.primary ? "bg-accent-foreground/15" : "bg-secondary"
                }`}>
                  <action.icon className={`w-6 h-6 ${action.primary ? "text-accent-foreground" : "text-accent"}`} />
                </div>
                <h3 className={`font-heading text-lg font-bold mb-1.5 ${
                  action.primary ? "" : "text-foreground group-hover:text-accent transition-colors"
                }`}>
                  {action.title}
                </h3>
                <p className={`text-sm mb-4 leading-relaxed ${
                  action.primary ? "text-accent-foreground/70" : "text-muted-foreground"
                }`}>
                  {action.desc}
                </p>
                <span className={`inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all ${
                  action.primary ? "" : "text-accent"
                }`}>
                  Vamos <ArrowRight className="w-3.5 h-3.5" />
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

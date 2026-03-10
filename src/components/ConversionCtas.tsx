import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Phone, BookOpen, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  {
    icon: BarChart3,
    title: "Analizar inversión",
    desc: "Motor de valoración con ROI, riesgo y estrategia de salida.",
    href: "/analisis-inversion",
    primary: true,
  },
  {
    icon: Phone,
    title: "Hablar con un asesor",
    desc: "Consulta personalizada sin compromiso.",
    href: "/contacto",
  },
  {
    icon: BookOpen,
    title: "Academia de inversión",
    desc: "Aprende a invertir con nuestras guías gratuitas.",
    href: "/academia",
  },
  {
    icon: Building2,
    title: "Vender activos",
    desc: "¿Eres banco o fondo? Coloca tus activos.",
    href: "/vendedores",
  },
];

const ConversionCtas = () => {
  return (
    <section className="py-16 md:py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="section-label">¿Por dónde empezar?</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3">
            Tu próximo paso
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {actions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                to={action.href}
                className={`group block h-full rounded-2xl p-6 border transition-all duration-300 ${
                  action.primary
                    ? "bg-accent text-accent-foreground border-accent hover:brightness-110 shadow-lg shadow-accent/20"
                    : "bg-card border-border hover:border-accent/40 card-elevated"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  action.primary ? "bg-accent-foreground/15" : "bg-secondary"
                }`}>
                  <action.icon className={`w-6 h-6 ${action.primary ? "text-accent-foreground" : "text-accent"}`} />
                </div>
                <h3 className={`font-heading text-lg font-bold mb-1.5 ${
                  action.primary ? "" : "text-foreground group-hover:text-accent transition-colors"
                }`}>
                  {action.title}
                </h3>
                <p className={`text-sm mb-4 ${
                  action.primary ? "text-accent-foreground/70" : "text-muted-foreground"
                }`}>
                  {action.desc}
                </p>
                <span className={`inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all ${
                  action.primary ? "" : "text-accent"
                }`}>
                  Empezar <ArrowRight className="w-3.5 h-3.5" />
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

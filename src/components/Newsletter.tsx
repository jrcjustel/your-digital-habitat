import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("¡Hecho! Recibirás las mejores oportunidades en tu bandeja.");
    setEmail("");
  };

  return (
    <section className="py-10 md:py-14 bg-primary relative overflow-hidden" id="newsletter">
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-4 block">Briefing semanal</span>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-primary-foreground mb-3 tracking-tight">
              Las oportunidades que no salen en portada.
            </h2>
            <p className="text-primary-foreground/55 mb-8 leading-relaxed">
              Cada viernes, un resumen con las cesiones de remate, carteras NPL
              y activos ocupados más relevantes de la semana. Sin ruido.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="flex-1 bg-primary-foreground/8 border border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/35 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
            />
            <button
              type="submit"
              className="group inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground font-bold px-7 py-3.5 rounded-xl text-sm hover:brightness-110 transition-all active:scale-[0.97]"
            >
              Suscribirme
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.form>

          <p className="text-primary-foreground/25 text-xs mt-4">
            Sin spam. Cancelación inmediata. Solo contenido relevante para inversores.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
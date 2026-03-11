import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("¡Hecho! Recibirás las mejores oportunidades en tu bandeja.");
    setEmail("");
  };

  return (
    <section className="py-16 md:py-20 hero-section" id="newsletter">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
        >
          <Mail className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
            No te pierdas nada
          </h2>
          <p className="text-primary-foreground/60 mb-8 max-w-lg mx-auto leading-relaxed">
            Cada semana te enviamos las oportunidades más interesantes: cesiones de remate,
            ocupados con margen y carteras NPL antes de que salgan al mercado general.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email de trabajo"
            required
            className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            Suscribirme
          </button>
        </motion.form>

        <p className="text-primary-foreground/30 text-xs mt-4 max-w-sm mx-auto">
          Sin spam. Puedes darte de baja cuando quieras.
        </p>
      </div>
    </section>
  );
};

export default Newsletter;

import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("¡Suscripción registrada! Te enviaremos las mejores oportunidades.");
    setEmail("");
  };

  return (
    <section className="py-16 md:py-20 hero-section" id="newsletter">
      <div className="container mx-auto px-4 text-center">
        <Mail className="w-10 h-10 text-accent mx-auto mb-4" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
          Recibe ocupados + cesiones de remate antes que nadie
        </h2>
        <p className="text-primary-foreground/60 mb-8 max-w-lg mx-auto">
          Suscríbete y accede a oportunidades de inversión en inmuebles ocupados, cesiones de remate judicial y deuda/NPL con análisis de Ikesa.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email"
            required
            className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Suscríbete
          </button>
        </form>

        <p className="text-primary-foreground/30 text-xs mt-4 max-w-sm mx-auto">
          Al suscribirte aceptas recibir comunicaciones comerciales de IKESA. Puedes darte de baja en cualquier momento.
        </p>
      </div>
    </section>
  );
};

export default Newsletter;

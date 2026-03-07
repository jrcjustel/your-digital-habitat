import { Mail } from "lucide-react";

const Newsletter = () => {
  return (
    <section className="py-16 md:py-20 hero-section" id="newsletter">
      <div className="container mx-auto px-4 text-center">
        <Mail className="w-10 h-10 text-accent mx-auto mb-4" />
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-3">
          Recibe oportunidades de inversión antes que nadie
        </h2>
        <p className="text-primary-foreground/60 mb-8 max-w-lg mx-auto">
          Suscríbete y accede a análisis de mercado, nuevos activos y estrategias de inversión inmobiliaria democratizada.
        </p>

        <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Tu email"
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
          Al suscribirte aceptas recibir comunicaciones comerciales de IKESA.
        </p>
      </div>
    </section>
  );
};

export default Newsletter;

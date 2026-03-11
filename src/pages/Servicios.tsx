import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { incluidoItems, gestoriaItems, legalItems } from "@/data/servicios-data";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

const PriceRow = ({ service, price }: { service: string; price: string }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-b-0">
    <span className="text-sm text-foreground">{service}</span>
    <span className="text-sm font-bold text-foreground whitespace-nowrap tabular-nums">{price}</span>
  </div>
);

const Servicios = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Servicios y Honorarios | IKESA"
        description="Servicios incluidos en cada operación y tarifas de gestoría y mediación legal. Transparencia total, cero sorpresas."
        canonical="/servicios"
      />
      <Navbar />

      {/* Hero — compact & clear */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-accent font-semibold text-xs tracking-[0.2em] uppercase mb-4"
          >
            Transparencia total
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-3xl md:text-5xl font-extrabold text-primary-foreground tracking-tight mb-4"
          >
            Servicios & Honorarios
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary-foreground/70 text-lg max-w-xl"
          >
            Tres bloques, precios claros, sin sorpresas.
          </motion.p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 md:py-24 space-y-20">

        {/* ─── BLOQUE 1: INCLUIDO ─── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
          >
            <div>
              <span className="inline-block bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full mb-3">
                Sin coste adicional
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Incluido en cada operación
              </h2>
              <p className="text-muted-foreground mt-1 max-w-lg">
                Estos servicios están cubiertos en los honorarios de la operación. No pagas nada extra.
              </p>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {incluidoItems.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card border border-border rounded-2xl p-5 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── BLOQUE 2: GESTORÍA ─── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Gestoría
            </h2>
            <p className="text-muted-foreground mt-1 max-w-lg">
              Trámites administrativos y fiscales. Precios orientativos, IVA no incluido.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gestoriaItems.map((grupo, gi) => (
              <motion.div
                key={grupo.cat}
                custom={gi}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>{grupo.emoji}</span> {grupo.cat}
                  </h3>
                </div>
                <div className="px-5">
                  {grupo.items.map((item, i) => (
                    <PriceRow key={i} service={item.s} price={item.p} />
                  ))}
                </div>
                <div className="px-5 py-3">
                  <Link
                    to={`/contacto?servicio=${encodeURIComponent(grupo.cat)}`}
                    className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    Solicitar <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── BLOQUE 3: LEGAL ─── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Legal & Mediación
            </h2>
            <p className="text-muted-foreground mt-1 max-w-lg">
              Servicios jurídicos, mediación y comercialización. Precios orientativos, IVA no incluido.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {legalItems.map((grupo, gi) => (
              <motion.div
                key={grupo.cat}
                custom={gi}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    {grupo.icon && <grupo.icon className="w-4 h-4 text-accent" />}
                    {grupo.cat}
                  </h3>
                </div>
                <div className="px-5">
                  {grupo.items.map((item, i) => (
                    <PriceRow key={i} service={item.s} price={item.p} />
                  ))}
                </div>
                <div className="px-5 py-3">
                  <Link
                    to={`/contacto?servicio=${encodeURIComponent(grupo.cat)}`}
                    className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    Solicitar <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
          * Importes orientativos, IVA no incluido. Solicita presupuesto personalizado.
        </p>
      </main>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
            ¿Hablamos?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Nuestro equipo te prepara un presupuesto a medida sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contacto">
              <Button size="lg" className="gap-2">
                <Mail className="w-4 h-4" /> Pedir presupuesto
              </Button>
            </Link>
            <Link to="/inmuebles">
              <Button size="lg" variant="outline" className="gap-2">
                Ver oportunidades <ArrowRight className="w-4 h-4" />
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

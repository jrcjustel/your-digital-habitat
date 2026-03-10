import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { ArrowRight, FileText, Scale, Building2, BarChart3, ShieldCheck, CheckCircle2, Mail, Sparkles, Gavel, ClipboardList, Home, Receipt, Landmark, Users, Search, Handshake, DoorOpen, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";

/* ── DATA ── */

const incluidoItems = [
  { icon: FileText, title: "Análisis documental", desc: "Revisamos toda la documentación de la oportunidad y la presentamos al fondo." },
  { icon: Scale, title: "Análisis jurídico", desc: "Situación legal del activo: posición adquirida, implicaciones y riesgos." },
  { icon: Building2, title: "Análisis inmobiliario", desc: "Evaluación del activo vinculado para darte una visión completa." },
  { icon: BarChart3, title: "Análisis financiero", desc: "Rentabilidades, costes asociados y escenarios de salida." },
  { icon: ShieldCheck, title: "Proceso PBC", desc: "Te guiamos en Prevención de Blanqueo de Capitales." },
  { icon: CheckCircle2, title: "Cierre operación", desc: "Acompañamiento hasta la firma ante notario." },
];

const gestoriaItems = [
  { emoji: "🏠", cat: "Escrituras", items: [
    { s: "Compraventa", p: "380 €" }, { s: "Cancelación hipoteca", p: "350 €" },
    { s: "Obra nueva", p: "300–1.000 €" }, { s: "División horizontal", p: "350–2.000 €" },
    { s: "Herencias", p: "450–2.500 €" }, { s: "Donaciones", p: "250–700 €" },
  ]},
  { emoji: "📋", cat: "Catastro", items: [
    { s: "Cambio titularidad", p: "30 €" }, { s: "Subsanación ref. catastral", p: "75 €" },
  ]},
  { emoji: "🏗️", cat: "VPO / VPP", items: [
    { s: "Certificado precio máximo", p: "210 €" }, { s: "Autorización de venta", p: "210 €" },
  ]},
  { emoji: "📄", cat: "Certificados", items: [
    { s: "Tanteo y retracto", p: "175 €" }, { s: "CEE (Energético)", p: "210 €" },
  ]},
  { emoji: "💰", cat: "Deudas IBI y CCPP", items: [
    { s: "Obtención y pago IBI", p: "60 €" }, { s: "Deuda comunidad", p: "60 €" },
  ]},
  { emoji: "🧾", cat: "Fiscalidad", items: [
    { s: "Análisis fiscal", p: "120 €" }, { s: "Pago ITP / AJD", p: "120 €" },
    { s: "Sucesiones y donaciones", p: "300 €" }, { s: "No residentes (M. 211)", p: "120 €" },
  ]},
  { emoji: "📊", cat: "Plusvalía", items: [
    { s: "Comunicación Ayto.", p: "30 €" }, { s: "Estudio y cálculo", p: "120 €" },
  ]},
];

const legalItems = [
  { icon: Search, cat: "Informes Ocupacionales", items: [
    { s: "Informe ocupacional (1–5 uds.)", p: "250 €/ud" },
    { s: "Informe ocupacional (+5 uds.)", p: "200 €/ud" },
    { s: "Informe jurídico 24h (1–5)", p: "250 €/ud" },
    { s: "Informe jurídico 24h (+5)", p: "200 €/ud" },
    { s: "Due Diligence 48h", p: "Desde 600 €" },
    { s: "Pack Jurídico + Ocupacional", p: "400 €/ud" },
  ]},
  { icon: Handshake, cat: "Mediación (Cash for Keys)", items: [
    { s: "Resolución CFK (3–15 días)", p: "250 €/ud" },
    { s: "Mediación extrajudicial (21d)", p: "200 €/ud" },
    { s: "Negociación amistosa (0–3m)", p: "1.500 € + variable" },
  ]},
  { icon: DoorOpen, cat: "Door Knocking", items: [
    { s: "Informe + carta intenciones", p: "Consultar" },
  ]},
  { icon: Gavel, cat: "Procedimientos Judiciales", items: [
    { s: "Asistencia judicial completa", p: "2.950 €" },
    { s: "Personación + gestión CDR", p: "1.000 + 1.800 €" },
    { s: "Sucesión + homologación", p: "750 €" },
  ]},
  { icon: Briefcase, cat: "Comercialización Real Estate", items: [
    { s: "Intermediación en venta", p: "Consultar" },
  ]},
];

/* ── COLUMN COMPONENT ── */

const ColumnCard = ({ 
  color, 
  icon: Icon, 
  title, 
  subtitle, 
  badge,
  children,
  delay = 0,
}: { 
  color: string; 
  icon: any; 
  title: string; 
  subtitle: string; 
  badge?: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.97 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-shadow duration-500"
  >
    {/* Column header */}
    <div className={`px-6 py-6 ${color} relative overflow-hidden md:w-64 md:shrink-0 md:flex md:flex-col md:justify-center`}>
      {badge && (
        <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-heading text-xl font-bold text-white">{title}</h3>
      <p className="text-white/70 text-sm mt-1">{subtitle}</p>
    </div>
    {/* Column content */}
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  </motion.div>
);

/* ── ACCORDION-LIKE EXPANDABLE SECTION ── */

const ExpandableSection = ({ 
  emoji, 
  icon: Icon, 
  title, 
  items,
  defaultOpen = false,
}: { 
  emoji?: string; 
  icon?: any; 
  title: string; 
  items: { s: string; p: string }[];
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors text-left"
      >
        {emoji && <span className="text-lg">{emoji}</span>}
        {Icon && <Icon className="w-4 h-4 text-accent shrink-0" />}
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground text-xs"
        >
          ▼
        </motion.span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-3"
        >
          {items.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-2 py-2 border-b border-dashed border-border/40 last:border-b-0">
              <span className="text-xs text-muted-foreground leading-snug flex-1">{item.s}</span>
              <span className="text-xs font-bold text-foreground whitespace-nowrap tabular-nums bg-accent/10 px-2 py-0.5 rounded-md">{item.p}</span>
            </div>
          ))}
          <Link
            to={`/contacto?servicio=${encodeURIComponent(title)}`}
            className="group mt-3 mb-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-accent bg-accent/5 hover:bg-accent hover:text-white rounded-lg py-2 px-3 transition-all duration-300 hover:shadow-md hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Mail className="w-3 h-3 transition-transform duration-300 group-hover:-rotate-12" />
            Solicitar este servicio
            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      )}
    </div>
  );
};

/* ── PAGE ── */

const Servicios = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Servicios y Honorarios | IKESA"
        description="Servicios incluidos en cada operación y tarifas de gestoría y mediación legal. Acompañamiento experto de principio a fin."
        canonical="/servicios"
      />
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden bg-primary">
        <motion.div className="absolute inset-0 opacity-10" style={{ y: bgY }}>
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-accent blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent blur-[100px] -translate-x-1/3 translate-y-1/3" />
        </motion.div>
        <motion.div className="container mx-auto px-4 py-12 md:py-16 relative z-10" style={{ y: textY, opacity: heroOpacity }}>
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-accent font-medium text-sm tracking-widest uppercase mb-4"
            >
              Transparencia total
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-5 leading-tight"
            >
              Servicios & Honorarios
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-primary-foreground/75 text-lg md:text-xl max-w-2xl leading-relaxed"
            >
              Todo claro desde el primer día. Tres columnas, cero sorpresas.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <Link to="/contacto">
                <Button size="lg" variant="secondary" className="gap-2 font-semibold">
                  <Mail className="w-4 h-4" />
                  Solicitar presupuesto
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Three columns */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6">

            {/* COLUMN 1: INCLUIDO */}
            <ColumnCard
              color="bg-gradient-to-br from-accent to-accent/80"
              icon={Sparkles}
              title="Incluido"
              subtitle="En cada operación, sin coste adicional"
              badge="Gratis"
              delay={0}
            >
              <div className="p-5 space-y-1">
                {incluidoItems.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                    className="flex items-start gap-3 py-3 border-b border-border/40 last:border-b-0 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <item.icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <div className="bg-accent/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-accent font-bold uppercase tracking-wider mb-1">Sin coste adicional</p>
                  <p className="text-[11px] text-muted-foreground">Incluido en los honorarios del producto</p>
                </div>
              </div>
            </ColumnCard>

            {/* COLUMN 2: GESTORÍA */}
            <ColumnCard
              color="bg-gradient-to-br from-primary to-primary/80"
              icon={ClipboardList}
              title="Gestoría"
              subtitle="Trámites administrativos y fiscales"
              delay={0.1}
            >
              {gestoriaItems.map((grupo, i) => (
                <ExpandableSection
                  key={grupo.cat}
                  emoji={grupo.emoji}
                  title={grupo.cat}
                  items={grupo.items}
                  defaultOpen={i === 0}
                />
              ))}
              <div className="px-5 py-4">
                <Link to="/contacto">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5" /> Pedir presupuesto
                  </Button>
                </Link>
              </div>
            </ColumnCard>

            {/* COLUMN 3: LEGAL */}
            <ColumnCard
              color="bg-gradient-to-br from-foreground to-foreground/80"
              icon={Gavel}
              title="Legal"
              subtitle="Mediación, procedimientos y comercialización"
              delay={0.2}
            >
              {legalItems.map((grupo, i) => (
                <ExpandableSection
                  key={grupo.cat}
                  icon={grupo.icon}
                  title={grupo.cat}
                  items={grupo.items}
                  defaultOpen={i === 0}
                />
              ))}
              <div className="px-5 py-4">
                <Link to="/contacto">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5" /> Pedir presupuesto
                  </Button>
                </Link>
              </div>
            </ColumnCard>

          </div>

          <p className="text-xs text-muted-foreground text-center mt-10 max-w-2xl mx-auto">
            * Importes orientativos, IVA no incluido. Solicita presupuesto personalizado.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
            ¿Necesitas asesoramiento personalizado?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Nuestro equipo está disponible para resolver tus dudas y acompañarte en todo el proceso.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/inmuebles">
              <Button size="lg" className="gap-2">
                Ver oportunidades <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/como-funciona">
              <Button size="lg" variant="outline">
                Cómo funciona
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

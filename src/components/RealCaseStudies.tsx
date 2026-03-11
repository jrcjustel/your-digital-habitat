import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Clock, Euro, MapPin, Home, Gavel,
  ArrowRight, CreditCard, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaseStudy {
  id: string;
  type: "npl" | "cesion" | "ocupado";
  typeLabel: string;
  title: string;
  location: string;
  purchasePrice: number;
  marketValue: number;
  totalInvestment: number;
  salePrice: number;
  netProfit: number;
  roi: number;
  timeMonths: number;
  steps: { label: string; detail: string; months: number }[];
  highlight: string;
}

const cases: CaseStudy[] = [
  {
    id: "case-1",
    type: "cesion",
    typeLabel: "Cesión de Remate",
    title: "Vivienda 3 hab. en Málaga capital",
    location: "Málaga, Andalucía",
    purchasePrice: 78000,
    marketValue: 145000,
    totalInvestment: 102400,
    salePrice: 138000,
    netProfit: 35600,
    roi: 34.8,
    timeMonths: 9,
    steps: [
      { label: "Cesión firmada", detail: "Adquisición del derecho de remate por 78.000 €", months: 0 },
      { label: "Posesión judicial", detail: "Lanzamiento ejecutado sin incidencias", months: 3 },
      { label: "Reforma express", detail: "Pintura, suelos y cocina — 12.400 €", months: 5 },
      { label: "Venta cerrada", detail: "Vendido a 138.000 € (5% bajo mercado)", months: 9 },
    ],
    highlight: "Operación completada en solo 9 meses con ROI del 34,8%",
  },
  {
    id: "case-2",
    type: "npl",
    typeLabel: "NPL — Compra de crédito",
    title: "Local comercial 120 m² en Valencia",
    location: "Valencia, C. Valenciana",
    purchasePrice: 42000,
    marketValue: 110000,
    totalInvestment: 58200,
    salePrice: 95000,
    netProfit: 36800,
    roi: 63.2,
    timeMonths: 18,
    steps: [
      { label: "Compra de crédito", detail: "Adquisición del NPL por 42.000 € (38% de deuda)", months: 0 },
      { label: "Negociación con deudor", detail: "Dación en pago acordada tras mediación", months: 6 },
      { label: "Escritura y posesión", detail: "Inscripción registral completada", months: 10 },
      { label: "Venta a inversor", detail: "Vendido a operador de coworking por 95.000 €", months: 18 },
    ],
    highlight: "ROI del 63,2% comprando el crédito al 38% de la deuda",
  },
  {
    id: "case-3",
    type: "ocupado",
    typeLabel: "Inmueble Ocupado",
    title: "Piso 2 hab. en zona prime de Madrid",
    location: "Madrid, C. de Madrid",
    purchasePrice: 125000,
    marketValue: 240000,
    totalInvestment: 168000,
    salePrice: 228000,
    netProfit: 60000,
    roi: 35.7,
    timeMonths: 24,
    steps: [
      { label: "Adquisición", detail: "Compra del inmueble ocupado por 125.000 € (-48% vs mercado)", months: 0 },
      { label: "Procedimiento legal", detail: "Demanda de desahucio y resolución judicial", months: 12 },
      { label: "Recuperación + reforma", detail: "Reforma integral por 22.000 €", months: 18 },
      { label: "Venta finalizada", detail: "Vendido por 228.000 € a particular", months: 24 },
    ],
    highlight: "Descuento de entrada del 48% en zona prime de Madrid",
  },
];

const typeConfig: Record<string, { icon: typeof Gavel; color: string; bg: string }> = {
  cesion: { icon: Gavel, color: "text-accent", bg: "bg-accent/10" },
  npl: { icon: CreditCard, color: "text-destructive", bg: "bg-destructive/10" },
  ocupado: { icon: Home, color: "text-primary", bg: "bg-primary/10" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

interface RealCaseStudiesProps {
  filterType?: "npl" | "cesion" | "ocupado";
}

const RealCaseStudies = ({ filterType }: RealCaseStudiesProps = {}) => {
  const filteredCases = filterType ? cases.filter(c => c.type === filterType) : cases;
  const [active, setActive] = useState(0);
  const c = filteredCases[active];
  if (!c) return null;
  const cfg = typeConfig[c.type];
  const Icon = cfg.icon;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3 text-xs font-semibold tracking-wider uppercase">
            Casos reales
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Resultados que hablan por sí solos
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Operaciones cerradas por inversores de IKESA. Datos reales, sin adornos.
          </p>
        </div>

        {/* Case selector tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {cases.map((cs, i) => {
            const tc = typeConfig[cs.type];
            const TIcon = tc.icon;
            return (
              <button
                key={cs.id}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active === i
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-background border border-border text-muted-foreground hover:border-accent/40"
                }`}
              >
                <TIcon className="w-4 h-4" />
                {cs.typeLabel}
              </button>
            );
          })}
        </div>

        {/* Case detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-5 gap-0">
                  {/* Left: KPIs */}
                  <div className="md:col-span-2 bg-primary p-8 text-primary-foreground flex flex-col justify-between">
                    <div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {c.typeLabel}
                      </div>
                      <h3 className="text-xl font-bold mb-1">{c.title}</h3>
                      <p className="text-primary-foreground/60 text-sm flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {c.location}
                      </p>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-primary-foreground/50 text-[11px] uppercase tracking-wider">Compra</p>
                          <p className="text-lg font-bold">{fmt(c.purchasePrice)}</p>
                        </div>
                        <div>
                          <p className="text-primary-foreground/50 text-[11px] uppercase tracking-wider">Valor mercado</p>
                          <p className="text-lg font-bold">{fmt(c.marketValue)}</p>
                        </div>
                        <div>
                          <p className="text-primary-foreground/50 text-[11px] uppercase tracking-wider">Inversión total</p>
                          <p className="text-lg font-bold">{fmt(c.totalInvestment)}</p>
                        </div>
                        <div>
                          <p className="text-primary-foreground/50 text-[11px] uppercase tracking-wider">Precio venta</p>
                          <p className="text-lg font-bold">{fmt(c.salePrice)}</p>
                        </div>
                      </div>

                      <div className="border-t border-primary-foreground/10 pt-4 grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-2xl font-extrabold text-accent">{fmt(c.netProfit)}</p>
                          <p className="text-[10px] text-primary-foreground/50 uppercase">Beneficio neto</p>
                        </div>
                        <div>
                          <p className="text-2xl font-extrabold text-accent">{c.roi}%</p>
                          <p className="text-[10px] text-primary-foreground/50 uppercase">ROI</p>
                        </div>
                        <div>
                          <p className="text-2xl font-extrabold text-accent">{c.timeMonths}m</p>
                          <p className="text-[10px] text-primary-foreground/50 uppercase">Duración</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Timeline */}
                  <div className="md:col-span-3 p-8">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-6">
                      Cronología de la operación
                    </p>

                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

                      <div className="space-y-6">
                        {c.steps.map((step, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.12 }}
                            className="relative pl-12"
                          >
                            {/* Dot */}
                            <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 ${
                              i === c.steps.length - 1
                                ? "bg-accent border-accent"
                                : "bg-background border-accent"
                            }`} />
                            {/* Month marker */}
                            <span className="absolute left-0 -top-3 text-[10px] text-muted-foreground font-mono">
                              {step.months === 0 ? "Inicio" : `+${step.months}m`}
                            </span>
                            <p className="text-sm font-semibold text-foreground">{step.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Highlight */}
                    <div className="mt-8 bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-foreground">{c.highlight}</p>
                    </div>

                    {/* Nav arrows */}
                    <div className="flex items-center justify-between mt-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={active === 0}
                        onClick={() => setActive(active - 1)}
                        className="gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Anterior
                      </Button>
                      <span className="text-xs text-muted-foreground">{active + 1} / {cases.length}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={active === cases.length - 1}
                        onClick={() => setActive(active + 1)}
                        className="gap-1"
                      >
                        Siguiente <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default RealCaseStudies;

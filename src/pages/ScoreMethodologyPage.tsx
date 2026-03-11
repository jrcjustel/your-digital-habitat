import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { Target, TrendingDown, Scale, MapPin, Clock, DoorOpen, BarChart3, ArrowRight, Info, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const dimensions = [
  {
    key: "discount",
    label: "Descuento sobre mercado",
    icon: TrendingDown,
    weight: 25,
    color: "text-accent",
    bgColor: "bg-accent/10",
    description: "Mide la diferencia entre el precio de adquisición y el valor de mercado estimado. Cuanto mayor el descuento, mayor puntuación.",
    ranges: [
      { range: "> 50%", score: "90–100", label: "Excepcional" },
      { range: "30–50%", score: "70–89", label: "Muy favorable" },
      { range: "15–30%", score: "50–69", label: "Favorable" },
      { range: "< 15%", score: "0–49", label: "Limitado" },
    ],
  },
  {
    key: "legal",
    label: "Complejidad legal",
    icon: Scale,
    weight: 20,
    color: "text-primary",
    bgColor: "bg-primary/10",
    description: "Evalúa el estado del procedimiento judicial, tipo de proceso (ejecutivo, concursal) y la presencia de cargas registrales que podrían dificultar la operación.",
    ranges: [
      { range: "Sin cargas, título limpio", score: "90–100", label: "Mínima" },
      { range: "Ejecutivo estándar", score: "70–89", label: "Baja" },
      { range: "Concursal o con cargas", score: "40–69", label: "Media" },
      { range: "Múltiples procedimientos", score: "0–39", label: "Alta" },
    ],
  },
  {
    key: "occupancy",
    label: "Estado ocupacional",
    icon: DoorOpen,
    weight: 20,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    description: "Refleja el nivel de riesgo asociado al estado de posesión del inmueble. Inmuebles vacíos puntúan mejor; ocupados con vulnerabilidad peor.",
    ranges: [
      { range: "Vacío / con llaves", score: "90–100", label: "Óptimo" },
      { range: "Ocupado con acuerdo", score: "60–80", label: "Gestionable" },
      { range: "Ocupado sin título", score: "30–59", label: "Complejo" },
      { range: "Ocupado vulnerable", score: "0–29", label: "Muy complejo" },
    ],
  },
  {
    key: "liquidity",
    label: "Liquidez de zona",
    icon: MapPin,
    weight: 15,
    color: "text-[hsl(142,71%,45%)]",
    bgColor: "bg-[hsl(142,71%,45%)]/10",
    description: "Analiza la demanda inmobiliaria de la zona, tiempo medio de venta y volumen de transacciones recientes para estimar la facilidad de salida.",
    ranges: [
      { range: "Capital / zona prime", score: "85–100", label: "Alta" },
      { range: "Ciudad media", score: "60–84", label: "Media-alta" },
      { range: "Zona periurbana", score: "35–59", label: "Media" },
      { range: "Rural / baja demanda", score: "0–34", label: "Baja" },
    ],
  },
  {
    key: "timeline",
    label: "Plazo estimado",
    icon: Clock,
    weight: 10,
    color: "text-[hsl(48,90%,40%)]",
    bgColor: "bg-[hsl(48,90%,50%)]/10",
    description: "Tiempo estimado desde la adquisición hasta la posesión efectiva y posible monetización. Plazos cortos = mayor puntuación.",
    ranges: [
      { range: "< 3 meses", score: "90–100", label: "Inmediato" },
      { range: "3–6 meses", score: "70–89", label: "Corto" },
      { range: "6–18 meses", score: "40–69", label: "Medio" },
      { range: "> 18 meses", score: "0–39", label: "Largo" },
    ],
  },
  {
    key: "exit",
    label: "Potencial de salida",
    icon: BarChart3,
    weight: 10,
    color: "text-accent",
    bgColor: "bg-accent/10",
    description: "Evalúa las opciones disponibles de monetización: venta directa, alquiler, reforma y venta, o venta a fondos. Más opciones = mayor score.",
    ranges: [
      { range: "3+ estrategias viables", score: "85–100", label: "Excelente" },
      { range: "2 estrategias viables", score: "60–84", label: "Bueno" },
      { range: "1 estrategia principal", score: "35–59", label: "Limitado" },
      { range: "Difícil monetización", score: "0–34", label: "Restringido" },
    ],
  },
];

const exampleScenarios = [
  {
    title: "Piso en Madrid — CDR Vacío",
    scores: { discount: 85, legal: 75, occupancy: 95, liquidity: 92, timeline: 80, exit: 88 },
    total: 86,
    label: "Excelente",
    color: "text-[hsl(142,71%,45%)]",
  },
  {
    title: "Nave en Toledo — NPL",
    scores: { discount: 70, legal: 55, occupancy: 40, liquidity: 45, timeline: 35, exit: 50 },
    total: 52,
    label: "Oportunidad media",
    color: "text-[hsl(48,90%,40%)]",
  },
  {
    title: "Local en Valencia — Ocupado",
    scores: { discount: 92, legal: 40, occupancy: 20, liquidity: 78, timeline: 25, exit: 60 },
    total: 55,
    label: "Alto descuento / Alto riesgo",
    color: "text-destructive",
  },
];

const ScoreMethodologyPage = () => {
  const [activeDimension, setActiveDimension] = useState<string | null>(null);
  const [simValues, setSimValues] = useState<Record<string, number>>({
    discount: 70, legal: 60, occupancy: 50, liquidity: 65, timeline: 55, exit: 60,
  });

  const simulatedTotal = Math.round(
    dimensions.reduce((sum, d) => sum + (simValues[d.key] * d.weight) / 100, 0)
  );

  const getScoreColor = (s: number) =>
    s >= 80 ? "text-[hsl(142,71%,45%)]" : s >= 60 ? "text-accent" : s >= 40 ? "text-[hsl(48,90%,40%)]" : "text-destructive";

  const getScoreLabel = (s: number) =>
    s >= 80 ? "Excelente" : s >= 60 ? "Alta oportunidad" : s >= 40 ? "Oportunidad media" : "Alto riesgo";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary to-primary/90 text-primary-foreground py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <Badge variant="secondary" className="text-xs">Metodología Profesional</Badge>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            IKESA Invest Score — Metodología
          </h1>
          <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl">
            Un modelo de scoring propietario de 0 a 100 que evalúa cada oportunidad de inversión
            distressed a través de 6 dimensiones clave, ponderadas según su impacto en la rentabilidad
            y el riesgo de la operación.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-5xl space-y-12">

        {/* Score overview */}
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" /> Las 6 Dimensiones del Score
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {dimensions.map((d) => (
              <motion.button
                key={d.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveDimension(activeDimension === d.key ? null : d.key)}
                className={`text-left rounded-2xl border p-5 transition-all ${
                  activeDimension === d.key
                    ? "border-accent bg-accent/5 shadow-md"
                    : "border-border bg-card hover:border-accent/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-xl ${d.bgColor} flex items-center justify-center`}>
                    <d.icon className={`w-5 h-5 ${d.color}`} />
                  </div>
                  <Badge variant="outline" className="text-[10px]">{d.weight}%</Badge>
                </div>
                <p className="text-sm font-semibold text-foreground">{d.label}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.description}</p>
              </motion.button>
            ))}
          </div>

          {/* Expanded dimension detail */}
          <AnimatePresence>
            {activeDimension && (() => {
              const d = dimensions.find((x) => x.key === activeDimension)!;
              return (
                <motion.div
                  key={d.key}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="border-accent/30 mb-8">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl ${d.bgColor} flex items-center justify-center`}>
                          <d.icon className={`w-5 h-5 ${d.color}`} />
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-bold text-foreground">{d.label}</h3>
                          <p className="text-xs text-muted-foreground">Peso: {d.weight}% del score total</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{d.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {d.ranges.map((r) => (
                          <div key={r.range} className="bg-muted rounded-xl p-3">
                            <p className="text-xs font-bold text-foreground">{r.label}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{r.range}</p>
                            <p className="text-xs font-mono text-accent mt-1">Score: {r.score}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>

        {/* Weight visualization */}
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" /> Ponderación
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex h-8 rounded-full overflow-hidden mb-4">
                {dimensions.map((d) => (
                  <div
                    key={d.key}
                    className={`${d.bgColor} flex items-center justify-center text-[10px] font-bold transition-all`}
                    style={{ width: `${d.weight}%` }}
                    title={`${d.label}: ${d.weight}%`}
                  >
                    {d.weight}%
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {dimensions.map((d) => (
                  <div key={d.key} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-full ${d.bgColor} border`} />
                    <span className="text-xs text-muted-foreground">{d.label} ({d.weight}%)</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-muted rounded-xl p-4 flex items-start gap-2">
                <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong>Formula:</strong> Score = Σ (Puntuación_dimensión × Peso_dimensión / 100).
                  Cada dimensión se evalúa de 0 a 100 y se pondera según su impacto en la operación.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive simulator */}
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" /> Simulador Interactivo
          </h2>
          <Card className="border-accent/20">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-6">
                Ajusta los valores de cada dimensión para ver cómo se compone el score final.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {dimensions.map((d) => (
                  <div key={d.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <d.icon className={`w-4 h-4 ${d.color}`} />
                        <span className="text-sm font-medium text-foreground">{d.label}</span>
                      </div>
                      <span className="text-sm font-bold text-foreground">{simValues[d.key]}</span>
                    </div>
                    <Slider
                      value={[simValues[d.key]]}
                      onValueChange={([v]) => setSimValues({ ...simValues, [d.key]: v })}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-[10px] text-muted-foreground text-right">Peso: {d.weight}% → contribuye {Math.round(simValues[d.key] * d.weight / 100)} pts</p>
                  </div>
                ))}
              </div>
              <div className="bg-muted rounded-2xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-1">Score simulado</p>
                <p className={`text-5xl font-bold ${getScoreColor(simulatedTotal)}`}>{simulatedTotal}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">{getScoreLabel(simulatedTotal)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Example scenarios */}
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> Escenarios Ejemplo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exampleScenarios.map((sc) => (
              <Card key={sc.title}>
                <CardContent className="p-5">
                  <p className="text-sm font-bold text-foreground mb-1">{sc.title}</p>
                  <p className={`text-3xl font-bold ${sc.color} mb-3`}>{sc.total}/100</p>
                  <Badge variant="outline" className="text-[10px] mb-3">{sc.label}</Badge>
                  <div className="space-y-2">
                    {dimensions.map((d) => {
                      const val = sc.scores[d.key as keyof typeof sc.scores];
                      return (
                        <div key={d.key} className="flex items-center gap-2">
                          <d.icon className={`w-3 h-3 ${d.color} shrink-0`} />
                          <span className="text-[11px] text-muted-foreground flex-1">{d.label}</span>
                          <span className="text-[11px] font-mono font-bold text-foreground">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-8 text-center">
          <h3 className="font-heading text-xl font-bold text-primary-foreground mb-2">
            Explora oportunidades con score en tiempo real
          </h3>
          <p className="text-primary-foreground/70 text-sm mb-6">
            Cada activo del catálogo incluye su IKESA Invest Score calculado automáticamente.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="secondary" className="gap-2">
              <Link to="/inmuebles"><ArrowRight className="w-4 h-4" /> Ver catálogo</Link>
            </Button>
            <Button asChild variant="outline" className="gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/guia-inversion/test-inversor"><Target className="w-4 h-4" /> Test de inversor</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ScoreMethodologyPage;

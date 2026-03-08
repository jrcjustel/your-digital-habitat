import { TrendingDown, Gavel, Building2, HandCoins, Key, TrendingUp } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const milestones = [
  { label: "Impago hipoteca", sub: "El propietario deja de pagar", icon: TrendingDown },
  { label: "Ejecución judicial", sub: "El banco inicia el procedimiento", icon: Gavel },
  { label: "Subasta / Remate", sub: "El activo sale a subasta BOE", icon: Building2 },
  { label: "Compra con Ikesa", sub: "Adquieres con 10-70% dto.", icon: HandCoins, highlight: true },
  { label: "Recuperas posesión", sub: "Desocupación + reforma", icon: Key },
  { label: "Valor de mercado", sub: "Plusvalía realizada", icon: TrendingUp },
];

// Points on the curve (x%, y%) — y=0 is top, y=100 is bottom
const curvePoints = [
  { x: 8, y: 15 },   // Impago - starts high
  { x: 24, y: 40 },   // Ejecución - dropping
  { x: 42, y: 60 },   // Subasta - near bottom
  { x: 58, y: 48 },   // Compra Ikesa - starting recovery
  { x: 76, y: 25 },   // Recuperas - rising
  { x: 92, y: 10 },   // Valor mercado - back to top
];

const PriceCycleGraph = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const vw = 1000;
  const vh = 260;

  const toSvg = (xPct: number, yPct: number) => ({
    x: (xPct / 100) * vw,
    y: (yPct / 100) * vh,
  });

  const points = curvePoints.map((p) => toSvg(p.x, p.y));

  // Build smooth cubic bezier path
  const buildPath = () => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpx = p0.x + (p1.x - p0.x) * 0.5;
      d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const curvePath = buildPath();

  // Split path at index 3 (after Subasta) for red/blue coloring
  const buildHalfPath = (startIdx: number, endIdx: number) => {
    const subset = points.slice(startIdx, endIdx + 1);
    if (subset.length < 2) return "";
    let d = `M ${subset[0].x} ${subset[0].y}`;
    for (let i = 0; i < subset.length - 1; i++) {
      const p0 = subset[i];
      const p1 = subset[i + 1];
      const cpx = p0.x + (p1.x - p0.x) * 0.5;
      d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const redPath = buildHalfPath(0, 2);
  const bluePath = buildHalfPath(2, 5);

  // Fill area under the blue recovery part
  const blueFillPath = `${bluePath} L ${points[5].x} ${vh} L ${points[2].x} ${vh} Z`;

  const marketLineY = vh * 0.08;

  return (
    <div className="w-full max-w-4xl mx-auto" ref={ref}>
      {/* SVG Graph — compact */}
      <div className="relative">
        <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          {/* Market price dashed line */}
          <motion.line
            x1={0} y1={marketLineY} x2={vw} y2={marketLineY}
            stroke="hsl(var(--accent))" strokeWidth="1.5" strokeDasharray="10 6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.5 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          <motion.text
            x={vw - 8} y={marketLineY - 8} textAnchor="end"
            className="fill-accent text-[12px] font-semibold"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.7 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Precio de mercado
          </motion.text>

          {/* Blue recovery fill area */}
          <motion.path
            d={blueFillPath}
            fill="hsl(var(--accent))"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.06 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          />

          {/* Red descending curve */}
          <motion.path
            d={redPath}
            fill="none"
            stroke="hsl(var(--destructive))"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 0.7 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut", delay: 0.4 }}
          />

          {/* Blue ascending curve */}
          <motion.path
            d={bluePath}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 1 }}
          />

          {/* Milestone dots */}
          {points.map((pt, i) => (
            <g key={i}>
              {milestones[i].highlight && (
                <motion.circle
                  cx={pt.x} cy={pt.y} r="14"
                  fill="hsl(var(--accent))" opacity="0.12"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.2, type: "spring" }}
                />
              )}
              <motion.circle
                cx={pt.x} cy={pt.y}
                r={milestones[i].highlight ? 7 : 5}
                fill={i < 3 ? "hsl(var(--destructive))" : "hsl(var(--accent))"}
                stroke="hsl(var(--background))" strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + i * 0.2, type: "spring", stiffness: 300 }}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Milestone cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        {milestones.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.35, delay: 0.8 + i * 0.1 }}
              className={`text-center px-3 py-3 rounded-lg transition-all ${
                m.highlight
                  ? "bg-accent/10 border border-accent/25 shadow-sm"
                  : "bg-secondary/40"
              }`}
            >
              <Icon className={`w-4 h-4 mx-auto mb-1.5 ${
                m.highlight ? "text-accent" : i < 3 ? "text-destructive/60" : "text-accent/60"
              }`} />
              <p className={`text-[11px] font-bold leading-tight ${
                m.highlight ? "text-accent" : "text-foreground"
              }`}>
                {m.label}
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{m.sub}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceCycleGraph;

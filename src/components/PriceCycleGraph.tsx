import { Gavel, Building2, TrendingDown, HandCoins, Key, TrendingUp } from "lucide-react";

/**
 * Visual price-cycle graph inspired by Auctree's "El ciclo de los Inmuebles Judiciales".
 * Shows how property value drops during judicial process and recovers after acquisition.
 * Pure SVG + Tailwind, no charting library needed.
 */

const milestones = [
  {
    label: "Impago hipoteca",
    sub: "El propietario deja de pagar",
    icon: TrendingDown,
    x: 8,
    y: 28,
  },
  {
    label: "Ejecución judicial",
    sub: "El banco inicia el procedimiento",
    icon: Gavel,
    x: 25,
    y: 55,
  },
  {
    label: "Subasta / Remate",
    sub: "El activo sale a subasta BOE",
    icon: Building2,
    x: 45,
    y: 72,
  },
  {
    label: "Compra con Ikesa",
    sub: "Adquieres con 10-70% dto.",
    icon: HandCoins,
    x: 62,
    y: 58,
    highlight: true,
  },
  {
    label: "Recuperas posesión",
    sub: "Desocupación + reforma",
    icon: Key,
    x: 78,
    y: 38,
  },
  {
    label: "Valor de mercado",
    sub: "Plusvalía realizada",
    icon: TrendingUp,
    x: 93,
    y: 18,
  },
];

const PriceCycleGraph = () => {
  // SVG viewBox is 1000 x 400
  const vw = 1000;
  const vh = 400;

  const toSvg = (xPct: number, yPct: number) => ({
    x: (xPct / 100) * vw,
    y: (yPct / 100) * vh,
  });

  // Build curve path through milestones
  const points = milestones.map((m) => toSvg(m.x, m.y));

  // Smooth bezier through points
  const buildPath = () => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) * 0.5;
      const cpx2 = p0.x + (p1.x - p0.x) * 0.5;
      d += ` C ${cpx1} ${p0.y}, ${cpx2} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const curvePath = buildPath();

  // Gradient fill under curve
  const fillPath = `${curvePath} L ${points[points.length - 1].x} ${vh} L ${points[0].x} ${vh} Z`;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* SVG Graph */}
      <div className="relative">
        <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          {/* Defs */}
          <defs>
            <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.6" />
              <stop offset="40%" stopColor="hsl(var(--destructive))" stopOpacity="0.4" />
              <stop offset="55%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--destructive))" />
              <stop offset="45%" stopColor="hsl(var(--destructive))" />
              <stop offset="55%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => (
            <line
              key={frac}
              x1={0}
              y1={vh * frac}
              x2={vw}
              y2={vh * frac}
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              strokeDasharray="6 4"
            />
          ))}

          {/* "Precio de mercado" reference line */}
          <line
            x1={0}
            y1={vh * 0.2}
            x2={vw}
            y2={vh * 0.2}
            stroke="hsl(var(--accent))"
            strokeWidth="1"
            strokeDasharray="8 4"
            opacity={0.5}
          />
          <text
            x={vw - 10}
            y={vh * 0.2 - 8}
            textAnchor="end"
            className="fill-accent text-[13px] font-semibold"
          >
            Precio de mercado
          </text>

          {/* Area fill */}
          <path d={fillPath} fill="url(#curveGrad)" opacity="0.2" />

          {/* Curve line */}
          <path
            d={curvePath}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Milestone dots */}
          {points.map((pt, i) => (
            <g key={i}>
              {/* Vertical dashed line from dot to bottom */}
              <line
                x1={pt.x}
                y1={pt.y}
                x2={pt.x}
                y2={vh}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                strokeDasharray="4 3"
              />
              {/* Outer ring for highlight */}
              {milestones[i].highlight && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="16"
                  fill="hsl(var(--accent))"
                  opacity="0.15"
                />
              )}
              {/* Dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={milestones[i].highlight ? 8 : 6}
                fill={milestones[i].highlight ? "hsl(var(--accent))" : i < 3 ? "hsl(var(--destructive))" : "hsl(var(--accent))"}
                stroke="hsl(var(--background))"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Labels under the graph */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        {milestones.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className={`text-center p-3 rounded-xl transition-all ${
                m.highlight
                  ? "bg-accent/10 border border-accent/30 shadow-sm"
                  : "bg-secondary/50"
              }`}
            >
              <Icon
                className={`w-5 h-5 mx-auto mb-2 ${
                  m.highlight ? "text-accent" : i < 3 ? "text-destructive/70" : "text-accent/70"
                }`}
              />
              <p className={`text-xs font-bold leading-tight ${m.highlight ? "text-accent" : "text-foreground"}`}>
                {m.label}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{m.sub}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriceCycleGraph;

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";

const fmt = (n: number) => n.toLocaleString("es-ES");
const fmtK = (n: number) => `€${(n / 1000).toFixed(0)}k`;

/** KPI Card row - prominent metrics */
interface KpiItem {
  label: string;
  value: string;
  sublabel?: string;
  accent?: boolean;
}

export const KpiCards = ({ items }: { items: KpiItem[] }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {items.map((item, i) => (
      <div
        key={i}
        className={`rounded-xl border-2 border-dashed p-4 text-center ${
          item.accent ? "border-accent bg-accent/5" : "border-border"
        }`}
      >
        <p className={`text-xl md:text-2xl font-bold ${item.accent ? "text-accent" : "text-foreground"}`}>
          {item.value}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
        {item.sublabel && <p className="text-[10px] text-muted-foreground">{item.sublabel}</p>}
      </div>
    ))}
  </div>
);

/** Vertical bar chart for comparison (Deuda, Valor Subasta, Valoración, etc.) */
interface ComparisonBarData {
  name: string;
  value: number;
  color?: string;
}

export const ComparisonBarChart = ({ data, height = 220 }: { data: ComparisonBarData[]; height?: number }) => {
  const COLORS = ["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))"];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h4 className="text-sm font-bold text-foreground mb-3">Resumen</h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtK}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            formatter={(value: number) => [`${fmt(value)} €`, ""]}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/** Gantt-style horizontal calendar */
interface GanttItem {
  label: string;
  startMonth: number;
  durationMonths: number;
}

export const GanttCalendar = ({ items, totalMonths }: { items: GanttItem[]; totalMonths: number }) => {
  // Generate tick marks
  const ticks: number[] = [];
  const step = totalMonths <= 24 ? 6 : 13;
  for (let i = 0; i <= totalMonths; i += step) ticks.push(i);
  if (ticks[ticks.length - 1] !== totalMonths) ticks.push(totalMonths);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-foreground">Calendario (meses)</h4>
        <Badge variant="outline" className="text-xs">{totalMonths} meses</Badge>
      </div>

      {/* Tick header */}
      <div className="flex ml-24 mb-1">
        {ticks.map((t) => (
          <div
            key={t}
            className="text-[10px] text-muted-foreground absolute"
            style={{ left: `calc(${(t / totalMonths) * 100}%)` }}
          >
            {t}
          </div>
        ))}
      </div>

      <div className="relative ml-24">
        {/* Tick marks row */}
        <div className="flex justify-between mb-2">
          {ticks.map((t) => (
            <span key={t} className="text-[10px] text-muted-foreground" style={{ width: 0, textAlign: "center" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const leftPct = (item.startMonth / totalMonths) * 100;
          const widthPct = Math.max((item.durationMonths / totalMonths) * 100, 3);
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-24 shrink-0 text-right pr-2">{item.label}</span>
              <div className="flex-1 h-7 relative bg-secondary/50 rounded">
                <div
                  className="absolute top-0 h-7 rounded bg-accent/80 flex items-center justify-center"
                  style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: "28px" }}
                >
                  <span className="text-[10px] font-bold text-accent-foreground">{item.durationMonths}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom scale */}
      <div className="flex items-center ml-24 mt-1 relative h-4">
        <div className="absolute inset-x-0 top-0 h-px bg-border" />
        {ticks.map((t) => (
          <div
            key={t}
            className="absolute flex flex-col items-center"
            style={{ left: `${(t / totalMonths) * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-px h-2 bg-border" />
            <span className="text-[9px] text-muted-foreground mt-0.5">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Sensitivity table as inline colored chips */
interface SensitivityItem {
  price: number;
  tir: number;
}

export const SensitivityRow = ({ items, basePrice }: { items: SensitivityItem[]; basePrice: number }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <h4 className="text-sm font-bold text-foreground mb-3 text-center">Precio de Compra / TIR Bruta</h4>
    <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((s, i) => {
        const isBase = s.price === basePrice;
        return (
          <div key={i} className={`text-center p-2 ${isBase ? "bg-accent/10 rounded-lg" : ""}`}>
            <p className={`text-xs font-bold ${isBase ? "text-accent" : "text-foreground"}`}>
              €{(s.price / 1000).toFixed(0)}k
            </p>
            <p className={`text-sm font-bold mt-1 ${
              s.tir > 20 ? "text-accent" : s.tir > 10 ? "text-primary" : "text-muted-foreground"
            }`}>
              {s.tir}%
            </p>
          </div>
        );
      })}
    </div>
  </div>
);

import { useMemo } from "react";
import { TrendingUp, BarChart3, PieChart, Target, MapPin, Building2, AlertTriangle, DollarSign } from "lucide-react";
import { properties } from "@/data/properties";
import { autoValuateProperty, estimateZoneLiquidity } from "@/lib/valuationEngine";

const InvestorDashboard = () => {
  const analytics = useMemo(() => {
    const allValuations = properties.filter(p => p.operation === "venta").map(p => ({
      property: p,
      valuation: autoValuateProperty(p),
    }));

    const withDiscount = allValuations.filter(v => v.valuation.discount > 0);
    const avgDiscount = withDiscount.length > 0
      ? Math.round(withDiscount.reduce((s, v) => s + v.valuation.discount, 0) / withDiscount.length)
      : 0;

    const withProf = properties.filter(p => p.profitability);
    const avgProfitability = withProf.length > 0
      ? Math.round(withProf.reduce((s, p) => s + (p.profitability || 0), 0) / withProf.length * 10) / 10
      : 0;

    const avgScore = allValuations.length > 0
      ? Math.round(allValuations.reduce((s, v) => s + v.valuation.opportunityScore.score, 0) / allValuations.length)
      : 0;

    // By sale type
    const bySaleType: Record<string, number> = {};
    properties.forEach(p => { bySaleType[p.saleType] = (bySaleType[p.saleType] || 0) + 1; });

    // By province
    const byProvince: Record<string, number> = {};
    properties.forEach(p => { byProvince[p.province] = (byProvince[p.province] || 0) + 1; });

    // Score distribution
    const scoreDistribution = { excelente: 0, alta: 0, media: 0, altoRiesgo: 0 };
    allValuations.forEach(v => {
      const s = v.valuation.opportunityScore.score;
      if (s >= 90) scoreDistribution.excelente++;
      else if (s >= 70) scoreDistribution.alta++;
      else if (s >= 50) scoreDistribution.media++;
      else scoreDistribution.altoRiesgo++;
    });

    // Liquidity distribution
    const liquidityDist = { alta: 0, media: 0, baja: 0 };
    allValuations.forEach(v => { liquidityDist[v.valuation.zoneLiquidity]++; });

    // Top opportunities
    const topOpportunities = [...allValuations]
      .sort((a, b) => b.valuation.opportunityScore.score - a.valuation.opportunityScore.score)
      .slice(0, 5);

    // Price per m²
    const avgPriceM2 = properties.filter(p => p.area > 0).length > 0
      ? Math.round(properties.filter(p => p.area > 0).reduce((s, p) => s + p.price / p.area, 0) / properties.filter(p => p.area > 0).length)
      : 0;

    const totalValue = properties.reduce((s, p) => s + p.price, 0);

    return { avgDiscount, avgProfitability, avgScore, bySaleType, byProvince, scoreDistribution, liquidityDist, topOpportunities, avgPriceM2, totalValue, total: properties.length };
  }, []);

  const saleTypeLabels: Record<string, string> = {
    compraventa: "Compraventa", npl: "NPL", "cesion-remate": "Cesión Remate", ocupado: "Ocupado",
  };

  const KPI = ({ icon: Icon, label, value, sublabel, color }: { icon: any; label: string; value: string; sublabel?: string; color?: string }) => (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color || "text-foreground"}`}>{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </div>
  );

  const BarItem = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
      </div>
    </div>
  );

  const maxProvince = Math.max(...Object.values(analytics.byProvince));
  const maxSaleType = Math.max(...Object.values(analytics.bySaleType));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={Target} label="Score medio" value={`${analytics.avgScore}/100`} sublabel="Oportunidad media del catálogo" />
        <KPI icon={TrendingUp} label="Rentabilidad media" value={`${analytics.avgProfitability}%`} sublabel="Sobre activos con alquiler estimado" color="text-accent" />
        <KPI icon={DollarSign} label="Descuento medio" value={`-${analytics.avgDiscount}%`} sublabel="Sobre valor de mercado" />
        <KPI icon={BarChart3} label="Precio medio m²" value={`${analytics.avgPriceM2.toLocaleString("es-ES")} €`} sublabel={`${analytics.total} activos · ${(analytics.totalValue / 1e6).toFixed(1)}M € total`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score distribution */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" /> Distribución Scoring
          </h3>
          <div className="space-y-3">
            <BarItem label="Excelente (90-100)" value={analytics.scoreDistribution.excelente} max={analytics.total} color="bg-[hsl(142,71%,45%)]" />
            <BarItem label="Alta (70-89)" value={analytics.scoreDistribution.alta} max={analytics.total} color="bg-accent" />
            <BarItem label="Media (50-69)" value={analytics.scoreDistribution.media} max={analytics.total} color="bg-[hsl(48,90%,50%)]" />
            <BarItem label="Alto riesgo (<50)" value={analytics.scoreDistribution.altoRiesgo} max={analytics.total} color="bg-destructive" />
          </div>
        </div>

        {/* By sale type */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-accent" /> Por Tipo de Venta
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.bySaleType).map(([key, count]) => (
              <BarItem key={key} label={saleTypeLabels[key] || key} value={count} max={maxSaleType} color="bg-accent" />
            ))}
          </div>
        </div>

        {/* By province */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" /> Por Provincia
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.byProvince)
              .sort(([, a], [, b]) => b - a)
              .map(([province, count]) => (
                <BarItem key={province} label={province} value={count} max={maxProvince} color="bg-primary" />
              ))}
          </div>
        </div>

        {/* Liquidity distribution */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent" /> Liquidez por Zona
          </h3>
          <div className="space-y-3">
            <BarItem label="Alta liquidez" value={analytics.liquidityDist.alta} max={analytics.total} color="bg-[hsl(142,71%,45%)]" />
            <BarItem label="Media liquidez" value={analytics.liquidityDist.media} max={analytics.total} color="bg-[hsl(48,90%,50%)]" />
            <BarItem label="Baja liquidez" value={analytics.liquidityDist.baja} max={analytics.total} color="bg-destructive" />
          </div>
        </div>
      </div>

      {/* Top opportunities */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-heading text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" /> Top 5 Oportunidades
        </h3>
        <div className="space-y-3">
          {analytics.topOpportunities.map(({ property: p, valuation: v }, i) => (
            <div key={p.id} className="flex items-center gap-4 bg-secondary rounded-xl p-3">
              <span className="text-lg font-bold text-accent w-6 text-center">{i + 1}</span>
              <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{p.reference} — {p.title}</p>
                <p className="text-xs text-muted-foreground">{p.municipality}, {p.province} · {p.price.toLocaleString("es-ES")} €</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-lg font-bold ${v.opportunityScore.color}`}>{v.opportunityScore.score}</p>
                <p className="text-[10px] text-muted-foreground">{v.opportunityScore.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;

import { useMemo } from "react";
import { TrendingUp, MapPin, BarChart3, Droplets, Building2, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { properties } from "@/data/properties";
import { estimateZoneLiquidity, type ZoneLiquidity } from "@/lib/valuationEngine";

interface ProvinceData {
  province: string;
  count: number;
  avgPriceM2: number;
  avgPrice: number;
  avgDiscount: number;
  liquidity: ZoneLiquidity;
  avgProfitability: number;
  trend: "up" | "down" | "stable";
}

const MarketIntelligence = () => {
  const provinceData = useMemo<ProvinceData[]>(() => {
    const byProvince: Record<string, typeof properties> = {};
    properties.forEach(p => {
      if (!byProvince[p.province]) byProvince[p.province] = [];
      byProvince[p.province].push(p);
    });

    return Object.entries(byProvince).map(([province, props]) => {
      const withArea = props.filter(p => p.area > 0);
      const avgPriceM2 = withArea.length > 0
        ? Math.round(withArea.reduce((s, p) => s + p.price / p.area, 0) / withArea.length)
        : 0;
      const avgPrice = Math.round(props.reduce((s, p) => s + p.price, 0) / props.length);
      const withDiscount = props.filter(p => p.marketValue && p.marketValue > p.price);
      const avgDiscount = withDiscount.length > 0
        ? Math.round(withDiscount.reduce((s, p) => s + ((p.marketValue! - p.price) / p.marketValue!) * 100, 0) / withDiscount.length)
        : 0;
      const withProf = props.filter(p => p.profitability);
      const avgProfitability = withProf.length > 0
        ? Math.round(withProf.reduce((s, p) => s + (p.profitability || 0), 0) / withProf.length * 10) / 10
        : 0;

      const liquidity = estimateZoneLiquidity(province);
      // Simulated trend based on discount (higher discount = more opportunity = upward trend)
      const trend: "up" | "down" | "stable" = avgDiscount > 30 ? "up" : avgDiscount > 15 ? "stable" : "down";

      return { province, count: props.length, avgPriceM2, avgPrice, avgDiscount, liquidity, avgProfitability, trend };
    }).sort((a, b) => b.count - a.count);
  }, []);

  const liquidityStyles: Record<ZoneLiquidity, string> = {
    alta: "bg-[hsl(142,71%,45%)]/15 text-[hsl(142,71%,45%)]",
    media: "bg-[hsl(48,90%,50%)]/15 text-[hsl(48,90%,40%)]",
    baja: "bg-destructive/15 text-destructive",
  };

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    if (trend === "up") return <ArrowUp className="w-3.5 h-3.5 text-[hsl(142,71%,45%)]" />;
    if (trend === "down") return <ArrowDown className="w-3.5 h-3.5 text-destructive" />;
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  // Market summary KPIs
  const totalAssets = properties.length;
  const globalAvgM2 = properties.filter(p => p.area > 0).length > 0
    ? Math.round(properties.filter(p => p.area > 0).reduce((s, p) => s + p.price / p.area, 0) / properties.filter(p => p.area > 0).length)
    : 0;
  const highLiquidityCount = provinceData.filter(p => p.liquidity === "alta").reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-6">
      {/* Market KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Precio medio m²</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{globalAvgM2.toLocaleString("es-ES")} €</p>
          <p className="text-xs text-muted-foreground mt-1">Media de {totalAssets} activos</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Provincias cubiertas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{provinceData.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{highLiquidityCount} activos en zona alta liquidez</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Tendencia general</span>
          </div>
          <p className="text-2xl font-bold text-accent">Favorable</p>
          <p className="text-xs text-muted-foreground mt-1">Descuentos medios superiores al 20%</p>
        </div>
      </div>

      {/* Province Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <Droplets className="w-4 h-4 text-accent" /> Inteligencia de Mercado por Provincia
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary text-xs text-muted-foreground">
                <th className="text-left px-5 py-3 font-medium">Provincia</th>
                <th className="text-center px-3 py-3 font-medium">Activos</th>
                <th className="text-right px-3 py-3 font-medium">€/m²</th>
                <th className="text-right px-3 py-3 font-medium">Precio medio</th>
                <th className="text-center px-3 py-3 font-medium">Descuento</th>
                <th className="text-center px-3 py-3 font-medium">Rentab.</th>
                <th className="text-center px-3 py-3 font-medium">Liquidez</th>
                <th className="text-center px-5 py-3 font-medium">Tendencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {provinceData.map(pd => (
                <tr key={pd.province} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-5 py-3 font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {pd.province}
                  </td>
                  <td className="text-center px-3 py-3 text-foreground">{pd.count}</td>
                  <td className="text-right px-3 py-3 font-medium text-foreground">{pd.avgPriceM2.toLocaleString("es-ES")} €</td>
                  <td className="text-right px-3 py-3 text-foreground">{pd.avgPrice.toLocaleString("es-ES")} €</td>
                  <td className="text-center px-3 py-3">
                    {pd.avgDiscount > 0 ? (
                      <span className="text-accent font-bold">-{pd.avgDiscount}%</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="text-center px-3 py-3">
                    {pd.avgProfitability > 0 ? (
                      <span className="font-bold text-foreground">{pd.avgProfitability}%</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="text-center px-3 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${liquidityStyles[pd.liquidity]}`}>
                      {pd.liquidity}
                    </span>
                  </td>
                  <td className="text-center px-5 py-3">
                    <TrendIcon trend={pd.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;

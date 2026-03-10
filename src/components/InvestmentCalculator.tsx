import { useState, useMemo } from "react";
import { Calculator, TrendingUp, DollarSign, Clock, Info } from "lucide-react";
import { calculateInvestmentReturns } from "@/lib/valuationEngine";
import type { Property } from "@/data/properties";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// ITP rates by comunidad autónoma (general rate for second-hand properties, 2024-2025)
const ITP_RATES: Record<string, number> = {
  "Andalucía": 7,
  "Aragón": 8,
  "Asturias": 8,
  "Principado de Asturias": 8,
  "Islas Baleares": 8,
  "Baleares": 8,
  "Canarias": 6.5,
  "Islas Canarias": 6.5,
  "Cantabria": 10,
  "Castilla y León": 8,
  "Castilla-La Mancha": 9,
  "Cataluña": 10,
  "Catalunya": 10,
  "Comunidad de Madrid": 6,
  "Madrid": 6,
  "Comunitat Valenciana": 10,
  "Comunidad Valenciana": 10,
  "Valencia": 10,
  "Extremadura": 8,
  "Galicia": 9,
  "La Rioja": 7,
  "Región de Murcia": 8,
  "Murcia": 8,
  "Navarra": 6,
  "Comunidad Foral de Navarra": 6,
  "País Vasco": 4,
  "Euskadi": 4,
  "Ceuta": 6,
  "Melilla": 6,
};

// Average rent per m² by comunidad autónoma (€/m²/month, approximate market data)
const RENT_PER_SQM: Record<string, number> = {
  "Andalucía": 8.5,
  "Aragón": 8.0,
  "Asturias": 6.5,
  "Principado de Asturias": 6.5,
  "Islas Baleares": 13.0,
  "Baleares": 13.0,
  "Canarias": 10.0,
  "Islas Canarias": 10.0,
  "Cantabria": 7.5,
  "Castilla y León": 6.0,
  "Castilla-La Mancha": 5.5,
  "Cataluña": 14.0,
  "Catalunya": 14.0,
  "Comunidad de Madrid": 15.0,
  "Madrid": 15.0,
  "Comunitat Valenciana": 9.0,
  "Comunidad Valenciana": 9.0,
  "Valencia": 9.0,
  "Extremadura": 5.0,
  "Galicia": 7.0,
  "La Rioja": 6.5,
  "Región de Murcia": 7.5,
  "Murcia": 7.5,
  "Navarra": 9.0,
  "Comunidad Foral de Navarra": 9.0,
  "País Vasco": 12.0,
  "Euskadi": 12.0,
  "Ceuta": 7.0,
  "Melilla": 7.0,
};

// Notaría + registro + gestoría as % of purchase price
const NOTARY_REGISTRY_PCT = 1.5;

function getItpRate(community: string): number {
  if (!community) return 8;
  for (const [key, rate] of Object.entries(ITP_RATES)) {
    if (community.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(community.toLowerCase())) {
      return rate;
    }
  }
  return 8; // fallback
}

function getRentPerSqm(community: string): number {
  if (!community) return 8;
  for (const [key, rent] of Object.entries(RENT_PER_SQM)) {
    if (community.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(community.toLowerCase())) {
      return rent;
    }
  }
  return 8; // fallback
}

interface InvestmentCalculatorProps {
  property: Property;
}

const InvestmentCalculator = ({ property }: InvestmentCalculatorProps) => {
  const community = property.community || "";
  const itpRate = getItpRate(community);
  const rentSqm = getRentPerSqm(community);
  const area = property.area || 0;

  // Better initial estimates based on community data
  const estimatedMonthlyRent = useMemo(() => {
    if (property.profitability && property.profitability > 0) {
      return Math.round((property.price * (property.profitability / 100)) / 12);
    }
    if (area > 0) {
      return Math.round(area * rentSqm);
    }
    return Math.round(property.price * 0.005);
  }, [property.price, property.profitability, area, rentSqm]);

  const [purchasePrice, setPurchasePrice] = useState(property.price);
  const [reformCosts, setReformCosts] = useState(0);
  // ITP + notaría/registro/gestoría
  const initialTaxes = Math.round(property.price * (itpRate / 100)) + Math.round(property.price * (NOTARY_REGISTRY_PCT / 100));
  const [taxes, setTaxes] = useState(initialTaxes);
  const [monthlyRent, setMonthlyRent] = useState(estimatedMonthlyRent);
  // Annual expenses: IBI (~0.5% cadastral value ≈ 0.3% market), community fees (~1200/year avg), insurance (~300/year), maintenance (~1% rent)
  const initialAnnualExpenses = useMemo(() => {
    const ibi = Math.round(property.price * 0.003);
    const comunidad = area > 0 ? Math.round(area * 1.2 * 12) : 1200; // ~1.2€/m²/month
    const seguro = 300;
    const mantenimiento = Math.round(estimatedMonthlyRent * 12 * 0.05);
    return ibi + comunidad + seguro + mantenimiento;
  }, [property.price, area, estimatedMonthlyRent]);
  const [annualExpenses, setAnnualExpenses] = useState(initialAnnualExpenses);

  const result = calculateInvestmentReturns({
    purchasePrice,
    reformCosts,
    taxes,
    monthlyRent,
    annualExpenses,
  });

  const InputField = ({ label, value, onChange, suffix, tooltip }: { label: string; value: number; onChange: (v: number) => void; suffix: string; tooltip?: string }) => (
    <div>
      <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
        {label}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3 h-3 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-secondary rounded-lg px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );

  const ResultCard = ({ icon: Icon, label, value, highlight, sublabel }: { icon: any; label: string; value: string; highlight?: boolean; sublabel?: string }) => (
    <div className={`rounded-xl p-4 ${highlight ? "bg-accent/10 border-2 border-accent" : "bg-secondary"}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${highlight ? "text-accent" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-accent" : "text-foreground"}`}>{value}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>}
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2 mb-2">
        <Calculator className="w-5 h-5 text-accent" />
        Calculadora de Rentabilidad
      </h3>
      {community && (
        <p className="text-xs text-muted-foreground mb-5">
          Datos ajustados para <span className="font-semibold text-foreground">{community}</span> · ITP: {itpRate}% · Alquiler zona: ~{rentSqm} €/m²/mes
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <InputField 
          label="Precio compra" 
          value={purchasePrice} 
          onChange={setPurchasePrice} 
          suffix="€" 
        />
        <InputField 
          label="Reforma estimada" 
          value={reformCosts} 
          onChange={setReformCosts} 
          suffix="€" 
        />
        <InputField 
          label="Impuestos y gastos" 
          value={taxes} 
          onChange={setTaxes} 
          suffix="€" 
          tooltip={`ITP ${itpRate}% (${community || "general"}) + notaría, registro y gestoría ~${NOTARY_REGISTRY_PCT}%`}
        />
        <InputField 
          label="Alquiler mensual est." 
          value={monthlyRent} 
          onChange={setMonthlyRent} 
          suffix="€/mes" 
          tooltip={area > 0 ? `Estimado: ${area} m² × ${rentSqm} €/m²/mes en ${community}` : `Basado en datos de mercado de ${community}`}
        />
        <InputField 
          label="Gastos anuales" 
          value={annualExpenses} 
          onChange={setAnnualExpenses} 
          suffix="€/año" 
          tooltip="IBI + comunidad + seguro + mantenimiento"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <ResultCard 
          icon={DollarSign} 
          label="Inversión total" 
          value={`${result.totalInvestment.toLocaleString("es-ES")} €`} 
        />
        <ResultCard 
          icon={TrendingUp} 
          label="Rentabilidad bruta" 
          value={`${result.grossYield}%`} 
          sublabel={`${(monthlyRent * 12).toLocaleString("es-ES")} €/año`}
        />
        <ResultCard 
          icon={TrendingUp} 
          label="Rentabilidad neta" 
          value={`${result.netYield}%`} 
          highlight 
          sublabel={`${((monthlyRent * 12) - annualExpenses).toLocaleString("es-ES")} €/año netos`}
        />
        <ResultCard 
          icon={TrendingUp} 
          label="ROI" 
          value={`${result.roi}%`} 
        />
        <ResultCard 
          icon={DollarSign} 
          label="Ingreso neto mensual" 
          value={`${result.monthlyNetIncome.toLocaleString("es-ES")} €`} 
          sublabel={`Bruto: ${monthlyRent.toLocaleString("es-ES")} € − Gastos: ${Math.round(annualExpenses / 12).toLocaleString("es-ES")} €`}
        />
        <ResultCard 
          icon={Clock} 
          label="Payback" 
          value={result.paybackYears === Infinity ? "N/A" : `${result.paybackYears} años`} 
        />
      </div>
    </div>
  );
};

export default InvestmentCalculator;

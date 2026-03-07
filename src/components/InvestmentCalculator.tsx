import { useState } from "react";
import { Calculator, TrendingUp, DollarSign, Clock } from "lucide-react";
import { calculateInvestmentReturns } from "@/lib/valuationEngine";
import type { Property } from "@/data/properties";

interface InvestmentCalculatorProps {
  property: Property;
}

const InvestmentCalculator = ({ property }: InvestmentCalculatorProps) => {
  const [purchasePrice, setPurchasePrice] = useState(property.price);
  const [reformCosts, setReformCosts] = useState(0);
  const [taxes, setTaxes] = useState(Math.round(property.price * 0.08));
  const [monthlyRent, setMonthlyRent] = useState(
    property.profitability
      ? Math.round((property.price * (property.profitability / 100)) / 12)
      : Math.round(property.price * 0.005)
  );
  const [annualExpenses, setAnnualExpenses] = useState(Math.round(monthlyRent * 12 * 0.15));

  const result = calculateInvestmentReturns({
    purchasePrice,
    reformCosts,
    taxes,
    monthlyRent,
    annualExpenses,
  });

  const InputField = ({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix: string }) => (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
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

  const ResultCard = ({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) => (
    <div className={`rounded-xl p-4 ${highlight ? "bg-accent/10 border-2 border-accent" : "bg-secondary"}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${highlight ? "text-accent" : "text-muted-foreground"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-accent" : "text-foreground"}`}>{value}</p>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-accent" />
        Calculadora de Rentabilidad
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <InputField label="Precio compra" value={purchasePrice} onChange={setPurchasePrice} suffix="€" />
        <InputField label="Reforma estimada" value={reformCosts} onChange={setReformCosts} suffix="€" />
        <InputField label="Impuestos y gastos" value={taxes} onChange={setTaxes} suffix="€" />
        <InputField label="Alquiler mensual est." value={monthlyRent} onChange={setMonthlyRent} suffix="€/mes" />
        <InputField label="Gastos anuales (IBI, comunidad...)" value={annualExpenses} onChange={setAnnualExpenses} suffix="€/año" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <ResultCard icon={DollarSign} label="Inversión total" value={`${result.totalInvestment.toLocaleString("es-ES")} €`} />
        <ResultCard icon={TrendingUp} label="Rentabilidad bruta" value={`${result.grossYield}%`} />
        <ResultCard icon={TrendingUp} label="Rentabilidad neta" value={`${result.netYield}%`} highlight />
        <ResultCard icon={TrendingUp} label="ROI" value={`${result.roi}%`} />
        <ResultCard icon={DollarSign} label="Ingreso neto mensual" value={`${result.monthlyNetIncome.toLocaleString("es-ES")} €`} />
        <ResultCard icon={Clock} label="Payback" value={result.paybackYears === Infinity ? "N/A" : `${result.paybackYears} años`} />
      </div>
    </div>
  );
};

export default InvestmentCalculator;

import { Info, TrendingUp } from "lucide-react";

/**
 * InvestorDashboard — placeholder until wired to real npl_assets data.
 */
const InvestorDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-6 h-6 text-accent" />
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground mb-2">Dashboard de Inversión</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Este módulo se está conectando con los datos reales del catálogo de activos.
          Próximamente podrás ver scoring, distribución por tipo y top oportunidades basados en datos actualizados.
        </p>
      </div>
    </div>
  );
};

export default InvestorDashboard;

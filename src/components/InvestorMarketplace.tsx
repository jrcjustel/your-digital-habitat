import { Building2, Landmark, Package, FileText, Gavel, Users, TreePine, Map, Target } from "lucide-react";

const assets = [
  { icon: Building2, label: "Obra Parada (WIP)", href: "#obra-parada" },
  { icon: Landmark, label: "Edificios", href: "#edificios" },
  { icon: Package, label: "Grandes Lotes", href: "#lotes" },
  { icon: FileText, label: "NPL (Deuda)", href: "#npl" },
  { icon: Gavel, label: "Cesiones de Remate", href: "#cdr" },
  { icon: Users, label: "Activos Ocupados", href: "#ocupados" },
  { icon: TreePine, label: "Suelo Rústico", href: "#rustico" },
  { icon: Map, label: "Suelo Urbanizable", href: "#urbanizable" },
  { icon: Target, label: "Suelo Finalista", href: "#finalista" },
];

const InvestorMarketplace = () => {
  return (
    <section className="py-16 md:py-20 bg-secondary" id="marketplace">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="section-label">Marketplace de Inversión</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3">
            Para inversores exigentes. Alta rentabilidad
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <a
              key={asset.label}
              href={asset.href}
              className="flex items-center gap-4 bg-card rounded-xl p-5 card-elevated group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <asset.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <span className="font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                {asset.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestorMarketplace;

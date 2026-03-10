import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, HardHat, Landmark, Briefcase, Wrench, Building2 } from "lucide-react";

const categories = [
  { label: "Abogados", icon: Scale, description: "Especialistas en derecho inmobiliario, hipotecario y procesal", count: "Próximamente" },
  { label: "Procuradores", icon: Landmark, description: "Representación procesal en subastas y ejecuciones", count: "Próximamente" },
  { label: "Reformistas", icon: HardHat, description: "Empresas de reforma y rehabilitación de inmuebles", count: "Próximamente" },
  { label: "Financieras", icon: Briefcase, description: "Entidades de financiación alternativa y bridge loans", count: "Próximamente" },
  { label: "Tasadores", icon: Building2, description: "Sociedades de tasación homologadas por Banco de España", count: "Próximamente" },
  { label: "Mantenimiento", icon: Wrench, description: "Servicios de mantenimiento, limpieza y gestión de activos", count: "Próximamente" },
];

const MarketplacePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Directorio de Proveedores | IKESA"
        description="Encuentra los mejores profesionales para tu inversión inmobiliaria: abogados, procuradores, reformistas, financieras y más."
        canonical="/marketplace"
      />
      <Navbar />

      <div className="border-b bg-gradient-to-b from-accent/5 to-background">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
              <Briefcase className="h-5 w-5 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading">Directorio de Proveedores</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Red de profesionales verificados para cada fase de tu inversión inmobiliaria: desde el análisis legal hasta la reforma y puesta en valor.
          </p>
          <Badge variant="outline" className="mt-4 px-3 py-1.5 text-sm">En desarrollo</Badge>
        </div>
      </div>

      <main className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Card key={cat.label} className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 shrink-0">
                  <cat.icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                  <Badge variant="secondary" className="mt-3 text-xs">{cat.count}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MarketplacePage;

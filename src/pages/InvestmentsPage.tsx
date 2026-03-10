import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, TrendingUp, Filter, Search, Heart, Eye, ArrowUpRight, Briefcase } from "lucide-react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const investments = [
  { id: "1", title: "Torre Empresarial Centro", location: "Madrid, Centro", price: 2500000, type: "NPL", yield: 14.2, area: 850, description: "Edificio de oficinas en zona prime" },
  { id: "2", title: "Residencial Las Rozas", location: "Las Rozas, Madrid", price: 1800000, type: "CDR", yield: 11.8, area: 1200, description: "Complejo residencial con alto potencial" },
  { id: "3", title: "Local Comercial Gran Vía", location: "Madrid, Gran Vía", price: 3200000, type: "VSP", yield: 16.5, area: 650, description: "Local en ubicación estratégica" },
  { id: "4", title: "Oficinas Distrito 22@", location: "Barcelona, Poblenou", price: 2800000, type: "Subasta BOE", yield: 13.5, area: 950, description: "Oficinas modernas en distrito tecnológico" },
  { id: "5", title: "Nave Industrial Valencia", location: "Valencia, Sagunto", price: 1200000, type: "Bancaria", yield: 15.2, area: 2200, description: "Nave con excelente conectividad logística" },
  { id: "6", title: "Hotel Boutique Sevilla", location: "Sevilla, Casco Histórico", price: 4500000, type: "Judicial", yield: 12.8, area: 1800, description: "Hotel boutique en ubicación privilegiada" },
];

const fmt = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n);
const typeColors: Record<string, string> = { NPL: 'bg-red-100 text-red-800', CDR: 'bg-blue-100 text-blue-800', VSP: 'bg-green-100 text-green-800', 'Subasta BOE': 'bg-purple-100 text-purple-800', Bancaria: 'bg-orange-100 text-orange-800', Judicial: 'bg-cyan-100 text-cyan-800' };

const InvestmentsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">Oportunidades de Inversión</h1><p className="text-muted-foreground">Explora las mejores oportunidades inmobiliarias disponibles</p></div>
        <div className="flex gap-2"><Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filtros</Button><Button><Briefcase className="mr-2 h-4 w-4" />Mi Portafolio</Button></div>
      </div>

      <div className="relative max-w-lg"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Buscar por ubicación, tipo, referencia..." className="pl-10" /></div>

      <div className="grid gap-4 md:grid-cols-4">
        {[{ label: 'Total', value: investments.length.toString(), sub: 'Oportunidades activas' }, { label: 'Valor Total', value: fmt(investments.reduce((s, i) => s + i.price, 0)), sub: 'En oportunidades' }, { label: 'Rentabilidad Media', value: `${(investments.reduce((s, i) => s + i.yield, 0) / investments.length).toFixed(1)}%`, sub: 'Yield promedio' }, { label: 'Superficie', value: `${investments.reduce((s, i) => s + i.area, 0).toLocaleString()} m²`, sub: 'Área disponible' }].map((s, i) => (
          <Card key={i}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{s.label}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{s.value}</div><p className="text-xs text-muted-foreground">{s.sub}</p></CardContent></Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {investments.map(inv => (
          <Card key={inv.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
            <div className="aspect-[4/3] bg-muted relative"><div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" /><div className="absolute top-4 left-4"><Badge className={`text-xs font-medium ${typeColors[inv.type] || 'bg-gray-100'}`}>{inv.type}</Badge></div><div className="absolute bottom-4 left-4 text-white"><p className="text-lg font-bold">{fmt(inv.price)}</p></div></div>
            <CardHeader className="pb-4"><CardTitle className="text-lg group-hover:text-primary transition-colors">{inv.title}</CardTitle><div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{inv.location}</div></CardHeader>
            <CardContent className="space-y-4"><p className="text-sm text-muted-foreground">{inv.description}</p>
              <div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-muted-foreground">Rentabilidad</p><p className="text-lg font-bold text-green-600">{inv.yield}%</p></div><div><p className="text-sm text-muted-foreground">Superficie</p><p className="text-lg font-bold">{inv.area} m²</p></div></div>
              <Button className="w-full">Ver Detalles<ArrowUpRight className="ml-2 h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default InvestmentsPage;

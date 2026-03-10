import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, FileText, Clock, AlertTriangle, CheckCircle, Gavel, Calendar } from "lucide-react";

const mockDemands = [
  { id: 1, ref: "EH-2024/001", type: "Ejecución Hipotecaria", court: "Juzgado 1ª Instancia nº3 Madrid", stage: "Subasta señalada", date: "2024-04-15", amount: 285000, asset: "IKE-901", priority: "alta" },
  { id: 2, ref: "EH-2024/002", type: "Ejecución Hipotecaria", court: "Juzgado Mercantil nº2 Barcelona", stage: "Demanda presentada", date: "2024-03-20", amount: 420000, asset: "IKE-902", priority: "media" },
  { id: 3, ref: "MON-2024/001", type: "Monitorio", court: "Juzgado 1ª Instancia nº1 Valencia", stage: "Requerimiento", date: "2024-02-28", amount: 95000, asset: "IKE-905", priority: "baja" },
  { id: 4, ref: "EH-2024/003", type: "Ejecución Hipotecaria", court: "Juzgado 1ª Instancia nº5 Málaga", stage: "Cesión remate aprobada", date: "2024-01-10", amount: 150000, asset: "IKE-906", priority: "alta" },
];

const LegalDemandsPage = () => {
  const fmt = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Demandas y Procedimientos | IKESA Admin" description="Seguimiento de demandas judiciales y procedimientos legales" canonical="/admin/demandas" />
      <Navbar />
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2"><Scale className="h-8 w-8 text-primary" /><h1 className="text-4xl font-bold font-heading">Procedimientos Judiciales</h1></div>
          <p className="text-xl text-muted-foreground">Seguimiento de demandas, ejecuciones y procedimientos legales</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Procedimientos Activos", value: "23", icon: Gavel },
            { label: "Subastas Próximas", value: "5", icon: Calendar },
            { label: "Pendientes Resolución", value: "8", icon: Clock },
            { label: "Resueltos Este Mes", value: "3", icon: CheckCircle },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 flex items-center gap-4"><s.icon className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></CardContent></Card>
          ))}
        </div>

        <div className="space-y-3">
          {mockDemands.map(d => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Gavel className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{d.ref} — {d.type}</p>
                    <p className="text-sm text-muted-foreground">{d.court}</p>
                    <div className="flex items-center gap-2 mt-1"><Badge variant="outline">{d.asset}</Badge><span className="text-xs text-muted-foreground"><Calendar className="h-3 w-3 inline mr-1" />{d.date}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{fmt(d.amount)}</p>
                    <Badge variant={d.priority === "alta" ? "destructive" : d.priority === "media" ? "default" : "secondary"}>{d.stage}</Badge>
                  </div>
                  <Button variant="outline" size="sm">Ver detalle</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LegalDemandsPage;

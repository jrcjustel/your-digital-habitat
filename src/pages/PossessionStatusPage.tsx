import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Key, AlertTriangle, CheckCircle, Clock, Scale, FileText, Shield } from "lucide-react";

const mockAssets = [
  { ref: "IKE-901", title: "Piso Salamanca", location: "Madrid", status: "Ocupado - Con título", judicial: "Demanda presentada", date: "2024-03-15" },
  { ref: "IKE-904", title: "Chalet Alicante", location: "Alicante", status: "Libre", judicial: "N/A", date: "2024-02-28" },
  { ref: "IKE-906", title: "Terreno Málaga", location: "Málaga", status: "Ocupado - Sin título", judicial: "Pendiente desahucio", date: "2024-01-10" },
];

const PossessionStatusPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Estado Posesorio | IKESA" description="Consulta el estado de posesión de los activos" canonical="/estado-posesorio" />
      <Navbar />
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2"><Key className="h-8 w-8 text-primary" /><h1 className="text-4xl font-bold font-heading">Estado Posesorio</h1></div>
          <p className="text-xl text-muted-foreground">Información sobre el estado de posesión y situación judicial de los activos</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Libres", value: "45", icon: CheckCircle, color: "text-primary" },
            { label: "Ocupados con título", value: "23", icon: AlertTriangle, color: "text-yellow-500" },
            { label: "Ocupados sin título", value: "12", icon: Shield, color: "text-destructive" },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 flex items-center gap-4"><s.icon className={`h-8 w-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></CardContent></Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Activos por Estado Posesorio</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {mockAssets.map(a => (
              <div key={a.ref} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <Home className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{a.ref} — {a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={a.status.includes("Libre") ? "default" : a.status.includes("Sin") ? "destructive" : "secondary"}>{a.status}</Badge>
                  {a.judicial !== "N/A" && <Badge variant="outline"><Scale className="h-3 w-3 mr-1 inline" />{a.judicial}</Badge>}
                  <span className="text-xs text-muted-foreground">{a.date}</span>
                  <Button variant="outline" size="sm">Ver detalle</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="h-5 w-5" />Nota informativa</h3>
            <p className="text-sm text-muted-foreground">El estado posesorio indica si el inmueble se encuentra libre u ocupado. En caso de ocupación, se distingue entre ocupantes con título legítimo (arrendatarios con contrato vigente) y ocupantes sin título. La situación judicial refleja las acciones legales en curso para recuperar la posesión.</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default PossessionStatusPage;

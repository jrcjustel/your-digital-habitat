import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Shield, Cpu, Database, CheckCircle, AlertTriangle, XCircle, Clock, Server, Wifi } from "lucide-react";

const services = [
  { name: "Base de Datos", status: "ok", latency: "12ms", uptime: "99.98%", icon: Database },
  { name: "Autenticación", status: "ok", latency: "45ms", uptime: "99.99%", icon: Shield },
  { name: "Edge Functions", status: "warning", latency: "230ms", uptime: "99.5%", icon: Cpu },
  { name: "Storage", status: "ok", latency: "89ms", uptime: "99.97%", icon: Server },
  { name: "Realtime", status: "ok", latency: "5ms", uptime: "99.95%", icon: Wifi },
  { name: "IA / LLM", status: "ok", latency: "1.2s", uptime: "99.8%", icon: Activity },
];

const statusIcon = (s: string) => s === "ok" ? <CheckCircle className="h-5 w-5 text-primary" /> : s === "warning" ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> : <XCircle className="h-5 w-5 text-destructive" />;

const SystemMonitoringPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Monitoreo del Sistema | IKESA Admin" description="Centro de monitoreo de seguridad y rendimiento" canonical="/admin/monitoreo" />
      <Navbar />
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2"><Activity className="h-8 w-8 text-primary" /><h1 className="text-4xl font-bold font-heading">Centro de Monitoreo</h1></div>
          <p className="text-xl text-muted-foreground">Supervisión en tiempo real de todos los servicios</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Estado General", value: "Operativo", icon: CheckCircle, color: "text-primary" },
            { label: "Tiempo activo", value: "99.97%", icon: Clock, color: "text-primary" },
            { label: "Alertas Activas", value: "1", icon: AlertTriangle, color: "text-yellow-500" },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 flex items-center gap-4"><s.icon className={`h-8 w-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></CardContent></Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Estado de Servicios</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services.map(s => (
                <div key={s.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {statusIcon(s.status)}
                    <s.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div><span className="text-muted-foreground">Latencia:</span> <span className="font-medium">{s.latency}</span></div>
                    <div><span className="text-muted-foreground">Uptime:</span> <span className="font-medium">{s.uptime}</span></div>
                    <Badge variant={s.status === "ok" ? "default" : "secondary"}>{s.status === "ok" ? "Operativo" : "Degradado"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default SystemMonitoringPage;

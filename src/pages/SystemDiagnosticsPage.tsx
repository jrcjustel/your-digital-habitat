import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Shield, CheckCircle, AlertTriangle, Server, Database, Cpu } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const services = [
  { name: 'Base de Datos', status: 'ok', latency: '12ms', icon: Database },
  { name: 'API Gateway', status: 'ok', latency: '45ms', icon: Server },
  { name: 'Edge Functions', status: 'ok', latency: '120ms', icon: Cpu },
  { name: 'Almacenamiento', status: 'ok', latency: '35ms', icon: Database },
  { name: 'Autenticación', status: 'ok', latency: '80ms', icon: Shield },
];

const SystemDiagnosticsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Diagnóstico del Sistema</h1>
        <p className="text-muted-foreground">Monitoreo, diagnóstico y resolución de problemas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Estado General</p><p className="text-2xl font-bold text-green-500">Operativo</p></div><CheckCircle className="h-8 w-8 text-green-500" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Uptime</p><p className="text-2xl font-bold">99.9%</p></div><Activity className="h-8 w-8 text-primary" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Alertas Activas</p><p className="text-2xl font-bold text-green-500">0</p></div><AlertTriangle className="h-8 w-8 text-green-500" /></div></CardContent></Card>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health">Estado de Servicios</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="logs">Logs del Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="mt-6">
          <Card><CardHeader><CardTitle>Servicios del Sistema</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {services.map(s => (
                <div key={s.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3"><s.icon className="h-5 w-5 text-primary" /><span className="font-medium">{s.name}</span></div>
                  <div className="flex items-center gap-3"><Badge variant="outline">{s.latency}</Badge><Badge variant="default" className="bg-green-500">OK</Badge></div>
                </div>
              ))}
            </div></CardContent></Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card><CardContent className="p-6 text-center py-12"><Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Métricas de rendimiento en desarrollo</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card><CardContent className="p-6"><pre className="bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-96">
            {`[2026-03-10 08:00:01] INFO  Sistema iniciado correctamente
[2026-03-10 08:00:02] INFO  Base de datos conectada (12ms)
[2026-03-10 08:00:03] INFO  Edge Functions desplegadas
[2026-03-10 08:00:04] INFO  Todos los servicios operativos
[2026-03-10 08:05:00] INFO  Health check: OK
[2026-03-10 08:10:00] INFO  Health check: OK`}
          </pre></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
    <Footer />
  </div>
);

export default SystemDiagnosticsPage;

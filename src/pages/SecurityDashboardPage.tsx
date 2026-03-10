import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Activity, Target, TrendingUp, Eye, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SecurityDashboardPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Centro de Seguridad IKESA</h1><p className="text-muted-foreground">Monitoreo avanzado y protección del sistema</p></div>
        <Badge variant="default" className="text-sm"><Shield className="h-3 w-3 mr-1" />SISTEMA SEGURO</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{ label: 'Estado', value: 'SEGURO', icon: Shield, color: 'text-green-500' }, { label: 'Amenazas Detectadas', value: '0', icon: Target, color: 'text-orange-500' }, { label: 'Incidencias', value: '0', icon: TrendingUp, color: 'text-red-500' }, { label: 'Protección', value: '99.8%', icon: Eye, color: 'text-green-500' }].map((s, i) => (
          <Card key={i}><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div><s.icon className={`h-8 w-8 ${s.color}`} /></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="threats">Amenazas</TabsTrigger>
          <TabsTrigger value="protection">Protección</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Card><CardContent className="p-6">
          <div className="space-y-4">
            {['Firewall activo', 'SSL/TLS configurado', 'Backups automáticos', 'Monitoreo 24/7', 'RGPD compliance'].map(item => (
              <div key={item} className="flex items-center gap-3 p-3 border rounded-lg"><CheckCircle className="h-5 w-5 text-green-500" /><span className="font-medium">{item}</span><Badge variant="outline" className="ml-auto">OK</Badge></div>
            ))}
          </div>
        </CardContent></Card></TabsContent>
        <TabsContent value="threats"><Card><CardContent className="p-6 text-center py-12"><Shield className="h-12 w-12 text-green-500 mx-auto mb-4" /><p className="text-lg font-semibold text-green-600">No se detectaron amenazas</p><p className="text-muted-foreground">El sistema está protegido y funcionando correctamente</p></CardContent></Card></TabsContent>
        <TabsContent value="protection"><Card><CardContent className="p-6 text-center py-12"><Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Panel de protección avanzada en desarrollo</p></CardContent></Card></TabsContent>
      </Tabs>
    </div>
    <Footer />
  </div>
);

export default SecurityDashboardPage;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, PieChart, BarChart3, Wallet, Building, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const portfolioAssets = [
  { id: '1', name: 'Torre Centro Madrid', type: 'Comercial', invested: 250000, currentValue: 310000, yield: 24, status: 'active' },
  { id: '2', name: 'Residencial Eixample', type: 'Residencial', invested: 180000, currentValue: 195000, yield: 8.3, status: 'active' },
  { id: '3', name: 'Nave Industrial Valencia', type: 'Industrial', invested: 120000, currentValue: 155000, yield: 29.2, status: 'completed' },
];

const fmt = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n);

const PortfolioManagementPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold">Gestión de Cartera Inmobiliaria</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Sistema profesional de gestión y análisis de carteras de inversión inmobiliaria</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {[{ label: 'Valor Total', value: fmt(portfolioAssets.reduce((s, a) => s + a.currentValue, 0)), icon: Wallet, color: 'text-primary' },
          { label: 'Inversión Total', value: fmt(portfolioAssets.reduce((s, a) => s + a.invested, 0)), icon: Building, color: 'text-blue-600' },
          { label: 'Ganancia', value: fmt(portfolioAssets.reduce((s, a) => s + (a.currentValue - a.invested), 0)), icon: TrendingUp, color: 'text-green-600' },
          { label: 'Activos', value: portfolioAssets.length.toString(), icon: PieChart, color: 'text-purple-600' },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div><s.icon className={`h-8 w-8 ${s.color}`} /></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="assets">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assets">Activos</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4 mt-6">
          {portfolioAssets.map(asset => (
            <Card key={asset.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{asset.name}</h3>
                    <div className="flex items-center gap-2 mt-1"><Badge variant="outline">{asset.type}</Badge><Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>{asset.status === 'active' ? 'Activo' : 'Completado'}</Badge></div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-lg font-bold">{fmt(asset.currentValue)}</p>
                    <p className="text-sm text-green-600 font-medium">+{asset.yield}%</p>
                    <p className="text-xs text-muted-foreground">Inversión: {fmt(asset.invested)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card><CardContent className="p-6 text-center py-12"><BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Gráficos de rendimiento en desarrollo</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <Card><CardContent className="p-6 text-center py-12"><TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Análisis avanzado de cartera en desarrollo</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
    <Footer />
  </div>
);

export default PortfolioManagementPage;

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Globe, Target, Eye, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const metrics = [
  { label: 'Activos Publicados', value: '1,247', change: '+12%', icon: Globe },
  { label: 'Visitas Mensuales', value: '45.2K', change: '+23%', icon: Eye },
  { label: 'Inversores Registrados', value: '3,890', change: '+8%', icon: Users },
  { label: 'Operaciones Cerradas', value: '156', change: '+15%', icon: Target },
  { label: 'Volumen Transaccionado', value: '€127M', change: '+31%', icon: TrendingUp },
  { label: 'Rentabilidad Media', value: '16.5%', change: '+2.3pp', icon: BarChart3 },
];

const PublicMetricsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Métricas Públicas IKESA</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Transparencia total: datos en tiempo real sobre el rendimiento de la plataforma</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map(m => (
          <Card key={m.label} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <m.icon className="h-8 w-8 text-primary" />
                <Badge variant="outline" className="text-green-600"><ArrowUpRight className="h-3 w-3 mr-1" />{m.change}</Badge>
              </div>
              <p className="text-3xl font-bold">{m.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto"><CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-4">Transparencia y Confianza</h2>
          <p className="text-muted-foreground mb-6">En IKESA creemos que la transparencia es fundamental. Publicamos nuestras métricas para que inversores y partners puedan evaluar el rendimiento de la plataforma.</p>
          <Button size="lg">Solicitar Informe Detallado</Button>
        </CardContent></Card>
      </div>
    </div>
    <Footer />
  </div>
);

export default PublicMetricsPage;

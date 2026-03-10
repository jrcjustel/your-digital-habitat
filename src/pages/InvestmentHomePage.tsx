import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Search, Calculator, Brain, MapPin, Gavel, BarChart3, Zap } from 'lucide-react';

const InvestmentHomePage = () => (
  <div className="min-h-screen bg-background">
    <SEOHead title="Centro de Inversión | IKESA" description="Tu hub de inversión inmobiliaria con herramientas avanzadas" canonical="/inversion" />
    <Navbar />
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-16">
      <div className="container mx-auto px-4 text-center space-y-4">
        <Badge className="mb-4"><Zap className="h-3 w-3 mr-1" />Hub de Inversión</Badge>
        <h1 className="text-4xl md:text-5xl font-bold font-heading">Centro de Inversión IKESA</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Todas las herramientas que necesitas para invertir en inmuebles con confianza</p>
      </div>
    </div>
    <main className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { icon: Search, title: 'Marketplace', desc: 'Explora oportunidades de inversión con filtros avanzados', href: '/marketplace', color: 'text-blue-600' },
          { icon: Gavel, title: 'Subastas', desc: 'Subastas activas con análisis de rentabilidad en tiempo real', href: '/subastas', color: 'text-red-600' },
          { icon: MapPin, title: 'Mapa Interactivo', desc: 'Visualiza propiedades en el mapa con filtros dinámicos', href: '/mapa', color: 'text-green-600' },
          { icon: Calculator, title: 'Calculadoras', desc: 'Simula hipotecas, rentabilidad y comparación de escenarios', href: '/calculadoras', color: 'text-purple-600' },
          { icon: Brain, title: 'Valoración IA', desc: 'Motor de valoración avanzado multi-algoritmo', href: '/valoracion-avanzada', color: 'text-orange-600' },
          { icon: BarChart3, title: 'Análisis Predictivo', desc: 'Predicciones de mercado basadas en inteligencia artificial', href: '/analitica-predictiva', color: 'text-indigo-600' },
          { icon: TrendingUp, title: 'Insights IA', desc: 'Dashboard de inteligencia artificial con alertas y oportunidades', href: '/ai-insights', color: 'text-emerald-600' },
          { icon: Search, title: 'Analizador Excel', desc: 'Sube archivos Excel y mapea columnas con IA', href: '/excel-analyzer', color: 'text-pink-600' },
        ].map(item => (
          <Link key={item.title} to={item.href}>
            <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02]">
              <CardHeader>
                <item.icon className={`h-8 w-8 ${item.color} mb-2`} />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
              <CardContent><Button variant="outline" className="w-full">Acceder</Button></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default InvestmentHomePage;

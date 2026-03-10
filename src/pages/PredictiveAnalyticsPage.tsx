import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, BarChart3, MapPin, Lightbulb, AlertTriangle, CheckCircle, Activity, Zap } from 'lucide-react';

interface MarketPrediction { region: string; currentPrice: number; predicted6M: number; predicted1Y: number; predicted3Y: number; confidence: number; trend: 'bullish' | 'bearish' | 'stable'; factors: string[]; }

const predictions: MarketPrediction[] = [
  { region: 'Madrid', currentPrice: 3450, predicted6M: 3580, predicted1Y: 3720, predicted3Y: 4150, confidence: 87, trend: 'bullish', factors: ['Crecimiento económico', 'Nuevas infraestructuras', 'Demanda internacional'] },
  { region: 'Barcelona', currentPrice: 3200, predicted6M: 3280, predicted1Y: 3420, predicted3Y: 3850, confidence: 82, trend: 'bullish', factors: ['Recuperación turística', 'Inversión tecnológica'] },
  { region: 'Valencia', currentPrice: 2100, predicted6M: 2200, predicted1Y: 2350, predicted3Y: 2800, confidence: 79, trend: 'bullish', factors: ['Inversión extranjera', 'Calidad de vida', 'Precios competitivos'] },
  { region: 'Málaga', currentPrice: 2800, predicted6M: 2900, predicted1Y: 3050, predicted3Y: 3500, confidence: 75, trend: 'bullish', factors: ['Boom tecnológico', 'Nómadas digitales'] },
];

const PredictiveAnalyticsPage = () => {
  const [selectedRegion, setSelectedRegion] = useState('Madrid');
  const selected = predictions.find(p => p.region === selectedRegion) || predictions[0];
  const getTrendIcon = (trend: string) => { switch (trend) { case 'bullish': return <TrendingUp className="h-4 w-4 text-green-500" />; case 'bearish': return <TrendingDown className="h-4 w-4 text-red-500" />; default: return <Activity className="h-4 w-4 text-blue-500" />; } };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Análisis Predictivo | IKESA" description="IA aplicada al mercado inmobiliario español" canonical="/analitica-predictiva" />
      <Navbar />
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4"><Zap className="h-8 w-8 text-primary" /><h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight">Análisis Predictivo</h1></div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Inteligencia artificial aplicada al mercado inmobiliario español</p>
        </div>
      </div>
      <main className="container mx-auto px-4 py-12">
        <Tabs defaultValue="predictions" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="predictions">Predicciones de Mercado</TabsTrigger><TabsTrigger value="insights">Insights Avanzados</TabsTrigger></TabsList>
          <TabsContent value="predictions" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1"><CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Seleccionar Región</CardTitle></CardHeader><CardContent className="space-y-3">
                {predictions.map(p => (<Button key={p.region} variant={selectedRegion === p.region ? "default" : "outline"} className="w-full justify-between" onClick={() => setSelectedRegion(p.region)}><span>{p.region}</span><div className="flex items-center gap-1">{getTrendIcon(p.trend)}<span className="text-xs">{p.confidence}%</span></div></Button>))}
              </CardContent></Card>
              <Card className="lg:col-span-2"><CardHeader><CardTitle className="flex items-center justify-between"><span className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Evolución — {selectedRegion}</span><Badge>{getTrendIcon(selected.trend)} Confianza: {selected.confidence}%</Badge></CardTitle></CardHeader><CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center"><p className="text-sm text-muted-foreground">Actual</p><p className="text-lg font-bold text-primary">{selected.currentPrice.toLocaleString()}€/m²</p></div>
                  <div className="text-center"><p className="text-sm text-muted-foreground">6 Meses</p><p className="text-lg font-bold text-green-500">{selected.predicted6M.toLocaleString()}€</p></div>
                  <div className="text-center"><p className="text-sm text-muted-foreground">1 Año</p><p className="text-lg font-bold text-blue-500">{selected.predicted1Y.toLocaleString()}€</p></div>
                  <div className="text-center"><p className="text-sm text-muted-foreground">3 Años</p><p className="text-lg font-bold text-purple-500">{selected.predicted3Y.toLocaleString()}€</p></div>
                </div>
              </CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" />Factores Clave — {selectedRegion}</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-3 gap-4">{selected.factors.map((f, i) => <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"><CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /><span className="text-sm font-medium">{f}</span></div>)}</div></CardContent></Card>
          </TabsContent>
          <TabsContent value="insights" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-green-500"><CardHeader><CardTitle className="flex items-center gap-2 text-green-500"><TrendingUp className="h-5 w-5" />Oportunidad Detectada</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-3">Algoritmo híbrido detecta crecimiento del 18-25% en Madrid Norte para los próximos 24 meses.</p><Button size="sm" variant="outline">Ver Análisis</Button></CardContent></Card>
              <Card className="border-l-4 border-l-yellow-500"><CardHeader><CardTitle className="flex items-center gap-2 text-yellow-500"><AlertTriangle className="h-5 w-5" />Alerta de Mercado</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-3">Saturación detectada: precaución en oficinas Barcelona Centro durante 2026.</p><Button size="sm" variant="outline">Ver Detalles</Button></CardContent></Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default PredictiveAnalyticsPage;

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, AlertTriangle, Target, Users, BarChart3 } from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'legal_risk' | 'lead_opportunity' | 'market_trend' | 'performance';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
}

const mockInsights: AIInsight[] = [
  { id: '1', type: 'legal_risk', title: 'Riesgo Legal Elevado Detectado', description: '3 propiedades presentan patrones de riesgo similares a casos problemáticos anteriores', confidence: 87, priority: 'high', metadata: { affected_properties: 3, risk_factors: ['ocupación', 'cargas'] } },
  { id: '2', type: 'lead_opportunity', title: 'Leads de Alta Conversión Identificados', description: '5 leads muestran patrones de comportamiento de inversores exitosos', confidence: 92, priority: 'high', metadata: { conversion_probability: 85, estimated_value: 750000 } },
  { id: '3', type: 'market_trend', title: 'Oportunidad de Mercado en Madrid Centro', description: 'Los precios en Chamberí están 15% por debajo del valor de mercado predicho', confidence: 78, priority: 'medium', metadata: { location: 'Chamberí, Madrid', discount: 15, properties_available: 12 } },
  { id: '4', type: 'performance', title: 'Mejora en Conversión de Leads', description: 'La tasa de conversión ha aumentado 23% tras implementar seguimiento automatizado', confidence: 95, priority: 'low', metadata: { improvement: 23, period: '30 días' } },
];

const AIInsightsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const getPriorityColor = (priority: string) => {
    switch (priority) { case 'critical': case 'high': return 'destructive'; case 'medium': return 'default'; default: return 'secondary'; }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) { case 'legal_risk': return <AlertTriangle className="h-4 w-4" />; case 'lead_opportunity': return <Target className="h-4 w-4" />; case 'market_trend': return <TrendingUp className="h-4 w-4" />; case 'performance': return <BarChart3 className="h-4 w-4" />; default: return <Brain className="h-4 w-4" />; }
  };

  const filterByType = (type: string) => mockInsights.filter(i => i.type === type);
  const avgConfidence = Math.round(mockInsights.reduce((s, i) => s + i.confidence, 0) / mockInsights.length);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Insights IA | IKESA" description="Dashboard de inteligencia artificial para inversión inmobiliaria" canonical="/ai-insights" />
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-heading flex items-center justify-center gap-2"><Brain className="h-8 w-8 text-primary" />Insights de Inteligencia Artificial</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Análisis automatizado de patrones y oportunidades detectadas en tiempo real</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Puntuación IA</CardTitle><Brain className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{avgConfidence}%</div><Progress value={avgConfidence} className="mt-2" /></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Riesgos Críticos</CardTitle><AlertTriangle className="h-4 w-4 text-destructive" /></CardHeader><CardContent><div className="text-2xl font-bold">{mockInsights.filter(i => i.priority === 'critical' || i.priority === 'high').length}</div><p className="text-xs text-muted-foreground">Requieren atención</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Oportunidades</CardTitle><Target className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold">{filterByType('lead_opportunity').length + filterByType('market_trend').length}</div><p className="text-xs text-muted-foreground">Identificadas por IA</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Confianza Media</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{avgConfidence}%</div><p className="text-xs text-muted-foreground">En predicciones IA</p></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="market">Mercado</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />Insights Principales</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {mockInsights.map((insight) => (
                  <Alert key={insight.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">{getPriorityIcon(insight.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <div className="flex items-center gap-2"><Badge variant={getPriorityColor(insight.priority) as any}>{insight.priority}</Badge><span className="text-sm text-muted-foreground">{insight.confidence}%</span></div>
                      </div>
                      <AlertDescription>{insight.description}</AlertDescription>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="legal"><Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Riesgos Legales</CardTitle></CardHeader><CardContent className="space-y-4">{filterByType('legal_risk').map(i => <Alert key={i.id}><AlertTriangle className="h-4 w-4" /><div><h4 className="font-medium">{i.title}</h4><AlertDescription>{i.description}</AlertDescription><Progress value={i.confidence} className="w-full mt-2" /></div></Alert>)}</CardContent></Card></TabsContent>
          <TabsContent value="leads"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Inteligencia de Leads</CardTitle></CardHeader><CardContent className="space-y-4">{filterByType('lead_opportunity').map(i => <Alert key={i.id}><Target className="h-4 w-4" /><div><h4 className="font-medium">{i.title}</h4><AlertDescription>{i.description}</AlertDescription><div className="mt-2 flex justify-between"><Progress value={i.confidence} className="w-2/3" /><Button size="sm" variant="outline">Actuar</Button></div></div></Alert>)}</CardContent></Card></TabsContent>
          <TabsContent value="market"><Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Análisis de Mercado</CardTitle></CardHeader><CardContent className="space-y-4">{filterByType('market_trend').map(i => <Alert key={i.id}><TrendingUp className="h-4 w-4" /><div><h4 className="font-medium">{i.title}</h4><AlertDescription>{i.description}</AlertDescription><Progress value={i.confidence} className="w-full mt-2" /></div></Alert>)}</CardContent></Card></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AIInsightsPage;

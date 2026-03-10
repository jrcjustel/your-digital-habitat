import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const HybridValuationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Valoración Avanzada | IKESA" description="Sistema de valoración líder con IA avanzada y algoritmos híbridos" canonical="/valoracion-avanzada" />
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-heading bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">IKESA Valoración Avanzada 3.0</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Sistema de valoración líder incorporando los mejores algoritmos y metodologías de la industria</p>
        </div>

        <Card className="max-w-4xl mx-auto border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple/5">
          <CardHeader className="text-center"><CardTitle className="flex items-center justify-center gap-2 text-2xl"><Brain className="h-6 w-6 text-primary" />Motor de Valoración Multi-Algoritmo</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
              {[{ label: 'Comparables IA', color: 'text-green-600' }, { label: 'Machine Learning', color: 'text-blue-600' }, { label: 'Análisis Híbrido', color: 'text-purple-600' }, { label: 'Forecasting', color: 'text-orange-600' }].map(f => (
                <div key={f.label} className="space-y-2 p-3 bg-card rounded-lg border"><CheckCircle2 className={`h-6 w-6 mx-auto ${f.color}`} /><div className="font-medium">{f.label}</div></div>
              ))}
            </div>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Utiliza nuestro valorador integrado para obtener una valoración profesional de cualquier inmueble en España.</p>
              <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90" onClick={() => navigate('/valorar')}><Zap className="h-5 w-5 mr-2" />Ir al Valorador IKESA</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card><CardContent className="pt-6 text-center"><Badge className="mb-3">ECO/805/2003</Badge><h3 className="font-semibold mb-2">Normativa Oficial</h3><p className="text-sm text-muted-foreground">Metodología basada en el estándar de valoración hipotecaria español</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><Badge className="mb-3" variant="secondary">Triple Precio</Badge><h3 className="font-semibold mb-2">Modelo Avanzado</h3><p className="text-sm text-muted-foreground">Precios Bid, Cierre y Asking para máxima precisión</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><Badge className="mb-3" variant="outline">6+4 Testigos</Badge><h3 className="font-semibold mb-2">Comparables Reales</h3><p className="text-sm text-muted-foreground">6 testigos de venta y 4 de alquiler con distancia y días en mercado</p></CardContent></Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HybridValuationPage;

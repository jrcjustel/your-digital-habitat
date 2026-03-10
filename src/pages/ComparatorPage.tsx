import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Plus, X, MapPin, TrendingUp, Building } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const mockProperties = [
  { id: '1', title: 'Torre Empresarial Centro', location: 'Madrid Centro', price: 2500000, yield: 14.2, area: 850, type: 'Comercial', status: 'NPL', risk: 'Medio' },
  { id: '2', title: 'Edificio Residencial Premium', location: 'Barcelona Eixample', price: 1850000, yield: 16.8, area: 650, type: 'Residencial', status: 'Cesión Remate', risk: 'Bajo' },
  { id: '3', title: 'Complejo Industrial Moderno', location: 'Valencia', price: 3200000, yield: 12.5, area: 1200, type: 'Industrial', status: 'Subasta', risk: 'Alto' },
];

const fmt = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n);

const ComparatorPage = () => {
  const [selected, setSelected] = useState<string[]>(['1', '2']);
  const selectedProps = mockProperties.filter(p => selected.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3"><ArrowLeftRight className="h-8 w-8 text-primary" /> Comparador de Activos</h1>
          <p className="text-xl text-muted-foreground">Compara hasta 3 oportunidades de inversión lado a lado</p>
        </div>

        <div className="flex gap-2 mb-8 justify-center">
          {mockProperties.map(p => (
            <Button key={p.id} variant={selected.includes(p.id) ? "default" : "outline"} size="sm" onClick={() => setSelected(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : prev.length < 3 ? [...prev, p.id] : prev)}>
              {selected.includes(p.id) ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}{p.title}
            </Button>
          ))}
        </div>

        {selectedProps.length >= 2 ? (
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${selectedProps.length}, 1fr)` }}>
            {selectedProps.map(p => (
              <Card key={p.id}>
                <CardHeader><CardTitle className="text-lg">{p.title}</CardTitle><div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3" />{p.location}</div></CardHeader>
                <CardContent className="space-y-4">
                  {[{ label: 'Precio', value: fmt(p.price) }, { label: 'Rentabilidad', value: `${p.yield}%` }, { label: 'Superficie', value: `${p.area} m²` }, { label: 'Tipo', value: p.type }, { label: 'Estado', value: p.status }, { label: 'Riesgo', value: p.risk }].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="font-semibold text-sm">{row.value}</span>
                    </div>
                  ))}
                  <Button className="w-full mt-4">Ver Detalle</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground"><Building className="h-12 w-12 mx-auto mb-4" /><p>Selecciona al menos 2 activos para comparar</p></div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ComparatorPage;

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Map, MapPin, Search, Filter, Eye, Heart, Euro } from 'lucide-react';

interface PropertyMarker { id: string; title: string; price: number; location: string; type: string; status: 'available' | 'sold' | 'reserved'; yield?: number; surface?: number; }

const mockProperties: PropertyMarker[] = [
  { id: '1', title: 'Piso en Malasaña', price: 450000, location: 'Malasaña, Madrid', type: 'Piso', status: 'available', yield: 5.8, surface: 85 },
  { id: '2', title: 'Ático en Chamberí', price: 620000, location: 'Chamberí, Madrid', type: 'Ático', status: 'available', yield: 4.2, surface: 120 },
  { id: '3', title: 'Local en Sol', price: 320000, location: 'Sol, Madrid', type: 'Local', status: 'sold', yield: 7.5, surface: 95 },
  { id: '4', title: 'Piso en Retiro', price: 580000, location: 'Retiro, Madrid', type: 'Piso', status: 'reserved', yield: 4.8, surface: 110 },
  { id: '5', title: 'Casa en Las Rozas', price: 750000, location: 'Las Rozas, Madrid', type: 'Casa', status: 'available', yield: 3.2, surface: 180 },
];

const MapPage = () => {
  const [selected, setSelected] = useState<PropertyMarker | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ priceRange: 'all', propertyType: 'all', status: 'all' });

  const filtered = mockProperties.filter(p => {
    const ms = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const mp = filters.priceRange === 'all' || (filters.priceRange === 'low' && p.price < 400000) || (filters.priceRange === 'mid' && p.price >= 400000 && p.price < 600000) || (filters.priceRange === 'high' && p.price >= 600000);
    const mt = filters.propertyType === 'all' || p.type === filters.propertyType;
    const mst = filters.status === 'all' || p.status === filters.status;
    return ms && mp && mt && mst;
  });

  const fmt = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const statusColor = (s: string) => s === 'available' ? 'bg-green-500' : s === 'sold' ? 'bg-red-500' : 'bg-yellow-500';
  const statusText = (s: string) => s === 'available' ? 'Disponible' : s === 'sold' ? 'Vendido' : 'Reservado';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Mapa Interactivo | IKESA" description="Explora propiedades en el mapa" canonical="/mapa" />
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div><h1 className="text-3xl font-bold font-heading flex items-center gap-2"><Map className="h-8 w-8 text-primary" />Mapa Interactivo</h1><p className="text-muted-foreground">Explora propiedades con filtros avanzados</p></div>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Filtros</CardTitle></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <Select value={filters.priceRange} onValueChange={v => setFilters({...filters, priceRange: v})}><SelectTrigger><SelectValue placeholder="Precio" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="low">{"<"}400k€</SelectItem><SelectItem value="mid">400-600k€</SelectItem><SelectItem value="high">{">"}600k€</SelectItem></SelectContent></Select>
          <Select value={filters.propertyType} onValueChange={v => setFilters({...filters, propertyType: v})}><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="Piso">Piso</SelectItem><SelectItem value="Casa">Casa</SelectItem><SelectItem value="Ático">Ático</SelectItem><SelectItem value="Local">Local</SelectItem></SelectContent></Select>
          <Select value={filters.status} onValueChange={v => setFilters({...filters, status: v})}><SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="available">Disponible</SelectItem><SelectItem value="reserved">Reservado</SelectItem><SelectItem value="sold">Vendido</SelectItem></SelectContent></Select>
        </div><p className="text-sm text-muted-foreground mt-2">{filtered.length} de {mockProperties.length} propiedades</p></CardContent></Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[600px]"><CardHeader><CardTitle>Mapa</CardTitle></CardHeader><CardContent className="p-0 relative">
              <div className="w-full h-[500px] bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 relative overflow-hidden rounded-lg">
                {filtered.map((p, i) => (
                  <div key={p.id} className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${selected?.id === p.id ? 'z-20 scale-125' : 'z-10'}`} style={{ left: `${20 + (i * 15) % 60}%`, top: `${20 + (i * 12) % 60}%` }} onClick={() => setSelected(p)}>
                    <div className={`w-6 h-6 rounded-full ${statusColor(p.status)} border-2 border-white shadow-lg flex items-center justify-center`}><MapPin className="h-3 w-3 text-white" /></div>
                  </div>
                ))}
                <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs space-y-1">
                  <h4 className="font-semibold text-sm mb-2">Leyenda</h4>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span>Disponible</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span>Reservado</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Vendido</span></div>
                </div>
              </div>
            </CardContent></Card>
          </div>

          <div className="space-y-4">
            <Card><CardHeader><CardTitle className="text-lg">Propiedades ({filtered.length})</CardTitle></CardHeader><CardContent className="p-0"><div className="max-h-[500px] overflow-y-auto">
              {filtered.map(p => (
                <div key={p.id} className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${selected?.id === p.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`} onClick={() => setSelected(p)}>
                  <div className="flex items-start justify-between"><h4 className="font-semibold text-sm">{p.title}</h4><Badge variant={p.status === 'available' ? 'default' : 'secondary'}>{statusText(p.status)}</Badge></div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{p.location}</p>
                  <div className="flex items-center justify-between mt-2"><span className="font-bold text-primary text-sm">{fmt(p.price)}</span>{p.yield && <Badge variant="outline" className="text-xs">{p.yield}%</Badge>}</div>
                </div>
              ))}
            </div></CardContent></Card>
            {selected && <Card><CardHeader><CardTitle className="text-lg">Detalle</CardTitle></CardHeader><CardContent className="space-y-3">
              <h4 className="font-semibold">{selected.title}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Precio:</span><div className="font-bold text-primary">{fmt(selected.price)}</div></div>
                <div><span className="text-muted-foreground">Estado:</span><div className="font-semibold">{statusText(selected.status)}</div></div>
                {selected.surface && <div><span className="text-muted-foreground">Superficie:</span><div>{selected.surface}m²</div></div>}
                {selected.yield && <div><span className="text-muted-foreground">Rentabilidad:</span><div className="text-green-600 font-semibold">{selected.yield}%</div></div>}
              </div>
              <Button size="sm" className="w-full"><Eye className="h-3 w-3 mr-1" />Ver Detalles</Button>
            </CardContent></Card>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MapPage;

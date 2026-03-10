import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, TrendingDown, Filter, Search, Eye, Maximize } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Asset {
  id: string; tipo_activo: string | null; municipio: string | null; provincia: string | null;
  direccion: string | null; sqm: number | null; precio_orientativo: number | null;
  valor_mercado: number | null; comunidad_autonoma: string | null;
}

const MarketplacePage = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', propertyType: '', province: '' });

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase.from('npl_assets').select('id, tipo_activo, municipio, provincia, direccion, sqm, precio_orientativo, valor_mercado, comunidad_autonoma').eq('publicado', true).limit(50);
      if (error) throw error;
      setAssets((data as unknown as Asset[]) || []);
    } catch { toast.error('Error cargando activos'); } finally { setLoading(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  const filtered = assets.filter(a => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s || (a.municipio?.toLowerCase().includes(s) || a.provincia?.toLowerCase().includes(s) || a.direccion?.toLowerCase().includes(s) || a.tipo_activo?.toLowerCase().includes(s));
    const matchMin = !filters.minPrice || (a.precio_orientativo && a.precio_orientativo >= +filters.minPrice);
    const matchMax = !filters.maxPrice || (a.precio_orientativo && a.precio_orientativo <= +filters.maxPrice);
    const matchType = !filters.propertyType || a.tipo_activo === filters.propertyType;
    const matchProv = !filters.province || a.provincia?.toLowerCase().includes(filters.province.toLowerCase());
    return matchSearch && matchMin && matchMax && matchType && matchProv;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Marketplace de Oportunidades | IKESA" description="Descubre las mejores oportunidades de inversión inmobiliaria" canonical="/marketplace" />
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div><h1 className="text-3xl font-bold font-heading">Marketplace de Oportunidades</h1><p className="text-muted-foreground">Descubre las mejores oportunidades de inversión inmobiliaria con análisis de rentabilidad</p></div>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Filtros</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex gap-4"><Input placeholder="Buscar por ubicación, tipo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1" /><Button><Search className="h-4 w-4 mr-2" />Buscar</Button></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input placeholder="Precio mín. €" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})} />
            <Input placeholder="Precio máx. €" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})} />
            <Select value={filters.propertyType} onValueChange={v => setFilters({...filters, propertyType: v})}><SelectTrigger><SelectValue placeholder="Tipo activo" /></SelectTrigger><SelectContent><SelectItem value="Vivienda">Vivienda</SelectItem><SelectItem value="Local">Local</SelectItem><SelectItem value="Garaje">Garaje</SelectItem><SelectItem value="Terreno">Terreno</SelectItem><SelectItem value="Nave">Nave</SelectItem></SelectContent></Select>
            <Input placeholder="Provincia" value={filters.province} onChange={e => setFilters({...filters, province: e.target.value})} />
          </div>
        </CardContent></Card>

        <p className="text-sm text-muted-foreground">{filtered.length} activos encontrados</p>

        {loading ? <p className="text-center py-8 text-muted-foreground">Cargando marketplace...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(a => {
              const discount = a.valor_mercado && a.precio_orientativo && a.valor_mercado > 0 ? Math.round((1 - a.precio_orientativo / a.valor_mercado) * 100) : null;
              return (
                <Link key={a.id} to={`/npl/${a.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex justify-between items-start"><Badge>{a.tipo_activo || "Activo"}</Badge>{discount && discount > 0 && <Badge variant="secondary" className="text-green-600"><TrendingDown className="h-3 w-3 mr-1" />-{discount}%</Badge>}</div>
                      <h3 className="font-semibold line-clamp-1">{a.tipo_activo} — {a.municipio || "—"}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{a.provincia || "—"}{a.comunidad_autonoma ? `, ${a.comunidad_autonoma}` : ''}</p>
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        {a.precio_orientativo && a.precio_orientativo > 0 && <div className="flex justify-between"><span className="text-sm">Precio orientativo</span><span className="font-bold text-primary">{fmt(a.precio_orientativo)}</span></div>}
                        {a.valor_mercado && a.valor_mercado > 0 && <div className="flex justify-between"><span className="text-sm">Valor de mercado</span><span className="font-medium">{fmt(a.valor_mercado)}</span></div>}
                        {a.sqm && a.sqm > 0 && <div className="flex justify-between"><span className="text-sm flex items-center gap-1"><Maximize className="h-3 w-3" />Superficie</span><span>{a.sqm} m²</span></div>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
        {!loading && filtered.length === 0 && <Card className="p-8 text-center"><Search className="h-12 w-12 mx-auto text-muted-foreground" /><h3 className="text-lg font-semibold mt-4">No se encontraron activos</h3><p className="text-muted-foreground">Prueba ajustando los filtros</p></Card>}
      </main>
      <Footer />
    </div>
  );
};

export default MarketplacePage;

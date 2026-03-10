import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Clock, MapPin, Filter, Gavel, FileText } from 'lucide-react';

const auctionTypes = [
  { id: 'npl', label: 'NPL - Cesión de créditos', description: 'Carteras de créditos morosos de entidades financieras' },
  { id: 'subasta', label: 'Postura en subasta', description: 'Coordina tu oferta en una subasta pública' },
  { id: 'cesion', label: 'Cesión de remate', description: 'Negocia la cesión de remate del inmueble' },
  { id: 'compraventa', label: 'Compraventa', description: 'Inmuebles con o sin posesión' },
];

const mockAuctions = [
  { id: 'IKE-001', title: 'Torre Residencial Salamanca', location: 'Madrid, Salamanca', price: 3200000, status: 'Subasta Activa', auctionType: 'npl', yield: 15.2, endDate: new Date(Date.now() + 2 * 86400000), participants: 12 },
  { id: 'IKE-002', title: 'Local Comercial Eixample', location: 'Barcelona, Eixample', price: 1800000, status: 'Últimas Horas', auctionType: 'cesion', yield: 13.8, endDate: new Date(Date.now() + 6 * 3600000), participants: 8 },
  { id: 'IKE-003', title: 'Edificio Industrial Valencia', location: 'Valencia, Paterna', price: 2100000, status: 'Nuevo', auctionType: 'subasta', yield: 14.5, endDate: new Date(Date.now() + 7 * 86400000), participants: 5 },
];

const AuctionsPage = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState({ type: '', location: '', priceRange: '' });
  const toggleFav = (id: string) => setFavorites(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);

  const formatTime = (d: Date) => {
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return 'Finalizada';
    const days = Math.floor(diff / 86400000); const hrs = Math.floor((diff % 86400000) / 3600000); const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hrs}h`; if (hrs > 0) return `${hrs}h ${mins}m`; return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Subastas Activas | IKESA" description="Oportunidades de inversión inmobiliaria en subasta" canonical="/subastas" />
      <Navbar />
      <div className="border-b bg-card"><div className="container mx-auto px-4 py-8"><div className="flex items-center gap-3 mb-4"><Gavel className="h-8 w-8 text-primary" /><h1 className="text-4xl font-bold font-heading">Subastas Activas</h1></div><p className="text-xl text-muted-foreground max-w-3xl">Oportunidades de inversión inmobiliaria en tiempo real con análisis completo</p></div></div>

      <section className="py-12 bg-muted/30"><div className="container mx-auto px-4"><h2 className="text-3xl font-bold font-heading text-center mb-12">Tipos de Inversión</h2><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">{auctionTypes.map(t => <Card key={t.id} className="hover:shadow-lg transition-all"><CardHeader><CardTitle className="text-lg">{t.label}</CardTitle></CardHeader><CardContent><CardDescription>{t.description}</CardDescription><Button variant="outline" size="sm" className="mt-4 w-full">Ver Subastas</Button></CardContent></Card>)}</div></div></section>

      <section className="py-8 border-b"><div className="container mx-auto px-4"><div className="flex flex-wrap gap-4 items-center"><Filter className="h-5 w-5 text-muted-foreground" /><span className="font-medium">Filtrar:</span>
        <Select value={filters.type} onValueChange={v => setFilters(p => ({...p, type: v}))}><SelectTrigger className="w-[200px]"><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent>{auctionTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent></Select>
        <Select value={filters.location} onValueChange={v => setFilters(p => ({...p, location: v}))}><SelectTrigger className="w-[200px]"><SelectValue placeholder="Ubicación" /></SelectTrigger><SelectContent><SelectItem value="madrid">Madrid</SelectItem><SelectItem value="barcelona">Barcelona</SelectItem><SelectItem value="valencia">Valencia</SelectItem></SelectContent></Select>
      </div></div></section>

      <section className="py-12"><div className="container mx-auto px-4">
        <div className="text-center mb-12"><Badge className="mb-4 bg-destructive/10 text-destructive border-destructive/20">¡Últimos días!</Badge><h2 className="text-3xl font-bold font-heading mb-4">Subastas a punto de concluir</h2></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{mockAuctions.map(a => (
          <Card key={a.id} className="relative overflow-hidden hover:shadow-lg transition-all">
            <div className="absolute top-4 right-4 z-10"><Button variant="ghost" size="sm" className="bg-background/80 backdrop-blur-sm" onClick={() => toggleFav(a.id)}><Heart className={`h-4 w-4 ${favorites.includes(a.id) ? 'fill-primary text-primary' : ''}`} /></Button></div>
            <div className="aspect-video bg-muted relative flex items-center justify-center"><Gavel className="h-12 w-12 text-muted-foreground/30" /><div className="absolute top-4 left-4"><Badge variant={a.status === 'Últimas Horas' ? 'destructive' : 'default'}>{a.status}</Badge></div></div>
            <CardHeader><div className="flex justify-between items-start"><div><CardTitle className="text-lg">{a.title}</CardTitle><div className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" /><span className="text-sm">{a.location}</span></div></div><Badge variant="outline">{a.id}</Badge></div></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Precio base</span><span className="font-semibold">€{a.price.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Rentabilidad</span><span className="font-semibold text-primary">{a.yield}%</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Participantes</span><span className="font-semibold">{a.participants}</span></div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"><Clock className="h-4 w-4 text-destructive" /><span className="text-sm font-medium">Tiempo:</span><span className="text-sm font-bold text-destructive">{formatTime(a.endDate)}</span></div>
              <div className="grid grid-cols-2 gap-2"><Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" />Detalles</Button><Button size="sm">Participar</Button></div>
            </CardContent>
          </Card>
        ))}</div>
      </div></section>
      <Footer />
    </div>
  );
};

export default AuctionsPage;

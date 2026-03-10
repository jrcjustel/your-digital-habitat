import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Heart, MapPin, TrendingUp, Filter, Grid3X3, List, SlidersHorizontal, Euro, Ruler, Building2 } from "lucide-react";

const mockAssets = [
  { id: 1, ref: "IKE-901", title: "Piso 3 hab. Salamanca", location: "Madrid", price: 285000, yield: 12.4, sqm: 95, type: "Vivienda", status: "Disponible", saleType: "NPL" },
  { id: 2, ref: "IKE-902", title: "Local Comercial Born", location: "Barcelona", price: 420000, yield: 9.8, sqm: 150, type: "Local", status: "Reservado", saleType: "Cesión Remate" },
  { id: 3, ref: "IKE-903", title: "Nave Industrial Vallecas", location: "Madrid", price: 680000, yield: 14.2, sqm: 800, type: "Nave", status: "Disponible", saleType: "Subasta BOE" },
  { id: 4, ref: "IKE-904", title: "Chalet adosado Alicante", location: "Alicante", price: 195000, yield: 11.1, sqm: 180, type: "Vivienda", status: "Disponible", saleType: "Compraventa" },
  { id: 5, ref: "IKE-905", title: "Oficina Centro Valencia", location: "Valencia", price: 310000, yield: 8.5, sqm: 120, type: "Oficina", status: "Nuevo", saleType: "NPL" },
  { id: 6, ref: "IKE-906", title: "Terreno Urbanizable", location: "Málaga", price: 150000, yield: 18.0, sqm: 2000, type: "Terreno", status: "Disponible", saleType: "Cesión Remate" },
];

const AdvancedMarketplacePage = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [saleFilter, setSaleFilter] = useState("");

  const toggleFav = (id: number) => setFavorites(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);

  const filtered = mockAssets.filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.ref.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && a.type !== typeFilter) return false;
    if (saleFilter && a.saleType !== saleFilter) return false;
    if (a.price < priceRange[0] || a.price > priceRange[1]) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Marketplace Avanzado | IKESA" description="Marketplace avanzado de inversiones inmobiliarias con filtros profesionales" canonical="/marketplace-avanzado" />
      <Navbar />

      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold font-heading mb-2">Marketplace Avanzado</h1>
          <p className="text-xl text-muted-foreground">Filtros profesionales para encontrar la inversión perfecta</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><SlidersHorizontal className="h-5 w-5" />Filtros</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Buscar</label>
                  <Input placeholder="Referencia o título..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tipo activo</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Vivienda">Vivienda</SelectItem>
                      <SelectItem value="Local">Local</SelectItem>
                      <SelectItem value="Nave">Nave Industrial</SelectItem>
                      <SelectItem value="Oficina">Oficina</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Tipo inversión</label>
                  <Select value={saleFilter} onValueChange={setSaleFilter}>
                    <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="NPL">NPL</SelectItem>
                      <SelectItem value="Cesión Remate">Cesión Remate</SelectItem>
                      <SelectItem value="Subasta BOE">Subasta BOE</SelectItem>
                      <SelectItem value="Compraventa">Compraventa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Precio: €{priceRange[0].toLocaleString()} - €{priceRange[1].toLocaleString()}</label>
                  <Slider min={0} max={1000000} step={10000} value={priceRange} onValueChange={setPriceRange} />
                </div>
                <Button variant="outline" className="w-full" onClick={() => { setSearch(""); setTypeFilter(""); setSaleFilter(""); setPriceRange([0, 1000000]); }}>Limpiar filtros</Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{filtered.length} resultados</p>
              <div className="flex gap-2">
                <Button variant={view === "grid" ? "default" : "outline"} size="sm" onClick={() => setView("grid")}><Grid3X3 className="h-4 w-4" /></Button>
                <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className={view === "grid" ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {filtered.map(a => (
                <Card key={a.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-video bg-muted flex items-center justify-center relative">
                    <Building2 className="h-12 w-12 text-muted-foreground/30" />
                    <Button variant="ghost" size="sm" className="absolute top-2 right-2 bg-background/80" onClick={() => toggleFav(a.id)}>
                      <Heart className={`h-4 w-4 ${favorites.includes(a.id) ? "fill-primary text-primary" : ""}`} />
                    </Button>
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge>{a.saleType}</Badge>
                      <Badge variant={a.status === "Nuevo" ? "destructive" : "secondary"}>{a.status}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{a.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3" />{a.location}</div>
                      </div>
                      <Badge variant="outline">{a.ref}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-1"><Euro className="h-3 w-3 text-muted-foreground" /><span className="font-semibold">€{a.price.toLocaleString()}</span></div>
                      <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-primary" /><span className="font-semibold text-primary">{a.yield}%</span></div>
                      <div className="flex items-center gap-1"><Ruler className="h-3 w-3 text-muted-foreground" /><span>{a.sqm} m²</span></div>
                    </div>
                    <Button className="w-full" size="sm">Ver detalle</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdvancedMarketplacePage;

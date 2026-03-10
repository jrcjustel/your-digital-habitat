import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Gavel, Download, AlertTriangle, CheckCircle2, Clock, MapPin, Euro, BarChart3, RefreshCw } from "lucide-react";

const PROVINCIAS = [
  "", "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz",
  "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real",
  "Córdoba", "A Coruña", "Cuenca", "Girona", "Granada", "Guadalajara", "Guipúzcoa",
  "Huelva", "Huesca", "Baleares", "Jaén", "La Rioja", "Las Palmas", "León", "Lleida",
  "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra",
  "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona",
  "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza",
];

const TIPOS_BIEN = [
  { value: "", label: "Todos los tipos" },
  { value: "V", label: "Vivienda" },
  { value: "L", label: "Local comercial" },
  { value: "G", label: "Garaje" },
  { value: "I", label: "Industrial" },
  { value: "T", label: "Terreno" },
  { value: "O", label: "Otros" },
];

const BoeScraperPage = () => {
  const { toast } = useToast();
  const [provincia, setProvincia] = useState("");
  const [tipoBien, setTipoBien] = useState("");
  const [isScrapy, setIsScrapy] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  // Fetch BOE-sourced assets from DB
  const { data: boeAssets, isLoading, refetch } = useQuery({
    queryKey: ["boe-assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("npl_assets")
        .select("*")
        .eq("cartera", "BOE")
        .eq("publicado", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const handleScrape = async () => {
    setIsScrapy(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-boe", {
        body: { provincia, tipo_bien: tipoBien, page: 1 },
      });
      if (error) throw error;
      setLastResult(data);
      if (data?.imported > 0) {
        toast({ title: "Importación completada", description: `${data.imported} subastas importadas del BOE` });
        refetch();
      } else {
        toast({ title: "Sin resultados", description: data?.message || "No se encontraron nuevas subastas", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsScrapy(false);
    }
  };

  const fmt = (n: number) =>
    n ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n) : "—";

  const discount = (precio: number, mercado: number) => {
    if (!precio || !mercado || mercado <= 0) return 0;
    return Math.round((1 - precio / mercado) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Scraper BOE | IKESA Admin" description="Importación automática de subastas del BOE" />
      <Navbar />

      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Gavel className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold font-heading">Scraper BOE</h1>
            <Badge variant="outline" className="ml-2">Admin</Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Importación automática de subastas judiciales desde subastas.boe.es
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" /> Importar subastas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Provincia</label>
                <Select value={provincia} onValueChange={setProvincia}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="Todas las provincias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {PROVINCIAS.filter(Boolean).map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de bien</label>
                <Select value={tipoBien} onValueChange={setTipoBien}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_BIEN.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleScrape} disabled={isScrapy} size="lg">
                {isScrapy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Importando...</> : <><RefreshCw className="h-4 w-4 mr-2" /> Importar del BOE</>}
              </Button>
            </div>

            {lastResult && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border text-sm space-y-1">
                <div className="flex items-center gap-2 font-medium">
                  {lastResult.success ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                  Resultado de importación
                </div>
                <p>Subastas encontradas: <strong>{lastResult.total_parsed || 0}</strong></p>
                <p>Importadas: <strong>{lastResult.imported || 0}</strong></p>
                <p>Total en BOE: <strong>{lastResult.total_results || '—'}</strong></p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Gavel className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{boeAssets?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Subastas BOE</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">
                {new Set(boeAssets?.map(a => a.provincia).filter(Boolean)).size}
              </p>
              <p className="text-sm text-muted-foreground">Provincias</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Euro className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">
                {fmt(boeAssets?.reduce((s, a) => s + (a.precio_orientativo || 0), 0) / (boeAssets?.length || 1))}
              </p>
              <p className="text-sm text-muted-foreground">Precio medio</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">
                {boeAssets?.length ? Math.round(
                  boeAssets.filter(a => a.valor_mercado && a.precio_orientativo && a.valor_mercado > 0)
                    .reduce((s, a) => s + (1 - (a.precio_orientativo! / a.valor_mercado!)) * 100, 0) /
                  Math.max(boeAssets.filter(a => a.valor_mercado && a.precio_orientativo).length, 1)
                ) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Descuento medio</p>
            </CardContent>
          </Card>
        </div>

        {/* Imported assets list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Últimas subastas importadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : !boeAssets?.length ? (
              <p className="text-center text-muted-foreground py-12">
                No hay subastas BOE importadas aún. Pulsa "Importar del BOE" para comenzar.
              </p>
            ) : (
              <div className="space-y-3">
                {boeAssets.map(asset => {
                  const desc = discount(asset.precio_orientativo || 0, asset.valor_mercado || 0);
                  return (
                    <div key={asset.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="font-mono text-xs">{asset.asset_id}</Badge>
                          <Badge>{asset.tipo_activo || 'Inmueble'}</Badge>
                          {asset.estado_judicial && (
                            <Badge variant={asset.estado_judicial === 'Abierta' ? 'default' : 'secondary'}>
                              {asset.estado_judicial}
                            </Badge>
                          )}
                          {desc > 20 && <Badge className="bg-green-600/90">-{desc}%</Badge>}
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">{asset.municipio}</span>
                          {asset.provincia && <span className="text-muted-foreground">, {asset.provincia}</span>}
                        </p>
                        {asset.descripcion && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{asset.descripcion}</p>
                        )}
                      </div>
                      <div className="text-right space-y-1 ml-4 shrink-0">
                        <p className="font-bold text-lg">{fmt(asset.precio_orientativo || 0)}</p>
                        {asset.valor_mercado ? (
                          <p className="text-xs text-muted-foreground">Mercado: {fmt(asset.valor_mercado)}</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default BoeScraperPage;

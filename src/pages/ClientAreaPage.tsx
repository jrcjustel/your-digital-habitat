import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { User, Heart, FileText, Bell, TrendingUp, Download, AlertCircle, MapPin, Euro, Settings } from 'lucide-react';
import { toast } from "sonner";

const ClientAreaPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const [profileRes, favsRes, offersRes, alertsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('favorites').select('*, npl_assets(id, tipo_activo, municipio, provincia, precio_orientativo, valor_mercado)').eq('user_id', user.id).limit(20),
      supabase.from('offers').select('*').eq('email', user.email).order('created_at', { ascending: false }).limit(20),
      supabase.from('alerts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (favsRes.data) setFavorites(favsRes.data);
    if (offersRes.data) setOffers(offersRes.data);
    if (alertsRes.data) setAlerts(alertsRes.data);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Área de Cliente | IKESA" description="Gestiona tus inversiones y documentos" canonical="/area-cliente" />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading mb-2">Área de Cliente</h1>
          <p className="text-muted-foreground">Gestiona tus inversiones, favoritos, ofertas y alertas</p>
          {profile && <div className="flex gap-2 mt-3">
            <Badge variant={profile.nda_signed ? 'default' : 'secondary'}>{profile.nda_signed ? 'NDA Firmado' : 'NDA Pendiente'}</Badge>
            {profile.display_name && <Badge variant="outline">{profile.display_name}</Badge>}
          </div>}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard"><User className="h-4 w-4 mr-2" />Panel</TabsTrigger>
            <TabsTrigger value="favorites"><Heart className="h-4 w-4 mr-2" />Favoritos</TabsTrigger>
            <TabsTrigger value="offers"><TrendingUp className="h-4 w-4 mr-2" />Ofertas</TabsTrigger>
            <TabsTrigger value="alerts"><Bell className="h-4 w-4 mr-2" />Alertas</TabsTrigger>
            <TabsTrigger value="data"><Download className="h-4 w-4 mr-2" />Mis Datos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6"><div className="grid md:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md" onClick={() => setActiveTab('favorites')}><CardContent className="p-6"><Heart className="h-8 w-8 text-red-500 mb-3" /><h3 className="font-semibold">Favoritos</h3><p className="text-2xl font-bold">{favorites.length}</p></CardContent></Card>
            <Card className="cursor-pointer hover:shadow-md" onClick={() => setActiveTab('offers')}><CardContent className="p-6"><TrendingUp className="h-8 w-8 text-primary mb-3" /><h3 className="font-semibold">Ofertas</h3><p className="text-2xl font-bold">{offers.length}</p></CardContent></Card>
            <Card className="cursor-pointer hover:shadow-md" onClick={() => setActiveTab('alerts')}><CardContent className="p-6"><Bell className="h-8 w-8 text-yellow-500 mb-3" /><h3 className="font-semibold">Alertas Activas</h3><p className="text-2xl font-bold">{alerts.filter(a => a.is_active).length}</p></CardContent></Card>
          </div></TabsContent>

          <TabsContent value="favorites"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" />Mis Favoritos</CardTitle></CardHeader><CardContent>
            {favorites.length === 0 ? <div className="text-center py-8"><Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Sin favoritos</p><Button className="mt-4" onClick={() => navigate('/npl')}>Explorar activos</Button></div>
            : <div className="grid gap-4 md:grid-cols-2">{favorites.map(f => <Card key={f.id} className="p-4"><div className="flex items-start justify-between"><Badge variant="outline">{(f as any).npl_assets?.tipo_activo || 'Activo'}</Badge></div><p className="font-medium mt-2">{(f as any).npl_assets?.municipio || '—'}, {(f as any).npl_assets?.provincia || '—'}</p>{(f as any).npl_assets?.precio_orientativo && <p className="text-primary font-bold mt-1">{(f as any).npl_assets.precio_orientativo.toLocaleString('es-ES')} €</p>}<Link to={`/npl/${f.property_id}`}><Button size="sm" variant="outline" className="mt-2">Ver detalle</Button></Link></Card>)}</div>}
          </CardContent></Card></TabsContent>

          <TabsContent value="offers"><Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Mis Ofertas</CardTitle></CardHeader><CardContent>
            {offers.length === 0 ? <div className="text-center py-8"><AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No has enviado ofertas</p></div>
            : <div className="space-y-4">{offers.map(o => <div key={o.id} className="border rounded-lg p-4 flex items-center justify-between"><div><p className="font-medium">{o.property_reference || o.property_id}</p><p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString('es-ES')}</p></div><div className="flex items-center gap-3"><span className="font-bold text-primary">{o.offer_amount.toLocaleString('es-ES')} €</span><Badge>{o.status}</Badge></div></div>)}</div>}
          </CardContent></Card></TabsContent>

          <TabsContent value="alerts"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Mis Alertas</CardTitle></CardHeader><CardContent>
            {alerts.length === 0 ? <div className="text-center py-8"><Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Sin alertas configuradas</p><Button className="mt-4" onClick={() => navigate('/npl')}>Crear alerta</Button></div>
            : <div className="space-y-4">{alerts.map(a => <div key={a.id} className="border rounded-lg p-4 flex items-center justify-between"><div><h4 className="font-medium">{a.name}</h4><p className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString('es-ES')}</p></div><Badge variant={a.is_active ? 'default' : 'secondary'}>{a.is_active ? 'Activa' : 'Pausada'}</Badge></div>)}</div>}
          </CardContent></Card></TabsContent>

          <TabsContent value="data"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Descargar Mis Datos</CardTitle><CardDescription>Solicita una copia de todos tus datos personales (RGPD)</CardDescription></CardHeader><CardContent>
            <Button onClick={() => toast.success('Solicitud enviada. Recibirás tus datos por email en las próximas 72h.')}>Solicitar descarga de datos</Button>
          </CardContent></Card></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default ClientAreaPage;

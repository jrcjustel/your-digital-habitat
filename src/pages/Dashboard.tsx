import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { properties } from "@/data/properties";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { Heart, Bell, User, Trash2, MapPin, Ruler, BedDouble, Euro, FileText, Clock, CheckCircle, XCircle, ShieldCheck, ShieldX } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface Profile {
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  nda_signed?: boolean;
  nda_signed_at?: string | null;
}

interface Favorite {
  id: string;
  property_id: string;
  created_at: string;
}

interface Alert {
  id: string;
  name: string;
  filters: Json;
  is_active: boolean;
  created_at: string;
}

interface Offer {
  id: string;
  property_id: string;
  property_reference: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  offer_amount: number;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ display_name: "", phone: "", avatar_url: "", nda_signed: false, nda_signed_at: null });
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    const [profileRes, favRes, alertRes, offersRes] = await Promise.all([
      supabase.from("profiles").select("display_name, phone, avatar_url, nda_signed, nda_signed_at").eq("user_id", user!.id).single(),
      supabase.from("favorites").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("alerts").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("offers").select("*").order("created_at", { ascending: false }),
    ]);
    if (profileRes.data) setProfile(profileRes.data as unknown as Profile);
    if (favRes.data) setFavorites(favRes.data);
    if (alertRes.data) setAlerts(alertRes.data);
    if (offersRes.data) setOffers(offersRes.data as unknown as Offer[]);
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name,
      phone: profile.phone,
    }).eq("user_id", user!.id);
    setSaving(false);
    if (error) toast.error("Error al guardar"); else toast.success("Perfil actualizado");
  };

  const removeFavorite = async (id: string) => {
    await supabase.from("favorites").delete().eq("id", id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    toast.success("Eliminado de favoritos");
  };

  const toggleAlert = async (id: string, is_active: boolean) => {
    await supabase.from("alerts").update({ is_active }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_active } : a)));
  };

  const deleteAlert = async (id: string) => {
    await supabase.from("alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alerta eliminada");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p>Cargando...</p></div>;
  if (!user) return null;

  const favoriteProperties = favorites.map((f) => ({
    ...f,
    property: properties.find((p) => p.id === f.property_id),
  })).filter((f) => f.property);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi cuenta</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>Cerrar sesión</Button>
        </div>

        <Tabs defaultValue="favorites" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="favorites" className="gap-2"><Heart className="w-4 h-4" /> Favoritos</TabsTrigger>
            <TabsTrigger value="offers" className="gap-2"><FileText className="w-4 h-4" /> Ofertas</TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2"><Bell className="w-4 h-4" /> Alertas</TabsTrigger>
            <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" /> Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="favorites">
            {favoriteProperties.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No tienes inmuebles favoritos todavía.</p>
                <Button className="mt-4" onClick={() => navigate("/inmuebles")}>Explorar inmuebles</Button>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favoriteProperties.map(({ id, property }) => (
                  <Card key={id} className="overflow-hidden card-elevated">
                    <div className="relative cursor-pointer" onClick={() => navigate(`/inmueble/${property!.id}`)}>
                      <img src={property!.images[0]} alt={property!.title} className="w-full h-48 object-cover" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-1 cursor-pointer hover:text-accent" onClick={() => navigate(`/inmueble/${property!.id}`)}>
                        {property!.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{property!.location}</span>
                        <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{property!.area} m²</span>
                        {property!.bedrooms && <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{property!.bedrooms}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-foreground flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          {property!.price.toLocaleString("es-ES")}
                          {property!.operation === "alquiler" && <span className="text-sm font-normal">/mes</span>}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => removeFavorite(id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="offers">
            {offers.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No has enviado ofertas todavía.</p>
                <Button className="mt-4" onClick={() => navigate("/inmuebles")}>Explorar inmuebles</Button>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {offers.map((offer) => {
                  const prop = properties.find((p) => p.id === offer.property_id);
                  const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
                    pending: { label: "Pendiente", icon: <Clock className="w-4 h-4" />, className: "text-yellow-600 bg-yellow-50" },
                    accepted: { label: "Aceptada", icon: <CheckCircle className="w-4 h-4" />, className: "text-green-600 bg-green-50" },
                    rejected: { label: "Rechazada", icon: <XCircle className="w-4 h-4" />, className: "text-destructive bg-destructive/10" },
                  };
                  const st = statusConfig[offer.status] || statusConfig.pending;

                  return (
                    <Card key={offer.id}>
                      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                        {prop && (
                          <img
                            src={prop.images[0]}
                            alt={prop.title}
                            className="w-full sm:w-24 h-20 object-cover rounded-lg cursor-pointer shrink-0"
                            onClick={() => navigate(`/inmueble/${prop.id}`)}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-accent">{offer.property_reference || offer.property_id}</span>
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${st.className}`}>
                              {st.icon} {st.label}
                            </span>
                          </div>
                          <h3
                            className="font-semibold text-foreground line-clamp-1 cursor-pointer hover:text-accent"
                            onClick={() => navigate(`/inmueble/${offer.property_id}`)}
                          >
                            {prop?.title || `Inmueble ${offer.property_id}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(offer.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-foreground">{offer.offer_amount.toLocaleString("es-ES")} €</p>
                          <p className="text-xs text-muted-foreground">Tu oferta</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value="alerts">
            {alerts.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No tienes alertas configuradas.</p>
                <p className="text-sm text-muted-foreground mt-1">Busca inmuebles y guarda tu búsqueda como alerta.</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {alerts.map((alert) => (
                  <Card key={alert.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-semibold text-foreground">{alert.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Creada el {new Date(alert.created_at).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={alert.is_active} onCheckedChange={(checked) => toggleAlert(alert.id, checked)} />
                        <Button variant="ghost" size="icon" onClick={() => deleteAlert(alert.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            {/* NDA Status */}
            <Card className="mb-6">
              <CardContent className="flex items-center gap-4 p-5">
                {profile.nda_signed ? (
                  <>
                    <div className="p-3 rounded-full bg-green-50">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">NDA firmado</h3>
                      <p className="text-sm text-muted-foreground">
                        Acuerdo de confidencialidad aceptado el{" "}
                        {profile.nda_signed_at
                          ? new Date(profile.nda_signed_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
                          : "—"}
                        . Tienes acceso completo a productos NPL y Cesión de Remate.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-destructive/10">
                      <ShieldX className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">NDA pendiente</h3>
                      <p className="text-sm text-muted-foreground">
                        No has firmado el Acuerdo de Confidencialidad. Accede a cualquier producto NPL o Cesión de Remate para firmarlo y desbloquear la documentación completa.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Datos personales</CardTitle></CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input value={profile.display_name || ""} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+34 600 000 000" />
                </div>
                <Button onClick={saveProfile} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;

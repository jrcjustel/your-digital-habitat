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
import { Heart, Bell, User, Trash2, MapPin, Ruler, BedDouble, Euro } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface Profile {
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
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

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ display_name: "", phone: "", avatar_url: "" });
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
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
    const [profileRes, favRes, alertRes] = await Promise.all([
      supabase.from("profiles").select("display_name, phone, avatar_url").eq("user_id", user!.id).single(),
      supabase.from("favorites").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("alerts").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    if (favRes.data) setFavorites(favRes.data);
    if (alertRes.data) setAlerts(alertRes.data);
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
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="favorites" className="gap-2"><Heart className="w-4 h-4" /> Favoritos</TabsTrigger>
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

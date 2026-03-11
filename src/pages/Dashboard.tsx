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
import { Heart, Bell, User, Trash2, MapPin, Ruler, BedDouble, Euro, FileText, Clock, CheckCircle, XCircle, ShieldCheck, ShieldX, FolderOpen, Search, CreditCard, Gavel, Home, ArrowRight, Download, Activity, FileDown } from "lucide-react";
import DocumentsPanel from "@/components/DocumentsPanel";
import AlertsCreator from "@/components/AlertsCreator";
import NdaSigningFlow from "@/components/NdaSigningFlow";
import WelcomeWizard from "@/components/WelcomeWizard";
import FirstOperationChecklist from "@/components/FirstOperationChecklist";
import JourneyStageWidget from "@/components/JourneyStageWidget";
import InvestmentChecklistGenerator from "@/components/InvestmentChecklistGenerator";
import type { Json } from "@/integrations/supabase/types";

interface Profile {
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  nda_signed?: boolean;
  nda_signed_at?: string | null;
  persona_tipo?: string | null;
  empresa?: string | null;
  cif_nif?: string | null;
  comunidad_autonoma?: string | null;
  ciudad?: string | null;
  investor_level?: string | null;
  presupuesto_min?: number | null;
  presupuesto_max?: number | null;
  intereses?: string[] | null;
  tipos_activo_preferidos?: string[] | null;
  provincias_interes?: string[] | null;
  acepta_marketing?: boolean;
  lead_score?: number | null;
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
  const [profile, setProfile] = useState<Profile>({
    display_name: "", phone: "", avatar_url: "", nda_signed: false, nda_signed_at: null,
    persona_tipo: "fisica", empresa: null, cif_nif: null, comunidad_autonoma: null, ciudad: null,
    investor_level: "principiante", presupuesto_min: 0, presupuesto_max: 0,
    intereses: [], tipos_activo_preferidos: [], provincias_interes: [],
    acepta_marketing: false, lead_score: 0,
  });
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      supabase.from("profiles").select("display_name, phone, avatar_url, nda_signed, nda_signed_at, persona_tipo, empresa, cif_nif, comunidad_autonoma, ciudad, investor_level, presupuesto_min, presupuesto_max, intereses, tipos_activo_preferidos, provincias_interes, acepta_marketing, lead_score").eq("user_id", user!.id).single(),
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
      persona_tipo: profile.persona_tipo as any,
      empresa: profile.empresa,
      cif_nif: profile.cif_nif,
      comunidad_autonoma: profile.comunidad_autonoma,
      ciudad: profile.ciudad,
      investor_level: profile.investor_level as any,
      presupuesto_min: profile.presupuesto_min,
      presupuesto_max: profile.presupuesto_max,
      intereses: profile.intereses as any,
      tipos_activo_preferidos: profile.tipos_activo_preferidos as any,
      provincias_interes: profile.provincias_interes as any,
      acepta_marketing: profile.acepta_marketing,
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


  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    navigate(`/inmuebles${params.toString() ? `?${params}` : ""}`);
  };

  const investmentChannels = [
    { icon: CreditCard, label: "NPL (Crédito)", href: "/inversores/npl", color: "bg-destructive/10 text-destructive" },
    { icon: Gavel, label: "Cesiones de Remate", href: "/inversores/cesiones-remate", color: "bg-accent/10 text-accent" },
    { icon: Home, label: "Inmuebles Ocupados", href: "/inversores/ocupados", color: "bg-primary/10 text-primary" },
  ];

  // If NDA not signed, show signing flow
  if (!profile.nda_signed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Completa tu registro</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>Cerrar sesión</Button>
          </div>
          <NdaSigningFlow user={user} onComplete={() => loadData()} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Hola, {profile.display_name || user.email?.split("@")[0]} 👋
            </h1>
            <p className="text-muted-foreground">Bienvenido/a a la democratización de la inversión inmobiliaria</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>Cerrar sesión</Button>
        </div>

        <WelcomeWizard />

        {/* First Operation Checklist */}
        <div className="mb-8">
          <FirstOperationChecklist
            profileComplete={!!(profile.display_name && profile.investor_level)}
            hasFavorites={favorites.length > 0}
            hasOffers={offers.length > 0}
            ndaSigned={!!profile.nda_signed}
          />
        </div>

        {/* Quick Search Section */}
        <Card className="mb-8 border-accent/20 bg-gradient-to-r from-secondary to-card">
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-bold text-foreground mb-1">Buscar oportunidades</h2>
            <p className="text-sm text-muted-foreground mb-4">Encuentra inmuebles y activos de inversión desde tu área privada.</p>
            <form onSubmit={handleQuickSearch} className="flex gap-2 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por localidad, provincia, tipo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="gap-2">
                <Search className="w-4 h-4" /> Buscar inmuebles
              </Button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {investmentChannels.map((ch) => (
                <button
                  key={ch.label}
                  onClick={() => navigate(ch.href)}
                  className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border hover:border-accent/40 transition-all group text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ch.color}`}>
                    <ch.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">{ch.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="flex flex-wrap w-full gap-1 h-auto p-1">
            <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" /> Mis datos</TabsTrigger>
            <TabsTrigger value="operations" className="gap-2"><Clock className="w-4 h-4" /> Operaciones</TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2"><Heart className="w-4 h-4" /> Mis favoritos</TabsTrigger>
            <TabsTrigger value="download" className="gap-2"><FileText className="w-4 h-4" /> Descargar datos</TabsTrigger>
            <TabsTrigger value="offers" className="gap-2"><Euro className="w-4 h-4" /> Mis ofertas</TabsTrigger>
            <TabsTrigger value="documents" className="gap-2"><FolderOpen className="w-4 h-4" /> Mis documentos</TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2"><Bell className="w-4 h-4" /> Mis alertas</TabsTrigger>
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

          {/* Operaciones realizadas */}
          <TabsContent value="operations">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Activity className="w-5 h-5 text-accent" /> Operaciones realizadas</CardTitle>
              </CardHeader>
              <CardContent>
                {offers.length === 0 ? (
                  <div className="py-12 text-center">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No tienes operaciones registradas todavía.</p>
                    <p className="text-sm text-muted-foreground mt-1">Aquí aparecerán tus ofertas aceptadas, reservas y compras finalizadas.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {offers.filter(o => o.status === "accepted").length === 0 ? (
                      <div className="py-8 text-center">
                        <Activity className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground text-sm">No tienes operaciones completadas.</p>
                        <p className="text-xs text-muted-foreground mt-1">Las ofertas aceptadas aparecerán aquí como operaciones.</p>
                      </div>
                    ) : (
                      offers.filter(o => o.status === "accepted").map((op) => (
                        <div key={op.id} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-border">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm">Activo {op.property_reference || op.property_id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              Oferta aceptada · {new Date(op.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-foreground">{op.offer_amount.toLocaleString("es-ES")} €</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Descargar datos (RGPD) */}
          <TabsContent value="download">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><FileDown className="w-5 h-5 text-accent" /> Descargar mis datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Conforme al Reglamento General de Protección de Datos (RGPD), puedes descargar una copia de todos los datos personales que tenemos almacenados sobre ti.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="gap-2 justify-start h-auto py-4"
                    onClick={() => {
                      const data = {
                        perfil: profile,
                        email: user.email,
                        favoritos: favorites.length,
                        ofertas: offers,
                        alertas: alerts,
                        fecha_exportacion: new Date().toISOString(),
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `ikesa-mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Datos descargados correctamente");
                    }}
                  >
                    <Download className="w-5 h-5 text-accent" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">Descargar datos (JSON)</p>
                      <p className="text-xs text-muted-foreground">Perfil, ofertas, alertas y preferencias</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 justify-start h-auto py-4"
                    onClick={() => {
                      const rows = [
                        ["Campo", "Valor"],
                        ["Nombre", profile.display_name || ""],
                        ["Email", user.email || ""],
                        ["Teléfono", profile.phone || ""],
                        ["Tipo persona", profile.persona_tipo || ""],
                        ["Empresa", profile.empresa || ""],
                        ["CIF/NIF", profile.cif_nif || ""],
                        ["Comunidad Autónoma", profile.comunidad_autonoma || ""],
                        ["Ciudad", profile.ciudad || ""],
                        ["Nivel inversor", profile.investor_level || ""],
                        ["NDA firmado", profile.nda_signed ? "Sí" : "No"],
                        ["Favoritos", String(favorites.length)],
                        ["Ofertas enviadas", String(offers.length)],
                        ["Alertas activas", String(alerts.filter(a => a.is_active).length)],
                      ];
                      const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
                      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `ikesa-mis-datos-${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Datos descargados en CSV");
                    }}
                  >
                    <Download className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">Descargar datos (CSV)</p>
                      <p className="text-xs text-muted-foreground">Formato compatible con Excel</p>
                    </div>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Si deseas solicitar la eliminación completa de tu cuenta y datos, contacta con nosotros en{" "}
                  <a href="mailto:privacidad@ikesa.es" className="text-accent underline">privacidad@ikesa.es</a>.
                </p>
              </CardContent>
            </Card>
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
                  const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
                    pending: { label: "Pendiente", icon: <Clock className="w-4 h-4" />, className: "text-yellow-600 bg-yellow-50" },
                    accepted: { label: "Aceptada", icon: <CheckCircle className="w-4 h-4" />, className: "text-primary bg-primary/10" },
                    rejected: { label: "Rechazada", icon: <XCircle className="w-4 h-4" />, className: "text-destructive bg-destructive/10" },
                  };
                  const st = statusConfig[offer.status] || statusConfig.pending;

                  return (
                    <Card key={offer.id}>
                      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-accent">{offer.property_reference || offer.property_id.slice(0, 8)}</span>
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${st.className}`}>
                              {st.icon} {st.label}
                            </span>
                          </div>
                          <h3
                            className="font-semibold text-foreground line-clamp-1 cursor-pointer hover:text-accent"
                            onClick={() => navigate(`/npl/${offer.property_id}`)}
                          >
                            Activo {offer.property_reference || offer.property_id.slice(0, 8)}
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
          <TabsContent value="documents">
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Mis documentos</h2>
                <p className="text-sm text-muted-foreground">NDA firmado, DNI, escrituras, justificantes de fondos y toda la documentación relativa a tu expediente de cliente.</p>
              </div>

              {/* NDA status card */}
              <Card className="border-accent/20">
                <CardContent className="flex items-center gap-4 p-4">
                  {profile.nda_signed ? (
                    <>
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">NDA firmado digitalmente</p>
                        <p className="text-xs text-muted-foreground">
                          Firmado el {profile.nda_signed_at ? new Date(profile.nda_signed_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">Vigente</span>
                    </>
                  ) : (
                    <>
                      <div className="p-2.5 rounded-lg bg-destructive/10">
                        <ShieldX className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">NDA pendiente de firma</p>
                        <p className="text-xs text-muted-foreground">Accede a un activo NPL o Cesión de Remate para firmar el NDA.</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <DocumentsPanel showFilters={true} allowUpload={true} userOnly={true} />
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsCreator />
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

            {/* Lead Score */}
            {profile.lead_score !== undefined && profile.lead_score !== null && profile.lead_score > 0 && (
              <Card className="mb-6">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">Tu puntuación de inversor</h3>
                      <p className="text-xs text-muted-foreground">Basada en tu actividad y perfil completado</p>
                    </div>
                    <div className="text-2xl font-bold text-primary">{profile.lead_score}/100</div>
                  </div>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${profile.lead_score}%` }} />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Datos personales */}
              <Card>
                <CardHeader><CardTitle className="text-base">Datos personales</CardTitle></CardHeader>
                <CardContent className="space-y-4">
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
                  <div className="space-y-2">
                    <Label>Tipo de persona</Label>
                    <select
                      value={profile.persona_tipo || "fisica"}
                      onChange={(e) => setProfile({ ...profile, persona_tipo: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="fisica">Persona Física</option>
                      <option value="juridica">Persona Jurídica</option>
                    </select>
                  </div>
                  {profile.persona_tipo === "juridica" && (
                    <>
                      <div className="space-y-2">
                        <Label>Empresa / Razón social</Label>
                        <Input value={profile.empresa || ""} onChange={(e) => setProfile({ ...profile, empresa: e.target.value })} placeholder="Nombre de la empresa" />
                      </div>
                      <div className="space-y-2">
                        <Label>CIF</Label>
                        <Input value={profile.cif_nif || ""} onChange={(e) => setProfile({ ...profile, cif_nif: e.target.value })} placeholder="B12345678" />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Perfil de inversor */}
              <Card>
                <CardHeader><CardTitle className="text-base">Perfil de inversor</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nivel de experiencia</Label>
                    <select
                      value={profile.investor_level || "principiante"}
                      onChange={(e) => setProfile({ ...profile, investor_level: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="principiante">Principiante</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                      <option value="profesional">Profesional</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Comunidad Autónoma</Label>
                    <select
                      value={profile.comunidad_autonoma || ""}
                      onChange={(e) => setProfile({ ...profile, comunidad_autonoma: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Selecciona...</option>
                      {["Andalucía","Aragón","Asturias","Baleares","Canarias","Cantabria","Castilla-La Mancha","Castilla y León","Cataluña","C. Valenciana","Extremadura","Galicia","La Rioja","Madrid","Murcia","Navarra","País Vasco"].map(ca => (
                        <option key={ca} value={ca}>{ca}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input value={profile.ciudad || ""} onChange={(e) => setProfile({ ...profile, ciudad: e.target.value })} placeholder="Tu ciudad" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Presupuesto mín. (€)</Label>
                      <Input type="number" value={profile.presupuesto_min || ""} onChange={(e) => setProfile({ ...profile, presupuesto_min: Number(e.target.value) })} placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Presupuesto máx. (€)</Label>
                      <Input type="number" value={profile.presupuesto_max || ""} onChange={(e) => setProfile({ ...profile, presupuesto_max: Number(e.target.value) })} placeholder="500000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipos de activo de interés</Label>
                    <div className="flex flex-wrap gap-2">
                      {["NPL","Cesión de Remate","Subastas BOE","Ocupados","Viviendas","Locales","Terrenos"].map(tipo => {
                        const selected = profile.tipos_activo_preferidos?.includes(tipo);
                        return (
                          <button
                            key={tipo}
                            type="button"
                            onClick={() => {
                              const current = profile.tipos_activo_preferidos || [];
                              setProfile({
                                ...profile,
                                tipos_activo_preferidos: selected ? current.filter(t => t !== tipo) : [...current, tipo]
                              });
                            }}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                              selected ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border hover:border-primary/50"
                            }`}
                          >
                            {tipo}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Switch
                      checked={profile.acepta_marketing || false}
                      onCheckedChange={(checked) => setProfile({ ...profile, acepta_marketing: checked })}
                    />
                    <Label className="text-sm text-muted-foreground">Acepto recibir comunicaciones comerciales y oportunidades de inversión</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Button onClick={saveProfile} disabled={saving} className="w-full md:w-auto">
                {saving ? "Guardando..." : "Guardar todos los cambios"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;

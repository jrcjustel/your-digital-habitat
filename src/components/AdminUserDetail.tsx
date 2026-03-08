import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, User, FileText, Heart, History, ShieldCheck, Mail, Phone,
  Building2, MapPin, Calendar, Clock, Download, Eye, CheckCircle, XCircle,
  TrendingUp, AlertTriangle, MessageCircle,
} from "lucide-react";

interface Props {
  userId: string;
  onBack: () => void;
}

interface ProfileDetail {
  user_id: string;
  display_name: string | null;
  phone: string | null;
  empresa: string | null;
  cif_nif: string | null;
  persona_tipo: string | null;
  comunidad_autonoma: string | null;
  ciudad: string | null;
  investor_level: string | null;
  lead_score: number | null;
  nda_signed: boolean;
  nda_signed_at: string | null;
  created_at: string;
  updated_at: string;
  acepta_marketing: boolean | null;
  num_ofertas: number | null;
  num_favoritos: number | null;
  presupuesto_min: number | null;
  presupuesto_max: number | null;
  provincias_interes: string[] | null;
  tipos_activo_preferidos: string[] | null;
  intereses: string[] | null;
  notas_admin: string | null;
  ultima_actividad: string | null;
  avatar_url: string | null;
  origen: string | null;
}

const AdminUserDetail = ({ userId, onBack }: Props) => {
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [email, setEmail] = useState<string>("");
  const [activity, setActivity] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notasAdmin, setNotasAdmin] = useState("");

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    const [profileRes, activityRes, docsRes, favsRes, offersRes, bidsRes, alertsRes, convRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("activity_log").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
      supabase.from("documents").select("*").eq("uploaded_by", userId).order("created_at", { ascending: false }),
      supabase.from("favorites").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("offers").select("*").order("created_at", { ascending: false }),
      supabase.from("bids").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("alerts").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("chat_conversations").select("*, chat_messages(id)").eq("user_id", userId).order("updated_at", { ascending: false }),
    ]);

    if (profileRes.data) {
      const p = profileRes.data as unknown as ProfileDetail;
      setProfile(p);
      setNotasAdmin(p.notas_admin || "");
      // Get email from offers or use display_name
      const userOffers = (offersRes.data || []).filter((o: any) => o.email);
      if (userOffers.length > 0) setEmail(userOffers[0].email);
    }

    setActivity(activityRes.data || []);
    setDocuments(docsRes.data || []);
    setFavorites(favsRes.data || []);
    // Filter offers by email match - we'll show all for admin
    setOffers(offersRes.data || []);
    setBids(bidsRes.data || []);
    setAlerts(alertsRes.data || []);
    setConversations(convRes.data || []);
    setLoading(false);
  };

  const saveNotasAdmin = async () => {
    await supabase.from("profiles").update({ notas_admin: notasAdmin }).eq("user_id", userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Clock className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No se encontró el perfil del usuario</p>
        <Button variant="outline" onClick={onBack} className="mt-4 gap-2"><ArrowLeft className="w-4 h-4" /> Volver</Button>
      </div>
    );
  }

  const statCards = [
    { label: "Lead Score", value: profile.lead_score || 0, icon: TrendingUp, color: (profile.lead_score || 0) >= 50 ? "text-primary" : "text-muted-foreground" },
    { label: "Ofertas", value: profile.num_ofertas || 0, icon: FileText, color: "text-accent" },
    { label: "Favoritos", value: profile.num_favoritos || 0, icon: Heart, color: "text-destructive" },
    { label: "Alertas", value: alerts.length, icon: AlertTriangle, color: "text-primary" },
    { label: "Conversaciones IA", value: conversations.length, icon: MessageCircle, color: "text-accent" },
    { label: "Documentos", value: documents.length, icon: FileText, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{profile.display_name || "Sin nombre"}</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
            {email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {email}</span>}
            {profile.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {profile.phone}</span>}
            {profile.empresa && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {profile.empresa}</span>}
            {profile.comunidad_autonoma && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.comunidad_autonoma}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={profile.nda_signed ? "default" : "secondary"}>
            {profile.nda_signed ? "NDA Firmado" : "Sin NDA"}
          </Badge>
          <Badge variant={profile.persona_tipo === "juridica" ? "default" : "outline"}>
            {profile.persona_tipo === "juridica" ? "Empresa" : "Particular"}
          </Badge>
          <Badge variant="outline">{profile.investor_level || "principiante"}</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 max-w-3xl">
          <TabsTrigger value="profile" className="text-xs gap-1"><User className="w-3.5 h-3.5" /> Perfil</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1"><History className="w-3.5 h-3.5" /> Actividad</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs gap-1"><FileText className="w-3.5 h-3.5" /> Docs</TabsTrigger>
          <TabsTrigger value="favs" className="text-xs gap-1"><Heart className="w-3.5 h-3.5" /> Favoritos</TabsTrigger>
          <TabsTrigger value="offers" className="text-xs gap-1"><FileText className="w-3.5 h-3.5" /> Ofertas</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Alertas</TabsTrigger>
        </TabsList>

        {/* Profile Detail */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Datos personales</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Nombre" value={profile.display_name} />
                <Row label="Teléfono" value={profile.phone} />
                <Row label="Empresa" value={profile.empresa} />
                <Row label="CIF/NIF" value={profile.cif_nif} />
                <Row label="Tipo persona" value={profile.persona_tipo === "juridica" ? "Jurídica" : "Física"} />
                <Row label="Ciudad" value={profile.ciudad} />
                <Row label="CCAA" value={profile.comunidad_autonoma} />
                <Row label="Origen" value={profile.origen} />
                <Row label="Marketing" value={profile.acepta_marketing ? "Sí" : "No"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Perfil inversor</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Nivel" value={profile.investor_level} />
                <Row label="Lead Score" value={String(profile.lead_score || 0)} />
                <Row label="Presupuesto" value={profile.presupuesto_min || profile.presupuesto_max ? `${(profile.presupuesto_min || 0).toLocaleString("es-ES")}€ – ${(profile.presupuesto_max || 0).toLocaleString("es-ES")}€` : null} />
                <Row label="Provincias interés" value={profile.provincias_interes?.join(", ")} />
                <Row label="Tipos activo" value={profile.tipos_activo_preferidos?.join(", ")} />
                <Row label="Intereses" value={profile.intereses?.join(", ")} />
                <Row label="NDA firmado" value={profile.nda_signed ? `Sí (${profile.nda_signed_at ? new Date(profile.nda_signed_at).toLocaleDateString("es-ES") : "—"})` : "No"} />
                <Row label="Registro" value={new Date(profile.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })} />
                <Row label="Última actividad" value={profile.ultima_actividad ? new Date(profile.ultima_actividad).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : null} />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Notas del administrador</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  className="w-full min-h-[100px] rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                  placeholder="Añade notas internas sobre este usuario..."
                  value={notasAdmin}
                  onChange={(e) => setNotasAdmin(e.target.value)}
                />
                <Button size="sm" onClick={saveNotasAdmin}>Guardar notas</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity">
          {activity.length === 0 ? (
            <EmptyState icon={History} text="Sin actividad registrada para este usuario" />
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Acción</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">ID Entidad</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((log: any) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">{log.action}</Badge></td>
                      <td className="p-3 text-xs text-foreground">{log.entity_type}</td>
                      <td className="p-3 text-xs text-muted-foreground font-mono">{log.entity_id?.slice(0, 12) || "—"}</td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">
                        {log.metadata && typeof log.metadata === "object" ? JSON.stringify(log.metadata).slice(0, 80) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Documents */}
        <TabsContent value="docs">
          {documents.length === 0 ? (
            <EmptyState icon={FileText} text="Este usuario no ha subido documentos" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {documents.map((doc: any) => (
                <Card key={doc.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="text-[10px]">{doc.category}</Badge>
                        {doc.is_confidential && <Badge variant="destructive" className="text-[10px]">Confidencial</Badge>}
                        <span>{new Date(doc.created_at).toLocaleDateString("es-ES")}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={async () => {
                      const { data } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 300);
                      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                    }}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Favorites */}
        <TabsContent value="favs">
          {favorites.length === 0 ? (
            <EmptyState icon={Heart} text="Este usuario no tiene favoritos" />
          ) : (
            <div className="grid gap-2 md:grid-cols-3">
              {favorites.map((fav: any) => (
                <Card key={fav.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Heart className="w-4 h-4 text-destructive shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-foreground truncate">{fav.property_id}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(fav.created_at).toLocaleDateString("es-ES")}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Offers & Bids */}
        <TabsContent value="offers">
          <div className="space-y-6">
            {bids.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Pujas ({bids.length})</h3>
                <div className="space-y-2">
                  {bids.map((bid: any) => (
                    <Card key={bid.id}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-accent">{bid.asset_id?.slice(0, 12)}</p>
                          <p className="text-sm font-semibold text-foreground">{bid.full_name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(bid.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">{bid.amount?.toLocaleString("es-ES")} €</p>
                          <Badge variant={bid.status === "active" ? "default" : "secondary"} className="text-[10px]">{bid.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {bids.length === 0 && (
              <EmptyState icon={FileText} text="Este usuario no tiene pujas ni ofertas registradas" />
            )}
          </div>
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts">
          {alerts.length === 0 ? (
            <EmptyState icon={AlertTriangle} text="Este usuario no tiene alertas configuradas" />
          ) : (
            <div className="space-y-2">
              {alerts.map((alert: any) => (
                <Card key={alert.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{alert.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Filtros: {JSON.stringify(alert.filters).slice(0, 100)}
                      </p>
                    </div>
                    <Badge variant={alert.is_active ? "default" : "secondary"}>
                      {alert.is_active ? "Activa" : "Inactiva"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground text-right max-w-[60%] truncate">{value || "—"}</span>
  </div>
);

const EmptyState = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="text-center py-12 text-muted-foreground">
    <Icon className="w-12 h-12 mx-auto mb-3 opacity-30" />
    <p>{text}</p>
  </div>
);

export default AdminUserDetail;

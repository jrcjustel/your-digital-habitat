import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Bell, Plus, Trash2, ChevronDown, ChevronUp, Save, Loader2, MapPin, Home, Euro, Tag, BellRing, Eye, ExternalLink,
} from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

const MAX_ALERTS = 4;

const CCAA = [
  "Andalucía", "Aragón", "Asturias, Principado de", "Canarias", "Cantabria",
  "Castilla y León", "Castilla-La Mancha", "Cataluña", "Ceuta",
  "Comunidad de Madrid", "Comunidad Valenciana", "Extremadura", "Galicia",
  "Islas Baleares", "Melilla", "Murcia, Región de", "Navarra, Comunidad Foral de",
  "País Vasco", "Rioja, La",
];

const TIPO_VENTA = [
  { value: "compra_credito", label: "Compra de crédito" },
  { value: "cesion_remate", label: "Cesión de remate" },
  { value: "compraventa", label: "Compraventa de inmuebles" },
  { value: "postura_subasta", label: "Postura en subasta" },
];

const TIPO_ACTIVO = [
  "Almacén", "Edificio", "Garaje", "Local", "Nave",
  "Oficina", "Parking", "Suelo", "Trastero", "Vivienda",
];

interface AlertFilters {
  comunidad_autonoma?: string;
  provincia?: string;
  municipio?: string;
  tipo_venta?: string;
  tipo_activo?: string;
  precio_min?: number;
  precio_max?: number;
}

interface Alert {
  id: string;
  name: string;
  filters: Json;
  is_active: boolean;
  created_at: string;
}

// ─── Match counter helper ────────────────────────────────────
function countMatchingAssets(filters: AlertFilters, assets: any[]): number {
  if (!filters || Object.keys(filters).length === 0) return 0;
  return assets.filter((asset) => {
    if (filters.comunidad_autonoma && asset.comunidad_autonoma?.toLowerCase() !== filters.comunidad_autonoma.toLowerCase()) return false;
    if (filters.provincia && asset.provincia?.toLowerCase() !== filters.provincia.toLowerCase()) return false;
    if (filters.municipio && !asset.municipio?.toLowerCase().includes(filters.municipio.toLowerCase())) return false;
    if (filters.tipo_venta) {
      if (filters.tipo_venta === "cesion_credito" && !asset.cesion_credito) return false;
      if (filters.tipo_venta === "cesion_remate" && !asset.cesion_remate) return false;
      if (filters.tipo_venta === "postura_subasta" && !asset.postura_subasta) return false;
      if (filters.tipo_venta === "compraventa" && (asset.cesion_credito || asset.cesion_remate || asset.postura_subasta)) return false;
    }
    if (filters.tipo_activo && asset.tipo_activo?.toLowerCase() !== filters.tipo_activo.toLowerCase()) return false;
    if (filters.precio_min && filters.precio_min > 0 && (asset.precio_orientativo || 0) < filters.precio_min) return false;
    if (filters.precio_max && filters.precio_max > 0 && (asset.precio_orientativo || 0) > filters.precio_max) return false;
    return true;
  }).length;
}

const AlertsCreator = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [openAlerts, setOpenAlerts] = useState<Record<string, boolean>>({});
  const [publishedAssets, setPublishedAssets] = useState<any[]>([]);

  // New alert form state
  const [newFilters, setNewFilters] = useState<AlertFilters>({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);

  useEffect(() => {
    if (user) {
      loadAlerts();
      loadPublishedAssets();
    }
  }, [user]);

  const loadPublishedAssets = async () => {
    const { data } = await supabase
      .from("npl_assets")
      .select("id,comunidad_autonoma,provincia,municipio,tipo_activo,precio_orientativo,cesion_credito,cesion_remate,postura_subasta")
      .eq("publicado", true);
    setPublishedAssets(data || []);
  };

  const loadAlerts = async () => {
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true });
    setAlerts(data || []);
    setLoading(false);
    // Auto-open first alert
    if (data && data.length > 0) {
      setOpenAlerts({ [data[0].id]: true });
    }
  };

  const createAlert = async () => {
    if (!user) return;
    setCreatingNew(true);

    const alertNumber = alerts.length + 1;
    const { error } = await supabase.from("alerts").insert({
      user_id: user.id,
      name: `Alerta ${alertNumber}`,
      filters: newFilters as unknown as Json,
      is_active: true,
    });

    if (error) {
      toast.error("Error al crear la alerta");
    } else {
      toast.success(`Alerta ${alertNumber} creada`);
      setNewFilters({});
      setShowNewForm(false);
      loadAlerts();
    }
    setCreatingNew(false);
  };

  const updateAlertFilters = async (alertId: string, filters: AlertFilters) => {
    setSaving(alertId);
    const { error } = await supabase
      .from("alerts")
      .update({ filters: filters as unknown as Json })
      .eq("id", alertId);

    if (error) {
      toast.error("Error al guardar");
    } else {
      toast.success("Alerta actualizada");
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, filters: filters as unknown as Json } : a))
      );
    }
    setSaving(null);
  };

  const toggleAlert = async (id: string, is_active: boolean) => {
    await supabase.from("alerts").update({ is_active }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_active } : a)));
    toast.success(is_active ? "Alerta activada" : "Alerta pausada");
  };

  const deleteAlert = async (id: string) => {
    await supabase.from("alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alerta eliminada");
  };

  const toggleOpen = (id: string) => {
    setOpenAlerts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        Cargando alertas...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" /> Crea tus alertas
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sistema de alertas que te mantendrán informado/a en todo momento de nuestras oportunidades.
          En cada alerta puedes configurar múltiples criterios de búsqueda.
        </p>
      </div>

      {/* Notifications Section */}
      <AlertNotifications userId={user?.id} />

      {/* Existing alerts */}
      {alerts.map((alert, index) => {
        const filters = (alert.filters || {}) as AlertFilters;
        const isOpen = openAlerts[alert.id] || false;

        return (
          <AlertCard
            key={alert.id}
            index={index + 1}
            alert={alert}
            filters={filters}
            isOpen={isOpen}
            isSaving={saving === alert.id}
            onToggleOpen={() => toggleOpen(alert.id)}
            onToggleActive={(active) => toggleAlert(alert.id, active)}
            onDelete={() => deleteAlert(alert.id)}
            onSave={(f) => updateAlertFilters(alert.id, f)}
          />
        );
      })}

      {/* New alert form */}
      {showNewForm && (
        <Card className="border-accent/30 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent" />
              Nueva Alerta {alerts.length + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertFilterForm filters={newFilters} onChange={setNewFilters} />
            <div className="flex gap-2 pt-2">
              <Button onClick={createAlert} disabled={creatingNew} className="gap-2">
                {creatingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar alerta
              </Button>
              <Button variant="outline" onClick={() => { setShowNewForm(false); setNewFilters({}); }}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add alert button */}
      {!showNewForm && alerts.length < MAX_ALERTS && (
        <Button
          variant="outline"
          onClick={() => setShowNewForm(true)}
          className="w-full gap-2 border-dashed border-2 h-14 text-muted-foreground hover:text-accent hover:border-accent/40"
        >
          <Plus className="w-5 h-5" />
          Añadir alerta ({alerts.length}/{MAX_ALERTS})
        </Button>
      )}

      {alerts.length >= MAX_ALERTS && !showNewForm && (
        <p className="text-xs text-muted-foreground text-center">
          Has alcanzado el máximo de {MAX_ALERTS} alertas. Elimina una para crear otra.
        </p>
      )}
    </div>
  );
};

// ─── Alert Card ──────────────────────────────────────────────

interface AlertCardProps {
  index: number;
  alert: Alert;
  filters: AlertFilters;
  isOpen: boolean;
  isSaving: boolean;
  onToggleOpen: () => void;
  onToggleActive: (active: boolean) => void;
  onDelete: () => void;
  onSave: (filters: AlertFilters) => void;
}

const AlertCard = ({
  index, alert, filters: initialFilters, isOpen, isSaving,
  onToggleOpen, onToggleActive, onDelete, onSave,
}: AlertCardProps) => {
  const [filters, setFilters] = useState<AlertFilters>(initialFilters);
  const hasChanges = JSON.stringify(filters) !== JSON.stringify(initialFilters);

  // Build summary badges
  const badges: string[] = [];
  if (filters.comunidad_autonoma) badges.push(filters.comunidad_autonoma);
  if (filters.provincia) badges.push(filters.provincia);
  if (filters.tipo_venta) {
    const tv = TIPO_VENTA.find((t) => t.value === filters.tipo_venta);
    if (tv) badges.push(tv.label);
  }
  if (filters.tipo_activo) badges.push(filters.tipo_activo);
  if (filters.precio_min || filters.precio_max) {
    const min = filters.precio_min ? `${(filters.precio_min / 1000).toFixed(0)}k` : "0";
    const max = filters.precio_max ? `${(filters.precio_max / 1000).toFixed(0)}k` : "∞";
    badges.push(`${min} – ${max} €`);
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggleOpen}>
      <Card className={`transition-colors ${alert.is_active ? "border-accent/20" : "border-border opacity-60"}`}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors rounded-t-xl">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-accent">{index}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-sm">Alerta {index}</h3>
                {!alert.is_active && (
                  <Badge variant="secondary" className="text-xs">Pausada</Badge>
                )}
              </div>
              {badges.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {badges.map((b, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      {b}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">Sin criterios configurados</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Switch
                checked={alert.is_active}
                onCheckedChange={onToggleActive}
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 border-t border-border">
            <AlertFilterForm filters={filters} onChange={setFilters} />
            {hasChanges && (
              <div className="mt-4">
                <Button onClick={() => onSave(filters)} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar cambios
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

// ─── Alert Filter Form ───────────────────────────────────────

interface AlertFilterFormProps {
  filters: AlertFilters;
  onChange: (filters: AlertFilters) => void;
}

const AlertFilterForm = ({ filters, onChange }: AlertFilterFormProps) => {
  const update = (key: keyof AlertFilters, value: string | number | undefined) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Comunidad Autónoma */}
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Comunidad Autónoma
        </Label>
        <Select
          value={filters.comunidad_autonoma || ""}
          onValueChange={(v) => update("comunidad_autonoma", v === "__none__" ? undefined : v)}
        >
          <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Todas</SelectItem>
            {CCAA.map((ca) => (
              <SelectItem key={ca} value={ca}>{ca}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Provincia */}
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Provincia
        </Label>
        <Input
          value={filters.provincia || ""}
          onChange={(e) => update("provincia", e.target.value)}
          placeholder="Ej: Madrid, Barcelona..."
        />
      </div>

      {/* Municipio */}
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> Municipio
        </Label>
        <Input
          value={filters.municipio || ""}
          onChange={(e) => update("municipio", e.target.value)}
          placeholder="Ej: Marbella, Getafe..."
        />
      </div>

      {/* Tipo de Venta */}
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" /> Tipo de Venta
        </Label>
        <Select
          value={filters.tipo_venta || ""}
          onValueChange={(v) => update("tipo_venta", v === "__none__" ? undefined : v)}
        >
          <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Todos</SelectItem>
            {TIPO_VENTA.map((tv) => (
              <SelectItem key={tv.value} value={tv.value}>{tv.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipología de activo */}
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-muted-foreground" /> Tipología de activo
        </Label>
        <Select
          value={filters.tipo_activo || ""}
          onValueChange={(v) => update("tipo_activo", v === "__none__" ? undefined : v)}
        >
          <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Todos</SelectItem>
            {TIPO_ACTIVO.map((ta) => (
              <SelectItem key={ta} value={ta}>{ta}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spacer for alignment */}
      <div className="hidden sm:block" />

      {/* Precio mínimo */}
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1.5">
          <Euro className="w-3.5 h-3.5 text-muted-foreground" /> Precio mínimo
        </Label>
        <div className="relative">
          <Input
            type="number"
            value={filters.precio_min || ""}
            onChange={(e) => update("precio_min", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="0"
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
        </div>
      </div>

      {/* Precio máximo */}
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1.5">
          <Euro className="w-3.5 h-3.5 text-muted-foreground" /> Precio máximo
        </Label>
        <div className="relative">
          <Input
            type="number"
            value={filters.precio_max || ""}
            onChange={(e) => update("precio_max", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Sin límite"
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
        </div>
      </div>
    </div>
  );
};

// ─── Alert Notifications ────────────────────────────────────

interface AlertNotification {
  id: string;
  alert_id: string;
  asset_id: string;
  matched_criteria: Record<string, boolean>;
  is_read: boolean;
  created_at: string;
  asset?: {
    tipo_activo: string | null;
    municipio: string | null;
    provincia: string | null;
    precio_orientativo: number | null;
    sqm: number | null;
  };
  alert?: {
    name: string;
  };
}

const AlertNotifications = ({ userId }: { userId?: string }) => {
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    // We need to query alert_notifications and join with npl_assets and alerts
    // Since the types aren't auto-generated yet, we use .from() with manual typing
    const { data, error } = await supabase
      .from("alert_notifications" as any)
      .select("*")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false })
      .limit(20) as any;

    if (data && !error) {
      // Fetch asset details for each notification
      const assetIds = [...new Set(data.map((n: any) => n.asset_id))] as string[];
      const alertIds = [...new Set(data.map((n: any) => n.alert_id))] as string[];

      const [assetsRes, alertsRes] = await Promise.all([
        supabase.from("npl_assets").select("id,tipo_activo,municipio,provincia,precio_orientativo,sqm").in("id", assetIds),
        supabase.from("alerts").select("id,name").in("id", alertIds),
      ]);

      const assetsMap = new Map((assetsRes.data || []).map((a) => [a.id, a]));
      const alertsMap = new Map((alertsRes.data || []).map((a) => [a.id, a]));

      const enriched = data.map((n: any) => ({
        ...n,
        asset: assetsMap.get(n.asset_id),
        alert: alertsMap.get(n.alert_id),
      }));

      setNotifications(enriched);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await (supabase.from("alert_notifications" as any) as any).update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  if (loading) return null;
  if (notifications.length === 0) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BellRing className="w-4 h-4 text-accent" />
          Activos que coinciden con tus alertas
          {unreadCount > 0 && (
            <Badge className="bg-accent text-accent-foreground text-xs">{unreadCount} nuevos</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {notifications.slice(0, 10).map((notif) => (
          <div
            key={notif.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              notif.is_read ? "bg-background/50" : "bg-background border border-accent/30"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {notif.asset?.tipo_activo || "Activo"} — {notif.asset?.municipio || ""}, {notif.asset?.provincia || ""}
                </span>
                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {notif.asset?.precio_orientativo
                    ? `${notif.asset.precio_orientativo.toLocaleString("es-ES")} €`
                    : "Consultar"}
                  {notif.asset?.sqm ? ` · ${notif.asset.sqm} m²` : ""}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-accent">{notif.alert?.name || "Alerta"}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!notif.is_read && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(notif.id)} title="Marcar como leído">
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <a href={`/inmuebles/${notif.asset_id}`} title="Ver activo">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            </div>
          </div>
        ))}
        {notifications.length > 10 && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            Mostrando 10 de {notifications.length} coincidencias
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsCreator;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import {
  Plus, Trash2, CheckCircle, XCircle, Edit2, Save, X, MapPin, Mail, Phone, MessageCircle,
} from "lucide-react";

interface Gestor {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  whatsapp: string | null;
  comunidades_autonomas: string[];
  provincias: string[];
  tipos_activo: string[];
  is_active: boolean;
}

const CCAA_LIST = [
  "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria",
  "Castilla-La Mancha", "Castilla y León", "Cataluña", "C. Valenciana",
  "Extremadura", "Galicia", "La Rioja", "Madrid", "Murcia", "Navarra", "País Vasco",
];

const AdminGestores = () => {
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", whatsapp: "", comunidades: "", provincias: "" });

  useEffect(() => { loadGestores(); }, []);

  const loadGestores = async () => {
    setLoading(true);
    const { data } = await supabase.from("gestores").select("*").order("nombre");
    if (data) setGestores(data as unknown as Gestor[]);
    setLoading(false);
  };

  const startEdit = (g: Gestor) => {
    setEditingId(g.id);
    setForm({
      nombre: g.nombre,
      email: g.email,
      telefono: g.telefono || "",
      whatsapp: g.whatsapp || "",
      comunidades: g.comunidades_autonomas?.join(", ") || "",
      provincias: g.provincias?.join(", ") || "",
    });
  };

  const saveGestor = async () => {
    const payload = {
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono || null,
      whatsapp: form.whatsapp || null,
      comunidades_autonomas: form.comunidades.split(",").map(s => s.trim()).filter(Boolean),
      provincias: form.provincias.split(",").map(s => s.trim()).filter(Boolean),
    };

    if (editingId === "new") {
      const { error } = await supabase.from("gestores").insert(payload);
      if (error) { toast.error("Error al crear gestor"); return; }
      toast.success("Gestor creado");
    } else if (editingId) {
      const { error } = await supabase.from("gestores").update(payload).eq("id", editingId);
      if (error) { toast.error("Error al actualizar gestor"); return; }
      toast.success("Gestor actualizado");
    }
    setEditingId(null);
    loadGestores();
  };

  const toggleActive = async (g: Gestor) => {
    await supabase.from("gestores").update({ is_active: !g.is_active }).eq("id", g.id);
    loadGestores();
  };

  const deleteGestor = async (id: string) => {
    if (!confirm("¿Eliminar este gestor?")) return;
    await supabase.from("gestores").delete().eq("id", id);
    toast.success("Gestor eliminado");
    loadGestores();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Gestores por zona</h3>
        <Button size="sm" className="gap-1.5" onClick={() => {
          setEditingId("new");
          setForm({ nombre: "", email: "", telefono: "", whatsapp: "", comunidades: "", provincias: "" });
        }}>
          <Plus className="w-4 h-4" /> Añadir gestor
        </Button>
      </div>

      {(editingId === "new" || editingId) && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
              <Input placeholder="WhatsApp" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <Input placeholder="CCAA (separadas por coma): Madrid, Cataluña..." value={form.comunidades} onChange={e => setForm({ ...form, comunidades: e.target.value })} />
            <Input placeholder="Provincias (separadas por coma): Madrid, Barcelona..." value={form.provincias} onChange={e => setForm({ ...form, provincias: e.target.value })} />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveGestor} className="gap-1.5"><Save className="w-3.5 h-3.5" /> Guardar</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-3.5 h-3.5" /> Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {gestores.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No hay gestores configurados</p>
          <p className="text-xs mt-1">Añade gestores y asígnales zonas geográficas</p>
        </div>
      )}

      <div className="space-y-2">
        {gestores.map((g) => (
          <Card key={g.id} className={!g.is_active ? "opacity-60" : ""}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground">{g.nombre}</p>
                  <Badge variant={g.is_active ? "default" : "secondary"} className="text-[10px]">
                    {g.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {g.email}</span>
                  {g.telefono && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {g.telefono}</span>}
                  {g.whatsapp && <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {g.whatsapp}</span>}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {g.comunidades_autonomas?.map(c => (
                    <Badge key={c} variant="outline" className="text-[10px]"><MapPin className="w-2.5 h-2.5 mr-0.5" />{c}</Badge>
                  ))}
                  {g.provincias?.map(p => (
                    <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="icon" variant="ghost" onClick={() => startEdit(g)}><Edit2 className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => toggleActive(g)}>
                  {g.is_active ? <XCircle className="w-4 h-4 text-muted-foreground" /> : <CheckCircle className="w-4 h-4 text-primary" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteGestor(g.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminGestores;

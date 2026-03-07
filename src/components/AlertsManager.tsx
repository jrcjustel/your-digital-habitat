import { useState } from "react";
import { Bell, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { saleTypes } from "@/data/properties";

interface AlertFilters {
  minDiscount?: number;
  minProfitability?: number;
  saleTypes?: string[];
  provinces?: string[];
  maxPrice?: number;
}

interface AlertsManagerProps {
  onCreated?: () => void;
}

const AlertsManager = ({ onCreated }: AlertsManagerProps) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [minDiscount, setMinDiscount] = useState(30);
  const [minProfitability, setMinProfitability] = useState(10);
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [selectedSaleTypes, setSelectedSaleTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleSaleType = (st: string) => {
    setSelectedSaleTypes(prev => prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Inicia sesión para crear alertas");
      return;
    }
    if (!name.trim()) {
      toast.error("Introduce un nombre para la alerta");
      return;
    }

    setSaving(true);
    const filters: AlertFilters = {};
    if (minDiscount > 0) filters.minDiscount = minDiscount;
    if (minProfitability > 0) filters.minProfitability = minProfitability;
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (selectedSaleTypes.length > 0) filters.saleTypes = selectedSaleTypes;

    const { error } = await supabase.from("alerts").insert({
      user_id: user.id,
      name: name.trim(),
      filters: filters as any,
      is_active: true,
    });

    setSaving(false);
    if (error) {
      toast.error("Error al crear la alerta");
    } else {
      toast.success("Alerta creada correctamente");
      setName("");
      setMinDiscount(30);
      setMinProfitability(10);
      setMaxPrice("");
      setSelectedSaleTypes([]);
      setShowForm(false);
      onCreated?.();
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent" />
          Alertas de Inversión
        </h3>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nueva alerta
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Configura alertas para recibir notificaciones cuando aparezcan activos que cumplan tus criterios.
      </p>

      {showForm && (
        <div className="bg-secondary rounded-xl p-5 space-y-4">
          <div>
            <Label className="text-xs">Nombre de la alerta</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Oportunidades NPL Madrid >30%" className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Descuento mínimo (%)</Label>
              <Input type="number" value={minDiscount} onChange={(e) => setMinDiscount(Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Rentabilidad mínima (%)</Label>
              <Input type="number" value={minProfitability} onChange={(e) => setMinProfitability(Number(e.target.value))} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Precio máximo (€)</Label>
              <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")} placeholder="Sin límite" className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-2 block">Tipos de venta</Label>
            <div className="flex flex-wrap gap-2">
              {saleTypes.map((st) => (
                <button
                  key={st.value}
                  onClick={() => toggleSaleType(st.value)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    selectedSaleTypes.includes(st.value)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-muted-foreground border-border hover:border-accent/50"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar alerta"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsManager;

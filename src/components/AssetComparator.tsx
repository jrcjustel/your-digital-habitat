import { useState, useRef, useCallback } from "react";
import { X, Plus, BarChart3, MapPin, Maximize, Target, Search, Loader2, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const MAX_COMPARE = 4;

interface CompareAsset {
  id: string;
  asset_id: string | null;
  municipio: string | null;
  provincia: string | null;
  comunidad_autonoma: string | null;
  tipo_activo: string | null;
  direccion: string | null;
  sqm: number | null;
  precio_orientativo: number | null;
  valor_mercado: number | null;
  deuda_ob: number | null;
  cesion_remate: boolean | null;
  cesion_credito: boolean | null;
  estado_ocupacional: string | null;
  estado_judicial: string | null;
  cartera: string | null;
}

const ComparatorSlot = ({
  asset,
  onRemove,
  onAdd,
  allSelectedIds,
}: {
  asset: CompareAsset | null;
  onRemove?: () => void;
  onAdd?: (a: CompareAsset) => void;
  allSelectedIds: string[];
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CompareAsset[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("npl_assets")
        .select("id, asset_id, municipio, provincia, comunidad_autonoma, tipo_activo, direccion, sqm, precio_orientativo, valor_mercado, deuda_ob, cesion_remate, cesion_credito, estado_ocupacional, estado_judicial, cartera")
        .eq("publicado", true)
        .or(`municipio.ilike.%${value}%,direccion.ilike.%${value}%,provincia.ilike.%${value}%,asset_id.ilike.%${value}%,tipo_activo.ilike.%${value}%`)
        .limit(12);
      setResults((data as CompareAsset[] || []).filter(a => !allSelectedIds.includes(a.id)));
      setSearching(false);
    }, 300);
  }, [allSelectedIds]);

  if (!asset) {
    return (
      <div className="relative bg-secondary/50 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center min-h-[420px] p-6">
        {showPicker ? (
          <div className="w-full space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar municipio, referencia, tipo..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-card rounded-lg pl-10 pr-3 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {searching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {!searching && results.length === 0 && search.length >= 2 && (
                <p className="text-xs text-muted-foreground text-center py-4">No se encontraron activos</p>
              )}
              {!searching && results.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { onAdd?.(a); setShowPicker(false); setSearch(""); setResults([]); }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/10 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {a.asset_id || a.tipo_activo || "Activo"} — {a.municipio || "Sin municipio"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {a.precio_orientativo ? `${a.precio_orientativo.toLocaleString("es-ES")} €` : "—"} · {a.provincia || ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => { setShowPicker(false); setSearch(""); setResults([]); }} className="text-xs text-muted-foreground hover:text-foreground">
              Cancelar
            </button>
          </div>
        ) : (
          <button onClick={() => setShowPicker(true)} className="flex flex-col items-center gap-3 text-muted-foreground hover:text-accent transition-colors">
            <Plus className="w-10 h-10" />
            <span className="text-sm font-medium">Añadir activo</span>
          </button>
        )}
      </div>
    );
  }

  const discount = asset.valor_mercado && asset.precio_orientativo && asset.valor_mercado > 0
    ? Math.round((1 - asset.precio_orientativo / asset.valor_mercado) * 100)
    : null;

  const eurPerSqm = asset.valor_mercado && asset.sqm && asset.sqm > 0
    ? Math.round(asset.valor_mercado / asset.sqm)
    : null;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden relative">
      {onRemove && (
        <button onClick={onRemove} className="absolute top-3 right-3 z-10 bg-card/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-destructive/10 transition-colors">
          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
        </button>
      )}
      {/* Header colored bar */}
      <div className="h-1.5 bg-gradient-to-r from-accent to-primary" />

      <div className="p-4 space-y-3">
        <div>
          {asset.asset_id && <span className="text-[10px] font-bold text-accent">{asset.asset_id}</span>}
          <h4 className="text-sm font-bold text-foreground leading-tight mt-0.5 line-clamp-2">
            {asset.tipo_activo || "Activo"} — {asset.municipio || "Sin municipio"}
          </h4>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {asset.direccion || `${asset.municipio || ""}, ${asset.provincia || ""}`}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <Row label="Tipo" value={asset.tipo_activo || "—"} />
          <Row label="Precio orient." value={asset.precio_orientativo ? `${asset.precio_orientativo.toLocaleString("es-ES")} €` : "—"} bold />
          <Row label="Valor mercado" value={asset.valor_mercado ? `${asset.valor_mercado.toLocaleString("es-ES")} €` : "—"} />
          {discount && discount > 0 && <Row label="Descuento" value={`-${discount}%`} accent />}
          <Row label="Deuda" value={asset.deuda_ob ? `${asset.deuda_ob.toLocaleString("es-ES")} €` : "—"} />
          <Row label="Superficie" value={asset.sqm ? `${asset.sqm.toLocaleString("es-ES")} m²` : "—"} />
          {eurPerSqm && <Row label="€/m²" value={`${eurPerSqm.toLocaleString("es-ES")} €`} />}
          <Row label="Provincia" value={asset.provincia || "—"} />
          <Row label="CCAA" value={asset.comunidad_autonoma || "—"} />
          <Row label="Ocupación" value={asset.estado_ocupacional || "—"} />
          <Row label="Estado judicial" value={asset.estado_judicial || "—"} />
          <Row label="CDR" value={asset.cesion_remate ? "Sí" : "No"} />
          <Row label="Cesión crédito" value={asset.cesion_credito ? "Sí" : "No"} />
          {asset.cartera && <Row label="Cartera" value={asset.cartera} />}
        </div>

        {discount && discount > 0 && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Descuento</span>
            </div>
            <p className="text-2xl font-bold text-accent">-{discount}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span className={`text-xs ${bold ? "font-bold text-foreground" : accent ? "font-bold text-accent" : "text-foreground"}`}>{value}</span>
  </div>
);

interface AssetComparatorProps {
  initialIds?: string[];
}

const AssetComparator = ({ initialIds = [] }: AssetComparatorProps) => {
  const [selected, setSelected] = useState<CompareAsset[]>([]);

  const addAsset = (asset: CompareAsset) => {
    if (selected.length < MAX_COMPARE && !selected.find(a => a.id === asset.id)) {
      setSelected([...selected, asset]);
    }
  };

  const removeAsset = (id: string) => {
    setSelected(selected.filter(a => a.id !== id));
  };

  const slots: (CompareAsset | null)[] = [...selected];
  while (slots.length < MAX_COMPARE) slots.push(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent" />
            Comparador de Activos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Busca y selecciona hasta {MAX_COMPARE} activos para comparar lado a lado</p>
        </div>
        {selected.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setSelected([])}>
            Limpiar
          </Button>
        )}
      </div>

      <div className={`grid gap-4 ${selected.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
        {slots.map((asset, i) => (
          <ComparatorSlot
            key={asset?.id || `empty-${i}`}
            asset={asset}
            onRemove={asset ? () => removeAsset(asset.id) : undefined}
            onAdd={!asset ? addAsset : undefined}
            allSelectedIds={selected.map(a => a.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AssetComparator;

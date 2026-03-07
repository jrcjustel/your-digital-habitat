import { useState } from "react";
import { X, Plus, BarChart3, TrendingUp, Shield, MapPin, Maximize, Bed, Bath, Target } from "lucide-react";
import { properties, saleTypes, occupancyLabels, type Property } from "@/data/properties";
import { autoValuateProperty } from "@/lib/valuationEngine";
import { Button } from "@/components/ui/button";

const MAX_COMPARE = 4;

const ComparatorSlot = ({
  property,
  onRemove,
  onAdd,
  allSelected,
}: {
  property: Property | null;
  onRemove?: () => void;
  onAdd?: () => void;
  allSelected: string[];
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  if (!property) {
    return (
      <div className="relative bg-secondary/50 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center min-h-[420px] p-6">
        {showPicker ? (
          <div className="w-full space-y-3">
            <input
              type="text"
              placeholder="Buscar por referencia o título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {properties
                .filter((p) => !allSelected.includes(p.id))
                .filter((p) => {
                  if (!search) return true;
                  const q = search.toLowerCase();
                  return `${p.title} ${p.reference} ${p.location}`.toLowerCase().includes(q);
                })
                .slice(0, 10)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { onAdd && (onAdd as any)(p.id); setShowPicker(false); setSearch(""); }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10 transition-colors text-left"
                  >
                    <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">{p.reference} — {p.title}</p>
                      <p className="text-[10px] text-muted-foreground">{p.price.toLocaleString("es-ES")} € · {p.province}</p>
                    </div>
                  </button>
                ))}
            </div>
            <button onClick={() => setShowPicker(false)} className="text-xs text-muted-foreground hover:text-foreground">
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

  const valuation = autoValuateProperty(property);
  const discount = property.marketValue ? Math.round(((property.marketValue - property.price) / property.marketValue) * 100) : 0;
  const saleLabel = saleTypes.find((s) => s.value === property.saleType)?.label || property.saleType;
  const scoreColor = valuation.opportunityScore.score >= 90
    ? "text-[hsl(142,71%,45%)]"
    : valuation.opportunityScore.score >= 70
    ? "text-accent"
    : valuation.opportunityScore.score >= 50
    ? "text-[hsl(48,90%,50%)]"
    : "text-destructive";

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden relative">
      {onRemove && (
        <button onClick={onRemove} className="absolute top-3 right-3 z-10 bg-card/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-destructive/10 transition-colors">
          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
        </button>
      )}
      <img src={property.images[0]} alt={property.title} className="w-full h-36 object-cover" />
      <div className="p-4 space-y-3">
        <div>
          <span className="text-[10px] font-bold text-accent">{property.reference}</span>
          <h4 className="text-sm font-bold text-foreground leading-tight mt-0.5 line-clamp-2">{property.title}</h4>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{property.municipality}, {property.province}</p>
        </div>

        <div className="space-y-2 text-sm">
          <Row label="Canal" value={saleLabel} />
          <Row label="Precio" value={`${property.price.toLocaleString("es-ES")} €`} bold />
          {property.marketValue && <Row label="Valor mercado" value={`${property.marketValue.toLocaleString("es-ES")} €`} />}
          {discount > 0 && <Row label="Descuento" value={`-${discount}%`} accent />}
          {property.profitability && <Row label="Rentabilidad" value={`${property.profitability}%`} accent />}
          <Row label="Superficie" value={`${property.area} m²`} />
          {property.bedrooms && <Row label="Dormitorios" value={`${property.bedrooms}`} />}
          <Row label="Ocupación" value={occupancyLabels[property.occupancyStatus]} />
          <Row label="Liquidez zona" value={valuation.zoneLiquidity} />
        </div>

        <div className="bg-secondary rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Scoring</span>
          </div>
          <p className={`text-2xl font-bold ${scoreColor}`}>{valuation.opportunityScore.score}</p>
          <p className={`text-xs font-semibold ${scoreColor}`}>{valuation.opportunityScore.label}</p>
        </div>
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
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds.slice(0, MAX_COMPARE));

  const addProperty = (id: string) => {
    if (selectedIds.length < MAX_COMPARE && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeProperty = (id: string) => {
    setSelectedIds(selectedIds.filter((sid) => sid !== id));
  };

  const slots = [...selectedIds];
  while (slots.length < MAX_COMPARE) slots.push("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent" />
            Comparador de Activos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Selecciona hasta {MAX_COMPARE} activos para comparar lado a lado</p>
        </div>
        {selectedIds.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
            Limpiar
          </Button>
        )}
      </div>

      <div className={`grid gap-4 ${selectedIds.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
        {slots.map((id, i) => {
          const prop = id ? properties.find((p) => p.id === id) || null : null;
          return (
            <ComparatorSlot
              key={i}
              property={prop}
              onRemove={prop ? () => removeProperty(id) : undefined}
              onAdd={!prop ? ((pid: string) => addProperty(pid)) as any : undefined}
              allSelected={selectedIds}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AssetComparator;

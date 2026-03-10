import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LeadStatus, LeadSource, LeadPriority } from "@/types/lead";
import { Search, Filter, X, TrendingUp, MapPin, Euro } from "lucide-react";

interface LeadFiltersProps {
  onFiltersChange?: (filters: LeadFilters) => void;
  className?: string;
}

export interface LeadFilters {
  search: string;
  status: LeadStatus[];
  source: LeadSource[];
  priority: LeadPriority[];
  scoreRange: [number, number];
  budgetRange: [number, number];
  locations: string[];
  assignedAgent: string[];
  dateRange: { from?: Date; to?: Date };
  tags: string[];
}

const defaultFilters: LeadFilters = {
  search: '', status: [], source: [], priority: [],
  scoreRange: [0, 100], budgetRange: [0, 2000000],
  locations: [], assignedAgent: [], dateRange: {}, tags: []
};

export const LeadFilters = ({ onFiltersChange, className }: LeadFiltersProps) => {
  const [filters, setFilters] = useState<LeadFilters>(defaultFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (newFilters: Partial<LeadFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange?.(updated);
  };

  const clearFilters = () => { setFilters(defaultFilters); onFiltersChange?.(defaultFilters); };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    count += filters.status.length + filters.source.length + filters.priority.length + filters.locations.length + filters.assignedAgent.length + filters.tags.length;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const statusOptions: { value: LeadStatus; label: string }[] = [
    { value: 'new', label: 'Nuevo' }, { value: 'contacted', label: 'Contactado' },
    { value: 'qualified', label: 'Cualificado' }, { value: 'meeting_scheduled', label: 'Reunión Programada' },
    { value: 'viewing_scheduled', label: 'Visita Programada' }, { value: 'proposal_sent', label: 'Propuesta Enviada' },
    { value: 'negotiating', label: 'Negociando' }, { value: 'closed_won', label: 'Cerrado Ganado' },
    { value: 'closed_lost', label: 'Cerrado Perdido' }, { value: 'nurturing', label: 'En Seguimiento' }
  ];

  const sourceOptions: { value: LeadSource; label: string }[] = [
    { value: 'website', label: 'Web Oficial' }, { value: 'idealista', label: 'Idealista' },
    { value: 'fotocasa', label: 'Fotocasa' }, { value: 'pisos_com', label: 'Pisos.com' },
    { value: 'portal', label: 'Portal Inmobiliario' }, { value: 'referral', label: 'Referido' },
    { value: 'social_media', label: 'Redes Sociales' }, { value: 'email_campaign', label: 'Campaña Email' },
    { value: 'phone_call', label: 'Llamada' }, { value: 'walk_in', label: 'Visita Oficina' },
    { value: 'event', label: 'Evento' }, { value: 'advertisement', label: 'Publicidad' }
  ];

  const priorityOptions: { value: LeadPriority; label: string }[] = [
    { value: 'low', label: 'Baja' }, { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' }, { value: 'urgent', label: 'Urgente' }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filtros de Leads
            {activeFiltersCount > 0 && <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-4 w-4 mr-1" />Limpiar</Button>}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? 'Contraer' : 'Expandir'}</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, email, teléfono..." value={filters.search} onChange={(e) => updateFilters({ search: e.target.value })} className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => updateFilters({ status: filters.status.includes('new') ? filters.status.filter(s => s !== 'new') : [...filters.status, 'new'] })} className={filters.status.includes('new') ? 'bg-primary text-primary-foreground' : ''}>Nuevos</Button>
          <Button variant="outline" size="sm" onClick={() => updateFilters({ priority: filters.priority.includes('urgent') ? filters.priority.filter(p => p !== 'urgent') : [...filters.priority, 'urgent'] })} className={filters.priority.includes('urgent') ? 'bg-destructive text-destructive-foreground' : ''}>Urgentes</Button>
          <Button variant="outline" size="sm" onClick={() => updateFilters({ scoreRange: filters.scoreRange[0] === 80 ? [0, 100] : [80, 100] })} className={filters.scoreRange[0] === 80 ? 'bg-green-500 text-white' : ''}><TrendingUp className="h-3 w-3 mr-1" />Alta Calidad</Button>
        </div>
        {isExpanded && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estado</Label>
                <Select value="" onValueChange={(value: LeadStatus) => updateFilters({ status: filters.status.includes(value) ? filters.status.filter(s => s !== value) : [...filters.status, value] })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                  <SelectContent>{statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                {filters.status.length > 0 && <div className="flex flex-wrap gap-1">{filters.status.map(s => <Badge key={s} variant="secondary" className="text-xs">{statusOptions.find(o => o.value === s)?.label}<X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilters({ status: filters.status.filter(x => x !== s) })} /></Badge>)}</div>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fuente</Label>
                <Select value="" onValueChange={(value: LeadSource) => updateFilters({ source: filters.source.includes(value) ? filters.source.filter(s => s !== value) : [...filters.source, value] })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar fuente" /></SelectTrigger>
                  <SelectContent>{sourceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Prioridad</Label>
                <Select value="" onValueChange={(value: LeadPriority) => updateFilters({ priority: filters.priority.includes(value) ? filters.priority.filter(p => p !== value) : [...filters.priority, value] })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar prioridad" /></SelectTrigger>
                  <SelectContent>{priorityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Puntuación IA ({filters.scoreRange[0]} - {filters.scoreRange[1]})</Label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Min" value={filters.scoreRange[0]} onChange={(e) => updateFilters({ scoreRange: [Number(e.target.value), filters.scoreRange[1]] })} className="w-20" min="0" max="100" />
                  <Input type="number" placeholder="Max" value={filters.scoreRange[1]} onChange={(e) => updateFilters({ scoreRange: [filters.scoreRange[0], Number(e.target.value)] })} className="w-20" min="0" max="100" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium"><Euro className="h-3 w-3 inline mr-1" />Presupuesto</Label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Min €" value={filters.budgetRange[0]} onChange={(e) => updateFilters({ budgetRange: [Number(e.target.value), filters.budgetRange[1]] })} className="w-24" />
                  <Input type="number" placeholder="Max €" value={filters.budgetRange[1]} onChange={(e) => updateFilters({ budgetRange: [filters.budgetRange[0], Number(e.target.value)] })} className="w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium"><MapPin className="h-3 w-3 inline mr-1" />Ubicaciones</Label>
                <Input placeholder="Madrid, Barcelona..." value={filters.locations.join(', ')} onChange={(e) => updateFilters({ locations: e.target.value.split(',').map(l => l.trim()).filter(Boolean) })} />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

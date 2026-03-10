import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lead, getLeadSourceLabel, getLeadStatusLabel, getLeadStatusColor, getLeadPriorityColor } from "@/types/lead";
import { Phone, Mail, MessageSquare, Calendar, Star, TrendingUp, MapPin, Euro, Clock, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface LeadCardProps {
  lead: Lead;
  onView?: (lead: Lead) => void;
  onContact?: (lead: Lead, method: 'phone' | 'email' | 'whatsapp') => void;
  onSchedule?: (lead: Lead) => void;
  className?: string;
}

export const LeadCard = ({ lead, onView, onContact, onSchedule, className }: LeadCardProps) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, notation: 'compact' }).format(price);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const isUrgent = lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) < new Date();
  const lastContact = lead.lastContactAt
    ? formatDistanceToNow(new Date(lead.lastContactAt), { addSuffix: true, locale: es })
    : 'Sin contacto';

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-300 border-l-4",
      getLeadStatusColor(lead.status).replace('bg-', 'border-l-'),
      isUrgent && "ring-2 ring-red-500/50",
      className
    )}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/avatars/${lead.id}.jpg`} />
              <AvatarFallback className="text-sm">{lead.firstName[0]}{lead.lastName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-base">{lead.firstName} {lead.lastName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>#{lead.reference}</span><span>•</span><span>{getLeadSourceLabel(lead.source)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
            <Badge variant="outline" className={cn("text-xs", getLeadPriorityColor(lead.priority))}>{lead.priority.toUpperCase()}</Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge className={cn("border-0", getLeadStatusColor(lead.status))}>{getLeadStatusLabel(lead.status)}</Badge>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /><span className={cn("font-medium", getScoreColor(lead.score))}>{lead.score}</span></div>
            {lead.aiAnalysis?.conversionProbability && (
              <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-500" /><span className="text-green-600 font-medium">{lead.aiAnalysis.conversionProbability}%</span></div>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3 w-3" /><span className="truncate">{lead.email}</span></div>
          <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3 w-3" /><span>{lead.phone}</span></div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm"><Euro className="h-3 w-3 text-muted-foreground" /><span>{formatPrice(lead.budget.min)} - {formatPrice(lead.budget.max)}</span></div>
          {lead.propertyPreferences.locations.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-3 w-3" /><span className="truncate">{lead.propertyPreferences.locations.slice(0, 2).join(', ')}{lead.propertyPreferences.locations.length > 2 && '...'}</span></div>
          )}
        </div>

        {lead.aiAnalysis?.nextBestAction && (
          <div className="p-2 bg-accent/10 rounded-md border border-accent/20">
            <div className="flex items-center gap-2 text-xs"><Sparkles className="h-3 w-3 text-accent" /><span className="text-accent font-medium">IA Recomienda:</span></div>
            <p className="text-xs text-muted-foreground mt-1">{lead.aiAnalysis.nextBestAction}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /><span>{lastContact}</span></div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => onContact?.(lead, 'phone')} className="h-7 px-2"><Phone className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" onClick={() => onContact?.(lead, 'email')} className="h-7 px-2"><Mail className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" onClick={() => onContact?.(lead, 'whatsapp')} className="h-7 px-2"><MessageSquare className="h-3 w-3" /></Button>
            <Button size="sm" variant="outline" onClick={() => onSchedule?.(lead)} className="h-7 px-2"><Calendar className="h-3 w-3" /></Button>
          </div>
        </div>

        {lead.assignedAgent && (
          <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
            <span>Asignado a:</span><span className="font-medium">{lead.assignedAgent.name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

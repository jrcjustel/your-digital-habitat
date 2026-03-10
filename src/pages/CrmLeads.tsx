import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadCard } from "@/components/leads/lead-card";
import { LeadFilters, LeadFilters as LeadFiltersType } from "@/components/leads/lead-filters";
import { ImboxPanel } from "@/components/leads/imbox-panel";
import { Lead } from "@/types/lead";
import { Plus, Users, TrendingUp, Clock, Target, Download, Upload, BarChart3, MessageSquare, Grid3X3, List } from "lucide-react";
import { cn } from "@/lib/utils";

const mockLeads: Lead[] = [
  {
    id: 'lead-1', reference: 'LD-2024-001', firstName: 'Ana', lastName: 'García López',
    email: 'ana.garcia@email.com', phone: '+34 666 123 456', source: 'idealista',
    status: 'qualified', score: 85, priority: 'high',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), updatedAt: new Date(),
    lastContactAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    nextFollowUpAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    preferredContact: 'whatsapp', interestedProperties: ['prop-1', 'prop-2'],
    budget: { min: 400000, max: 550000, currency: 'EUR' },
    propertyPreferences: { type: ['apartment'], locations: ['Salamanca', 'Chamberí'], characteristics: { minSurface: 80, bedrooms: 3, bathrooms: 2, parking: true } },
    aiAnalysis: { conversionProbability: 78, qualificationScore: 85, buyingUrgency: 'high', financialCapacity: 'verified', recommendations: ['Priorizar visitas en Salamanca', 'Enviar comparativas de mercado'], nextBestAction: 'Llamar para agendar visita presencial esta semana' },
    assignedAgent: { id: 'agent-1', name: 'Carlos Mendoza', email: 'carlos@ikesa.com' },
    activities: [], notes: [], tags: ['VIP', 'Salamanca']
  },
  {
    id: 'lead-2', reference: 'LD-2024-002', firstName: 'Miguel', lastName: 'Rodríguez',
    email: 'miguel.rodriguez@email.com', phone: '+34 677 987 654', source: 'website',
    status: 'new', score: 65, priority: 'medium',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), updatedAt: new Date(),
    preferredContact: 'phone', interestedProperties: ['prop-3'],
    budget: { min: 250000, max: 350000, currency: 'EUR' },
    propertyPreferences: { type: ['house'], locations: ['Majadahonda', 'Las Rozas'], characteristics: { minSurface: 120, bedrooms: 4, bathrooms: 2, parking: true } },
    aiAnalysis: { conversionProbability: 45, qualificationScore: 65, buyingUrgency: 'medium', financialCapacity: 'estimated', recommendations: ['Verificar capacidad financiera'], nextBestAction: 'Enviar email con opciones similares' },
    activities: [], notes: [], tags: ['Primera vivienda']
  },
  {
    id: 'lead-3', reference: 'LD-2024-003', firstName: 'Laura', lastName: 'Martínez',
    email: 'laura.martinez@email.com', phone: '+34 655 444 333', source: 'referral',
    status: 'proposal_sent', score: 92, priority: 'urgent',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), updatedAt: new Date(),
    lastContactAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextFollowUpAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    preferredContact: 'email', interestedProperties: ['prop-4'],
    budget: { min: 800000, max: 1200000, currency: 'EUR' },
    propertyPreferences: { type: ['penthouse'], locations: ['Retiro', 'Jerónimos'], characteristics: { minSurface: 150, bedrooms: 4, bathrooms: 3, parking: true } },
    aiAnalysis: { conversionProbability: 88, qualificationScore: 92, buyingUrgency: 'high', financialCapacity: 'verified', recommendations: ['Seguimiento de propuesta urgente'], nextBestAction: 'Llamar URGENTE - Propuesta vence hoy' },
    assignedAgent: { id: 'agent-2', name: 'Isabel Fernández', email: 'isabel@ikesa.com' },
    activities: [], notes: [], tags: ['VIP', 'Inversión', 'Urgente']
  }
];

export default function CrmLeads() {
  const [activeTab, setActiveTab] = useState('list');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<LeadFiltersType | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = mockLeads.filter(lead => {
    if (!filters) return true;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!(lead.firstName.toLowerCase().includes(s) || lead.lastName.toLowerCase().includes(s) || lead.email.toLowerCase().includes(s) || lead.phone.includes(s) || lead.reference.toLowerCase().includes(s))) return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(lead.status)) return false;
    if (filters.source.length > 0 && !filters.source.includes(lead.source)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(lead.priority)) return false;
    if (lead.score < filters.scoreRange[0] || lead.score > filters.scoreRange[1]) return false;
    return true;
  });

  const stats = {
    total: mockLeads.length,
    new: mockLeads.filter(l => l.status === 'new').length,
    qualified: mockLeads.filter(l => l.status === 'qualified').length,
    urgent: mockLeads.filter(l => l.priority === 'urgent').length,
    highScore: mockLeads.filter(l => l.score >= 80).length,
    avgScore: Math.round(mockLeads.reduce((sum, l) => sum + l.score, 0) / mockLeads.length),
    avgConversion: mockLeads.filter(l => l.aiAnalysis?.conversionProbability).reduce((sum, l, _, arr) => sum + (l.aiAnalysis?.conversionProbability || 0) / arr.length, 0)
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Gestión de Leads | IKESA" description="CRM de leads con análisis IA" canonical="/crm/leads" />
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading">Lead Management</h1>
            <p className="text-muted-foreground">Gestión integral de leads y comunicaciones omnicanal</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exportar</Button>
            <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Importar</Button>
            <Button><Plus className="h-4 w-4 mr-2" />Nuevo Lead</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Total Leads', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Nuevos', value: stats.new, icon: Clock, color: 'text-blue-600' },
            { label: 'Cualificados', value: stats.qualified, icon: Target, color: 'text-green-600' },
            { label: 'Urgentes', value: stats.urgent, icon: TrendingUp, color: 'text-red-600' },
            { label: 'Alta Calidad', value: stats.highScore, icon: BarChart3, color: 'text-purple-600' },
            { label: 'Score Medio', value: stats.avgScore, icon: TrendingUp, color: 'text-orange-600' },
            { label: 'Conversión IA', value: `${Math.round(stats.avgConversion)}%`, icon: TrendingUp, color: 'text-emerald-600' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list"><List className="h-4 w-4 mr-2" />Lista de Leads</TabsTrigger>
            <TabsTrigger value="imbox"><MessageSquare className="h-4 w-4 mr-2" />IMBOX<Badge variant="secondary" className="ml-2">3</Badge></TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-2" />Analítica</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <LeadFilters onFiltersChange={setFilters} />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{filteredLeads.length} de {mockLeads.length} leads</span>
              <div className="flex items-center gap-2">
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}><Grid3X3 className="h-4 w-4" /></Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className={cn("gap-6", viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4")}>
              {filteredLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onView={(l) => { setSelectedLead(l); setActiveTab('imbox'); }} onContact={(l, m) => console.log(`Contact ${l.firstName} via ${m}`)} onSchedule={(l) => console.log(`Schedule with ${l.firstName}`)} className={viewMode === 'list' ? 'max-w-none' : ''} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="imbox"><ImboxPanel leadId={selectedLead?.id} /></TabsContent>
          <TabsContent value="analytics"><Card><CardHeader><CardTitle>Analítica de Leads</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Panel de analítica avanzada en desarrollo...</p></CardContent></Card></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

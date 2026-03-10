import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, Star, Archive, Clock, Search, User, Phone, Mail, MessageSquare } from "lucide-react";

const mockLeads = [
  { id: 1, name: "Carlos Menéndez", email: "carlos@inv.es", phone: "+34 612 345 678", interest: "NPL Madrid", score: 85, status: "Nuevo", time: "Hace 10 min", source: "Web" },
  { id: 2, name: "Inversiones Levante SL", email: "info@invlevante.es", phone: "+34 961 234 567", interest: "Cesión Remate Valencia", score: 72, status: "Contactado", time: "Hace 1h", source: "WhatsApp" },
  { id: 3, name: "Ana Martínez", email: "ana.m@gmail.com", phone: "+34 655 987 654", interest: "Vivienda Barcelona", score: 60, status: "Cualificado", time: "Hace 3h", source: "Formulario" },
  { id: 4, name: "Pedro Sánchez Inv.", email: "pedro@sanchez.es", phone: "+34 678 111 222", interest: "Cartera NPL", score: 92, status: "Negociando", time: "Ayer", source: "Referido" },
];

const LeadInboxPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Bandeja de Leads | IKESA Admin" description="Gestión centralizada de leads e inversores" canonical="/admin/leads-inbox" />
      <Navbar />
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2"><Inbox className="h-8 w-8 text-primary" /><h1 className="text-4xl font-bold font-heading">Bandeja de Leads</h1></div>
          <p className="text-xl text-muted-foreground">Gestión centralizada de leads, consultas e inversores potenciales</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Nuevos Hoy", value: "8", icon: Inbox },
            { label: "Pendientes", value: "15", icon: Clock },
            { label: "Destacados", value: "4", icon: Star },
            { label: "Score Promedio", value: "74", icon: User },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 flex items-center gap-4"><s.icon className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></CardContent></Card>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-10" placeholder="Buscar leads..." /></div>
          <Button variant="outline">Filtrar</Button>
          <Button>Exportar</Button>
        </div>

        <div className="space-y-3">
          {mockLeads.map(lead => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{lead.name.charAt(0)}</div>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.interest}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{lead.source}</Badge>
                        <Badge variant={lead.status === "Nuevo" ? "default" : lead.status === "Negociando" ? "destructive" : "secondary"}>{lead.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{lead.time}</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${lead.score >= 80 ? "text-primary" : lead.score >= 60 ? "text-accent" : "text-muted-foreground"}`}>{lead.score}</div>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LeadInboxPage;

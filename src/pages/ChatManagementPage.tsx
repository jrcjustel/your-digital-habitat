import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Bot, Clock, Search, Archive, Star } from "lucide-react";

const mockConversations = [
  { id: 1, user: "Carlos Pérez", lastMsg: "¿Cuál es el estado del activo IKE-679?", time: "Hace 5 min", channel: "Web", status: "Abierta", priority: "alta" },
  { id: 2, user: "María López", lastMsg: "Necesito documentación del NPL", time: "Hace 20 min", channel: "WhatsApp", status: "Pendiente", priority: "media" },
  { id: 3, user: "Inversiones Alcalá SL", lastMsg: "Queremos presentar oferta formal", time: "Hace 1h", channel: "Email", status: "Abierta", priority: "alta" },
  { id: 4, user: "Ana García", lastMsg: "Gracias por la información", time: "Hace 3h", channel: "Telegram", status: "Cerrada", priority: "baja" },
];

const ChatManagementPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Gestión de Chats | IKESA Admin" description="Panel de gestión de conversaciones y chats" canonical="/admin/chats" />
      <Navbar />

      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2"><MessageSquare className="h-8 w-8 text-primary" /><h1 className="text-4xl font-bold font-heading">Gestión de Chats</h1></div>
          <p className="text-xl text-muted-foreground">Centraliza todas las conversaciones con clientes e inversores</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Conversaciones Activas", value: "12", icon: MessageSquare, color: "text-primary" },
            { label: "Pendientes de Respuesta", value: "5", icon: Clock, color: "text-destructive" },
            { label: "Atendidas por IA", value: "67%", icon: Bot, color: "text-accent" },
            { label: "Usuarios Conectados", value: "8", icon: Users, color: "text-primary" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-4">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="archived">Archivadas</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-10" placeholder="Buscar conversaciones..." /></div>
            </div>
            <div className="space-y-3">
              {mockConversations.map(c => (
                <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
                      <div>
                        <p className="font-medium">{c.user}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-md">{c.lastMsg}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{c.channel}</Badge>
                      <Badge variant={c.priority === "alta" ? "destructive" : c.priority === "media" ? "default" : "secondary"}>{c.priority}</Badge>
                      <Badge variant={c.status === "Abierta" ? "default" : c.status === "Pendiente" ? "secondary" : "outline"}>{c.status}</Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{c.time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="pending"><p className="text-center py-12 text-muted-foreground">Conversaciones pendientes de respuesta aparecerán aquí</p></TabsContent>
          <TabsContent value="archived"><p className="text-center py-12 text-muted-foreground">Conversaciones archivadas</p></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default ChatManagementPage;

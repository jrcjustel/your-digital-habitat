import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, MessageSquare, Users, Bell, CheckCircle } from "lucide-react";

const NewsletterPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Newsletter y Comunicaciones | IKESA" description="Suscríbete a nuestras newsletters y canales de difusión" canonical="/newsletter" />
      <Navbar />
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold font-heading mb-2">Newsletter y Comunicaciones</h1>
          <p className="text-xl text-muted-foreground">Mantente informado de las últimas oportunidades inmobiliarias</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="newsletter">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="channels">Canales de Difusión</TabsTrigger>
          </TabsList>

          <TabsContent value="newsletter" className="mt-6 space-y-6">
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <Mail className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle className="text-2xl">Suscríbete a IKESA Insights</CardTitle>
                <CardDescription>Recibe análisis de mercado, nuevas oportunidades y alertas personalizadas</CardDescription>
              </CardHeader>
              <CardContent className="max-w-md mx-auto space-y-4">
                <div><Label>Nombre</Label><Input placeholder="Tu nombre" /></div>
                <div><Label>Email</Label><Input type="email" placeholder="tu@email.com" /></div>
                <div className="space-y-2">
                  {["Nuevos activos disponibles", "Análisis de mercado semanal", "Alertas de subastas BOE", "Webinars y formación"].map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" defaultChecked />{opt}</label>
                  ))}
                </div>
                <Button className="w-full"><Send className="h-4 w-4 mr-2" />Suscribirme</Button>
                <p className="text-xs text-center text-muted-foreground">Puedes cancelar en cualquier momento. Respetamos tu privacidad.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { name: "WhatsApp", desc: "Alertas instantáneas de nuevos activos", icon: MessageSquare, subs: "1.2K", color: "bg-green-500" },
                { name: "Telegram", desc: "Canal de inversores con análisis diarios", icon: Send, subs: "850", color: "bg-blue-500" },
                { name: "LinkedIn", desc: "Contenido profesional y networking", icon: Users, subs: "3.4K", color: "bg-blue-700" },
                { name: "Alertas Email", desc: "Notificaciones personalizadas por email", icon: Bell, subs: "2.1K", color: "bg-primary" },
              ].map(ch => (
                <Card key={ch.name} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-lg ${ch.color} flex items-center justify-center`}><ch.icon className="h-6 w-6 text-white" /></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{ch.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{ch.desc}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{ch.subs} suscriptores</Badge>
                        <Button size="sm">Unirse</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default NewsletterPage;

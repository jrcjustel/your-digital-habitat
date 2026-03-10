import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Send, Users, BarChart3, Instagram, Phone, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const channels = [
  { name: 'Email', icon: Mail, subscribers: 2450, openRate: '32%', status: 'active' },
  { name: 'WhatsApp', icon: Phone, subscribers: 890, openRate: '78%', status: 'active' },
  { name: 'Telegram', icon: Send, subscribers: 1200, openRate: '45%', status: 'active' },
  { name: 'Instagram', icon: Instagram, subscribers: 5600, openRate: '12%', status: 'active' },
  { name: 'Web Push', icon: Globe, subscribers: 3200, openRate: '22%', status: 'active' },
];

const CommunicationsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold">📢 Centro de Comunicaciones</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Gestión centralizada de todos los canales de difusión</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {channels.map(ch => (
          <Card key={ch.name}>
            <CardContent className="p-4 text-center">
              <ch.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">{ch.name}</h3>
              <p className="text-2xl font-bold mt-1">{ch.subscribers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Suscriptores</p>
              <Badge variant="outline" className="mt-2">Open: {ch.openRate}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard General</TabsTrigger>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <Card><CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[{ label: 'Total Suscriptores', value: '13.3K' }, { label: 'Mensajes Enviados', value: '45.2K' }, { label: 'Tasa Media Apertura', value: '37.8%' }, { label: 'Conversiones', value: '2.4%' }].map(s => (
                <div key={s.label}><p className="text-3xl font-bold text-primary">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="campaigns" className="mt-6"><Card><CardContent className="p-6 text-center py-12"><Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Gestión de campañas multicanal en desarrollo</p></CardContent></Card></TabsContent>
        <TabsContent value="analytics" className="mt-6"><Card><CardContent className="p-6 text-center py-12"><BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Analíticas avanzadas en desarrollo</p></CardContent></Card></TabsContent>
      </Tabs>
    </div>
    <Footer />
  </div>
);

export default CommunicationsPage;

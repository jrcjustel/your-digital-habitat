import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Linkedin, Users, Globe, TrendingUp, MessageSquare, Award, Briefcase, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ProfessionalNetworkPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="bg-gradient-to-br from-blue-50 via-background to-blue-50/30 py-16">
      <div className="container mx-auto px-4 text-center space-y-4">
        <div className="flex items-center justify-center gap-3"><Linkedin className="h-8 w-8 text-blue-600" /><h1 className="text-4xl font-bold">IKESA Professional Network</h1></div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Red profesional de expertos en inversión inmobiliaria, activos distressed y oportunidades de mercado</p>
      </div>
    </div>

    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-6 md:grid-cols-4 mb-12">
        {[{ label: 'Profesionales', value: '2,500+', icon: Users }, { label: 'Empresas', value: '450+', icon: Briefcase }, { label: 'Países', value: '12', icon: Globe }, { label: 'Publicaciones', value: '8,900+', icon: MessageSquare }].map(s => (
          <Card key={s.label}><CardContent className="p-6 text-center"><s.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" /><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="network">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="network">Red de Contactos</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>
        <TabsContent value="network" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[{ name: 'María López', role: 'Directora de Inversiones', company: 'Capital Real Estate', location: 'Madrid' }, { name: 'Javier Moreno', role: 'Abogado Inmobiliario', company: 'Moreno & Partners', location: 'Barcelona' }, { name: 'Laura Díaz', role: 'Analista de Carteras NPL', company: 'Distressed Capital', location: 'Valencia' }].map(p => (
              <Card key={p.name} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">{p.name[0]}</div><div><h3 className="font-semibold">{p.name}</h3><p className="text-sm text-muted-foreground">{p.role}</p></div></div>
                  <p className="text-sm text-muted-foreground mb-4">{p.company} · {p.location}</p>
                  <Button variant="outline" className="w-full" size="sm">Conectar</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="content" className="mt-6"><Card><CardContent className="p-6 text-center py-12"><MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Feed de contenido profesional en desarrollo</p></CardContent></Card></TabsContent>
        <TabsContent value="events" className="mt-6"><Card><CardContent className="p-6 text-center py-12"><Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">Calendario de eventos profesionales en desarrollo</p></CardContent></Card></TabsContent>
      </Tabs>
    </div>
    <Footer />
  </div>
);

export default ProfessionalNetworkPage;

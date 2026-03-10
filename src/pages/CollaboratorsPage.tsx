import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Award, Phone, Mail, MapPin, Star } from "lucide-react";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const collaboratorTypes = [
  { id: "asesores", title: "Asesores Especialistas", description: "Profesionales especializados en inversión inmobiliaria", count: 45 },
  { id: "abogados", title: "Abogados", description: "Expertos en derecho inmobiliario y fiscal", count: 32 },
  { id: "procuradores", title: "Procuradores", description: "Gestión de procesos judiciales y subastas", count: 28 },
  { id: "gestorias", title: "Gestorías", description: "Tramitación administrativa y fiscal", count: 18 },
  { id: "tasadoras", title: "Tasadoras", description: "Valoraciones oficiales homologadas", count: 15 },
  { id: "reformas", title: "Obras y Reformas", description: "Constructoras especializadas en rehabilitación", count: 35 },
];

const featuredCollaborators = [
  { id: "1", name: "García & Asociados", type: "Asesoría Legal", rating: 4.9, reviews: 127, location: "Madrid", specialties: ["Derecho Inmobiliario", "Subastas", "NPL"], phone: "+34 91 123 45 67", email: "info@garciaasociados.es", verified: true, ikesaPartner: true },
  { id: "2", name: "Valoraciones Técnicas SL", type: "Tasadora Homologada", rating: 4.8, reviews: 89, location: "Barcelona", specialties: ["Valoración Inmobiliaria", "Peritaciones"], phone: "+34 93 987 65 43", email: "contacto@valtecnicas.es", verified: true, ikesaPartner: true },
];

const CollaboratorsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="border-b bg-card"><div className="container py-8"><div className="flex items-center gap-3 mb-4"><Users className="h-8 w-8 text-primary" /><h1 className="text-4xl font-bold">Red de Colaboradores</h1></div><p className="text-xl text-muted-foreground max-w-3xl">Los mejores profesionales avalados por IKESA. Tarifas bonificadas exclusivas para usuarios de nuestra plataforma.</p></div></div>

    <section className="py-12"><div className="container">
      <div className="text-center mb-12"><h2 className="text-3xl font-bold mb-4">Encuentra tu especialista</h2></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collaboratorTypes.map(t => (
          <Card key={t.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader><div className="flex justify-between items-start"><CardTitle className="text-lg">{t.title}</CardTitle><Badge variant="secondary">{t.count}</Badge></div><CardDescription>{t.description}</CardDescription></CardHeader>
            <CardContent><Button className="w-full">Ver Profesionales</Button></CardContent>
          </Card>
        ))}
      </div>
    </div></section>

    <section className="py-12 bg-muted/30"><div className="container">
      <div className="text-center mb-12"><h2 className="text-3xl font-bold mb-4">Colaboradores Destacados</h2></div>
      <div className="space-y-8">
        {featuredCollaborators.map(c => (
          <Card key={c.id}><CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-2/3 space-y-4">
                <div className="flex items-start justify-between">
                  <div><div className="flex items-center gap-2 mb-2"><h3 className="text-xl font-bold">{c.name}</h3>{c.verified && <Badge variant="secondary" className="bg-green-100 text-green-800"><Shield className="h-3 w-3 mr-1" />Verificado</Badge>}{c.ikesaPartner && <Badge className="bg-primary/10 text-primary border-primary/20">Partner IKESA</Badge>}</div><p className="text-muted-foreground font-medium">{c.type}</p></div>
                  <div className="text-right"><div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-bold">{c.rating}</span><span className="text-sm text-muted-foreground">({c.reviews})</span></div><div className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><MapPin className="h-3 w-3" />{c.location}</div></div>
                </div>
                <div className="flex flex-wrap gap-2">{c.specialties.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>
                <div className="flex gap-4 items-center"><div className="space-y-1"><div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{c.phone}</div><div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{c.email}</div></div><div className="flex gap-2 ml-auto"><Button variant="outline" size="sm">Ver Perfil</Button><Button size="sm">Contactar</Button></div></div>
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div></section>
    <Footer />
  </div>
);

export default CollaboratorsPage;

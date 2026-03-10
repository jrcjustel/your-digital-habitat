import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, Building, MapPin, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const testimonials = [
  { name: 'Carlos Martínez', role: 'Inversor Profesional', location: 'Madrid', rating: 5, text: 'IKESA ha transformado mi forma de invertir en inmobiliario. La plataforma me ha permitido acceder a oportunidades que antes eran inaccesibles.', investment: '€2.5M', yield: '18%' },
  { name: 'Ana García López', role: 'Family Office', location: 'Barcelona', rating: 5, text: 'El equipo jurídico de IKESA nos acompañó en todo el proceso de adquisición de una cartera NPL. Profesionalidad y transparencia total.', investment: '€5M', yield: '22%' },
  { name: 'Roberto Fernández', role: 'Inversor Particular', location: 'Valencia', rating: 4, text: 'Mi primera inversión en cesiones de remate fue un éxito gracias al asesoramiento personalizado. Recuperé la inversión en 14 meses.', investment: '€180K', yield: '15%' },
  { name: 'Patricia Sánchez', role: 'Gestora de Fondos', location: 'Sevilla', rating: 5, text: 'La tecnología IA de IKESA para valoraciones es impresionante. Nos ahorra semanas de análisis manual en cada operación.', investment: '€8M', yield: '20%' },
];

const TestimonialsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Testimonios de Inversores</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Descubre las experiencias de quienes ya confían en IKESA para sus inversiones inmobiliarias</p>
        <div className="flex justify-center gap-6 mt-6">
          {[{ label: 'Inversores satisfechos', value: '500+' }, { label: 'Operaciones cerradas', value: '1,200+' }, { label: 'Rentabilidad media', value: '16.5%' }].map(s => (
            <div key={s.label} className="text-center"><p className="text-3xl font-bold text-primary">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {testimonials.map((t, i) => (
          <Card key={i} className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Quote className="h-8 w-8 text-primary/30 flex-shrink-0 mt-1" />
                <div className="space-y-4">
                  <p className="text-muted-foreground italic">"{t.text}"</p>
                  <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`h-4 w-4 ${j < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />)}</div>
                  <div className="flex items-center justify-between">
                    <div><p className="font-semibold">{t.name}</p><p className="text-sm text-muted-foreground">{t.role}</p><div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{t.location}</div></div>
                    <div className="text-right"><p className="text-sm font-medium">{t.investment}</p><p className="text-sm text-green-600 font-bold">+{t.yield}</p></div>
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

export default TestimonialsPage;

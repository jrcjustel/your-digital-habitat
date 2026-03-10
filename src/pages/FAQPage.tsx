import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Building, Scale, Shield, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const faqCategories = [
  { title: 'Inversión Inmobiliaria', icon: Building, faqs: [
    { q: '¿Qué es una cesión de remate?', a: 'La cesión de remate es un mecanismo jurídico por el cual el adjudicatario de una subasta cede su derecho de adjudicación a un tercero, permitiendo que el cesionario adquiera el bien en las mismas condiciones.' },
    { q: '¿Qué es un NPL (Non-Performing Loan)?', a: 'Un NPL es un préstamo impagado o en mora. En el sector inmobiliario, los NPLs representan oportunidades de inversión al permitir adquirir créditos con garantía hipotecaria a precios inferiores a su valor nominal.' },
    { q: '¿Cuál es el proceso de inversión en IKESA?', a: 'El proceso incluye: 1) Registro y verificación KYC, 2) Exploración de oportunidades, 3) Due diligence con nuestro equipo, 4) Firma de NDA si es necesario, 5) Presentación de oferta, 6) Cierre de la operación.' },
  ]},
  { title: 'Legal y Regulatorio', icon: Scale, faqs: [
    { q: '¿Qué garantías legales ofrece IKESA?', a: 'IKESA cumple con toda la normativa vigente, incluyendo el RGPD, la Ley de Protección de Datos, y la normativa de prevención de blanqueo de capitales. Contamos con un equipo jurídico especializado.' },
    { q: '¿Es necesario firmar un NDA?', a: 'Sí, para acceder a información confidencial de las operaciones es necesario firmar un Acuerdo de Confidencialidad (NDA) que protege tanto al inversor como a las partes involucradas.' },
  ]},
  { title: 'Seguridad y Privacidad', icon: Shield, faqs: [
    { q: '¿Cómo protegen mis datos personales?', a: 'Utilizamos cifrado de extremo a extremo, servidores seguros en la UE, y cumplimos estrictamente con el RGPD. Los datos se almacenan de forma segura y solo se utilizan para los fines declarados.' },
    { q: '¿Puedo solicitar la eliminación de mis datos?', a: 'Sí, conforme al RGPD tiene derecho a solicitar la eliminación de sus datos personales a través de nuestro Centro de Privacidad RGPD.' },
  ]},
  { title: 'Rentabilidad y Riesgos', icon: TrendingUp, faqs: [
    { q: '¿Qué rentabilidad puedo esperar?', a: 'La rentabilidad varía según el tipo de operación y las condiciones del mercado. Las inversiones en NPLs y cesiones de remate pueden ofrecer retornos del 10-20%, pero cada caso es único y debe analizarse individualmente.' },
    { q: '¿Cuáles son los principales riesgos?', a: 'Los riesgos incluyen: fluctuaciones del mercado inmobiliario, problemas legales, ocupación ilegal, retrasos en procedimientos judiciales, y costes de rehabilitación no previstos.' },
  ]},
];

const FAQPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center space-y-4 mb-12">
        <div className="flex justify-center mb-4"><div className="p-4 bg-primary/10 rounded-full"><HelpCircle className="h-12 w-12 text-primary" /></div></div>
        <h1 className="text-4xl font-bold">Preguntas Frecuentes</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Todo lo que necesitas saber sobre inversión inmobiliaria con IKESA</p>
      </div>

      <div className="space-y-8">
        {faqCategories.map((cat, i) => (
          <Card key={i}>
            <CardHeader><CardTitle className="flex items-center gap-2"><cat.icon className="h-5 w-5 text-primary" />{cat.title}</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {cat.faqs.map((faq, j) => (
                  <AccordionItem key={j} value={`${i}-${j}`}>
                    <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default FAQPage;

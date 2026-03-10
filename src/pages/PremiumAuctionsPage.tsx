import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Gavel, MapPin, Euro, Clock, Shield, FileText, TrendingUp, Building2, Users, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

const mockProperty = {
  ref: "IKE-679", title: "Los Puertas", location: "Málaga, Andalucía",
  deuda: 169020, valorMercado: 97200, precioMinimo: 46000, deposito: 6.05, comision: 5.0,
  sqm: 162, sqmSuelo: 603, year: 2009, ocupacion: "No disponible",
  judicial: { tipo: "Ejecución hipotecaria", juzgado: "1ª Instancia nº1 Archidona", fase: "Demanda Presentada", autos: "19/2024" },
  endDate: new Date(Date.now() + 4 * 86400000),
};

const processSteps = [
  { step: 1, title: "Selección del activo", desc: "Identifica la oportunidad de inversión" },
  { step: 2, title: "Due Diligence", desc: "Análisis jurídico, registral y de mercado" },
  { step: 3, title: "NDA y Documentación", desc: "Acceso a información confidencial" },
  { step: 4, title: "Presentación de Oferta", desc: "Oferta formal con depósito" },
  { step: 5, title: "Negociación y Cierre", desc: "Formalización de la operación" },
];

const PremiumAuctionsPage = () => {
  const fmt = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Subastas Premium | IKESA" description="Oportunidades de inversión premium con análisis completo" canonical="/subastas-premium" />
      <Navbar />

      {/* Process Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Proceso de Inversión IKESA</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {processSteps.map(s => (
              <div key={s.step} className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto font-bold text-lg">{s.step}</div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Modalidades IKESA</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Cesión de Remate", desc: "Adquisición de inmuebles mediante la cesión del derecho de remate en subastas judiciales. Proceso supervisado con garantías legales.", icon: Gavel },
              { title: "Postura en Subasta", desc: "Participación directa en subastas judiciales con asesoramiento profesional y análisis previo de la oportunidad.", icon: TrendingUp },
            ].map(t => (
              <Card key={t.title} className="hover:shadow-lg transition-all">
                <CardHeader><CardTitle className="flex items-center gap-3"><t.icon className="h-6 w-6 text-primary" />{t.title}</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">{t.desc}</p><Button variant="outline" className="mt-4">Saber más</Button></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Property */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Oportunidad Destacada</h2>
          <Card className="max-w-4xl mx-auto overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="bg-muted aspect-square flex items-center justify-center"><Building2 className="h-20 w-20 text-muted-foreground/30" /></div>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-2"><Badge>{mockProperty.ref}</Badge><Badge variant="outline">Cesión Remate</Badge></div>
                <h3 className="text-2xl font-bold">{mockProperty.title}</h3>
                <div className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{mockProperty.location}</div>
                <Separator />
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-sm text-muted-foreground">Precio mínimo</p><p className="text-xl font-bold text-primary">{fmt(mockProperty.precioMinimo)}</p></div>
                  <div><p className="text-sm text-muted-foreground">Valor mercado</p><p className="text-xl font-bold">{fmt(mockProperty.valorMercado)}</p></div>
                  <div><p className="text-sm text-muted-foreground">Superficie</p><p className="font-semibold">{mockProperty.sqm} m²</p></div>
                  <div><p className="text-sm text-muted-foreground">Año</p><p className="font-semibold">{mockProperty.year}</p></div>
                </div>
                <Button className="w-full">Ver oportunidad completa</Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-8 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            {[
              { icon: Shield, text: "Cumplimiento normativo" },
              { icon: CheckCircle, text: "Verificación KYC/AML" },
              { icon: FileText, text: "Documentación completa" },
              { icon: Users, text: "Asesoramiento profesional" },
            ].map(c => (
              <div key={c.text} className="flex items-center gap-2"><c.icon className="h-4 w-4" /><span>{c.text}</span></div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PremiumAuctionsPage;

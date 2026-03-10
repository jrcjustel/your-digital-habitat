import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, PieChart } from 'lucide-react';

const CalculatorsPage = () => {
  const [mortgage, setMortgage] = useState({ propertyValue: 200000, downPayment: 50000, interestRate: 3.5, loanTerm: 25 });
  const [rent, setRent] = useState({ purchasePrice: 150000, monthlyRent: 800, expenses: 150, vacancy: 5 });

  const calcMortgage = () => {
    const principal = mortgage.propertyValue - mortgage.downPayment;
    const r = mortgage.interestRate / 100 / 12;
    const n = mortgage.loanTerm * 12;
    const monthly = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { monthly: monthly.toFixed(2), total: (monthly * n).toFixed(2), interest: (monthly * n - principal).toFixed(2), loan: principal.toFixed(2) };
  };

  const calcRent = () => {
    const annual = rent.monthlyRent * 12;
    const adjusted = annual * (1 - rent.vacancy / 100);
    const exp = rent.expenses * 12;
    const net = adjusted - exp;
    return { gross: ((annual / rent.purchasePrice) * 100).toFixed(2), net: ((net / rent.purchasePrice) * 100).toFixed(2), monthlyNet: (net / 12).toFixed(2), annualNet: net.toFixed(2) };
  };

  const m = calcMortgage(); const r = calcRent();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Calculadoras Financieras | IKESA" description="Calcula hipotecas y rentabilidad de inversiones inmobiliarias" canonical="/calculadoras" />
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2"><h1 className="text-3xl font-bold font-heading">Calculadoras Financieras</h1><p className="text-xl text-muted-foreground">Herramientas para evaluar tus inversiones inmobiliarias</p></div>

        <Tabs defaultValue="mortgage" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="mortgage"><Calculator className="h-4 w-4 mr-2" />Hipoteca</TabsTrigger><TabsTrigger value="rentability"><TrendingUp className="h-4 w-4 mr-2" />Rentabilidad</TabsTrigger><TabsTrigger value="comparison"><PieChart className="h-4 w-4 mr-2" />Comparación</TabsTrigger></TabsList>

          <TabsContent value="mortgage" className="mt-6"><div className="grid lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Datos de Hipoteca</CardTitle></CardHeader><CardContent className="space-y-4">
              <div><Label>Valor propiedad (€)</Label><Input type="number" value={mortgage.propertyValue} onChange={e => setMortgage({...mortgage, propertyValue: +e.target.value})} /></div>
              <div><Label>Entrada (€)</Label><Input type="number" value={mortgage.downPayment} onChange={e => setMortgage({...mortgage, downPayment: +e.target.value})} /></div>
              <div><Label>Tipo interés (%)</Label><Input type="number" step="0.1" value={mortgage.interestRate} onChange={e => setMortgage({...mortgage, interestRate: +e.target.value})} /></div>
              <div><Label>Plazo (años)</Label><Input type="number" value={mortgage.loanTerm} onChange={e => setMortgage({...mortgage, loanTerm: +e.target.value})} /></div>
            </CardContent></Card>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5"><CardHeader><CardTitle>Resultados</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Cuota Mensual</p><p className="text-2xl font-bold text-primary">€{m.monthly}</p></div>
              <div><p className="text-sm text-muted-foreground">Préstamo</p><p className="text-lg font-semibold">€{m.loan}</p></div>
              <div><p className="text-sm text-muted-foreground">Total a Pagar</p><p className="text-lg font-semibold">€{m.total}</p></div>
              <div><p className="text-sm text-muted-foreground">Intereses</p><p className="text-lg font-semibold">€{m.interest}</p></div>
            </div></CardContent></Card>
          </div></TabsContent>

          <TabsContent value="rentability" className="mt-6"><div className="grid lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Datos de Rentabilidad</CardTitle></CardHeader><CardContent className="space-y-4">
              <div><Label>Precio compra (€)</Label><Input type="number" value={rent.purchasePrice} onChange={e => setRent({...rent, purchasePrice: +e.target.value})} /></div>
              <div><Label>Renta mensual (€)</Label><Input type="number" value={rent.monthlyRent} onChange={e => setRent({...rent, monthlyRent: +e.target.value})} /></div>
              <div><Label>Gastos mensuales (€)</Label><Input type="number" value={rent.expenses} onChange={e => setRent({...rent, expenses: +e.target.value})} /></div>
              <div><Label>Vacancia (%)</Label><Input type="number" value={rent.vacancy} onChange={e => setRent({...rent, vacancy: +e.target.value})} /></div>
            </CardContent></Card>
            <Card className="border-green-500/20 bg-gradient-to-br from-green-50/50 to-primary/5"><CardHeader><CardTitle>Análisis</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">Rentabilidad Bruta</p><p className="text-2xl font-bold text-green-600">{r.gross}%</p></div>
              <div><p className="text-sm text-muted-foreground">Rentabilidad Neta</p><p className="text-2xl font-bold text-primary">{r.net}%</p></div>
              <div><p className="text-sm text-muted-foreground">Ingreso Mensual Neto</p><p className="text-lg font-semibold">€{r.monthlyNet}</p></div>
              <div><p className="text-sm text-muted-foreground">Ingreso Anual Neto</p><p className="text-lg font-semibold">€{r.annualNet}</p></div>
            </div></CardContent></Card>
          </div></TabsContent>

          <TabsContent value="comparison" className="mt-6"><Card><CardHeader className="text-center"><CardTitle>Comparación de Escenarios</CardTitle><CardDescription>Compara opciones side-by-side</CardDescription></CardHeader><CardContent><div className="grid md:grid-cols-3 gap-6">
            {[{ name: 'Escenario A', inv: '150,000', ret: '6.2%', risk: 'Medio', rColor: 'text-yellow-600', highlight: false },
              { name: 'Escenario B (Recomendado)', inv: '200,000', ret: '7.8%', risk: 'Bajo', rColor: 'text-green-600', highlight: true },
              { name: 'Escenario C', inv: '100,000', ret: '9.5%', risk: 'Alto', rColor: 'text-red-600', highlight: false }
            ].map(s => (
              <div key={s.name} className={`space-y-4 p-4 rounded-lg ${s.highlight ? 'border-2 border-primary bg-primary/5' : 'border'}`}>
                <h4 className={`font-semibold text-center ${s.highlight ? 'text-primary' : ''}`}>{s.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Inversión:</span><span className="font-medium">€{s.inv}</span></div>
                  <div className="flex justify-between"><span>Rentabilidad:</span><span className="font-medium text-green-600">{s.ret}</span></div>
                  <div className="flex justify-between"><span>Riesgo:</span><span className={`font-medium ${s.rColor}`}>{s.risk}</span></div>
                </div>
              </div>
            ))}
          </div></CardContent></Card></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default CalculatorsPage;

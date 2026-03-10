import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Scale, AlertTriangle, Shield, FileText, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LegalTermsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center space-y-4 mb-8">
        <div className="flex justify-center mb-4"><div className="p-4 bg-primary/10 rounded-full"><Scale className="h-12 w-12 text-primary" /></div></div>
        <h1 className="text-4xl font-bold">Términos y Condiciones Legales</h1>
        <p className="text-lg text-muted-foreground">Condiciones generales de uso de la plataforma IKESA</p>
        <div className="flex justify-center gap-2"><Badge variant="outline">Vigente desde: 01/01/2024</Badge><Badge variant="outline">Versión 3.0</Badge></div>
      </div>

      <div className="space-y-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Datos Identificativos</CardTitle></CardHeader>
          <CardContent><div className="space-y-2"><p><strong>Titular:</strong> IKESA INVERSIONES INMOBILIARIAS S.L.</p><p><strong>Email:</strong> info@ikesa.es</p><p><strong>Actividad:</strong> Servicios de inversión inmobiliaria y asesoramiento</p></div></CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" /> Advertencias de Riesgo</CardTitle></CardHeader>
          <CardContent>
            <Alert className="mb-4"><AlertTriangle className="h-4 w-4" /><AlertDescription><strong>AVISO IMPORTANTE:</strong> Las inversiones inmobiliarias conllevan riesgos significativos y pueden resultar en pérdidas parciales o totales del capital invertido.</AlertDescription></Alert>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Riesgo de mercado:</strong> Fluctuaciones en el valor de los inmuebles</li>
              <li>• <strong>Riesgo de liquidez:</strong> Dificultad para vender o convertir en efectivo</li>
              <li>• <strong>Riesgo legal:</strong> Complicaciones jurídicas o regulatorias</li>
              <li>• <strong>Riesgo de ocupación:</strong> Problemas con ocupantes no autorizados</li>
            </ul>
          </CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" /> Marco Regulatorio</CardTitle></CardHeader>
          <CardContent><ul className="text-sm space-y-1 text-muted-foreground">
            <li>• RGPD (UE 2016/679)</li><li>• Ley Orgánica 3/2018 de Protección de Datos</li><li>• Directiva 2019/1937 sobre protección de denunciantes</li><li>• Real Decreto 304/2014 sobre subastas judiciales</li>
          </ul></CardContent></Card>
      </div>
    </div>
    <Footer />
  </div>
);

export default LegalTermsPage;

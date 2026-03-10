import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Eye, EyeOff, Lock, MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categories = ['Fraude financiero', 'Corrupción', 'Violación de datos personales', 'Acoso laboral', 'Discriminación', 'Incumplimiento normativo', 'Conflicto de intereses', 'Otros'];

const WhistleblowingPage = () => {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reportData, setReportData] = useState({ reporterEmail: '', category: '', severity: 'medium', subject: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportData.subject.trim() || !reportData.description.trim() || !reportData.category) {
      toast({ title: "Campos requeridos", variant: "destructive" }); return;
    }
    const ticket = `WB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setReportData({ reporterEmail: '', category: '', severity: 'medium', subject: '', description: '' });
    toast({ title: "Denuncia enviada correctamente", description: `Número de ticket: ${ticket}. Guarde este número para seguimiento.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center mb-4"><div className="p-4 bg-primary/10 rounded-full"><Shield className="h-12 w-12 text-primary" /></div></div>
          <h1 className="text-4xl font-bold">Canal de Denuncias</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Canal seguro y confidencial para reportar irregularidades conforme a la normativa europea</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Garantías Legales</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Alert><Shield className="h-4 w-4" /><AlertDescription><strong>Protección completa:</strong> Su identidad está protegida según la Directiva UE 2019/1937.</AlertDescription></Alert>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" /><div><strong>Confidencialidad:</strong> Toda la información se encripta.</div></div>
                  <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" /><div><strong>No represalias:</strong> Protección legal contra cualquier tipo de represalia.</div></div>
                </div>
              </CardContent></Card>
          </div>
          <div className="lg:col-span-2">
            <Card><CardHeader>
              <CardTitle>Formulario de Denuncia</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant={isAnonymous ? "default" : "outline"} size="sm" onClick={() => setIsAnonymous(true)}><EyeOff className="h-4 w-4 mr-2" />Anónima</Button>
                <Button variant={!isAnonymous ? "default" : "outline"} size="sm" onClick={() => setIsAnonymous(false)}><Eye className="h-4 w-4 mr-2" />Identificada</Button>
              </div>
            </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isAnonymous && <Input type="email" value={reportData.reporterEmail} onChange={e => setReportData({...reportData, reporterEmail: e.target.value})} placeholder="su.email@ejemplo.com" />}
                  <Select value={reportData.category} onValueChange={v => setReportData({...reportData, category: v})}><SelectTrigger><SelectValue placeholder="Seleccione una categoría" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                  <Input value={reportData.subject} onChange={e => setReportData({...reportData, subject: e.target.value})} placeholder="Resumen breve del problema" maxLength={200} />
                  <Textarea value={reportData.description} onChange={e => setReportData({...reportData, description: e.target.value})} placeholder="Describa los hechos de manera detallada..." rows={8} maxLength={2000} />
                  <Button type="submit" disabled={isSubmitting} className="w-full" size="lg"><Shield className="h-4 w-4 mr-2" />Enviar Denuncia Segura</Button>
                </form>
              </CardContent></Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WhistleblowingPage;

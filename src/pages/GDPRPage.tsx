import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Shield, FileText, Download, Trash2, Edit, Eye, Clock, UserCheck, AlertCircle, Info } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const requestTypes = [
  { value: 'access', label: 'Acceso a datos personales', description: 'Solicitar una copia de todos sus datos personales', icon: Eye },
  { value: 'portability', label: 'Portabilidad de datos', description: 'Recibir sus datos en formato estructurado', icon: Download },
  { value: 'rectification', label: 'Rectificación de datos', description: 'Corregir información inexacta o incompleta', icon: Edit },
  { value: 'erasure', label: 'Supresión de datos', description: 'Solicitar la eliminación de sus datos personales', icon: Trash2 },
  { value: 'restriction', label: 'Limitación del tratamiento', description: 'Restringir el procesamiento de sus datos', icon: Clock },
  { value: 'objection', label: 'Oposición al tratamiento', description: 'Oponerse al procesamiento de sus datos', icon: AlertCircle },
];

const GDPRPage = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [consentPreferences, setConsentPreferences] = useState({ marketing: false, analytics: false, necessary: true });
  const [newRequest, setNewRequest] = useState({ type: '', description: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.type || !newRequest.description || !newRequest.email) {
      toast({ title: "Campos requeridos", description: "Complete todos los campos obligatorios", variant: "destructive" });
      return;
    }
    const ticket = `GDPR-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setNewRequest({ type: '', description: '', email: '' });
    toast({ title: "Solicitud GDPR enviada", description: `Número de ticket: ${ticket}. Responderemos en un máximo de 30 días.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center mb-4"><div className="p-4 bg-primary/10 rounded-full"><Shield className="h-12 w-12 text-primary" /></div></div>
          <h1 className="text-4xl font-bold">Centro de Privacidad RGPD</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Gestione sus derechos de protección de datos conforme al Reglamento General de Protección de Datos</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Solicitudes GDPR</TabsTrigger>
            <TabsTrigger value="consent">Gestión de Consentimientos</TabsTrigger>
            <TabsTrigger value="info">Información y Derechos</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Nueva Solicitud GDPR</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Select value={newRequest.type} onValueChange={v => setNewRequest({...newRequest, type: v})}>
                    <SelectTrigger><SelectValue placeholder="Seleccione el tipo de solicitud" /></SelectTrigger>
                    <SelectContent>{requestTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="email" value={newRequest.email} onChange={e => setNewRequest({...newRequest, email: e.target.value})} placeholder="su.email@ejemplo.com" />
                  <Textarea value={newRequest.description} onChange={e => setNewRequest({...newRequest, description: e.target.value})} placeholder="Describa su solicitud..." rows={4} />
                  <Alert><Clock className="h-4 w-4" /><AlertDescription>Su solicitud será procesada en un plazo máximo de 30 días conforme al RGPD.</AlertDescription></Alert>
                  <Button type="submit" disabled={isSubmitting} className="w-full">Enviar Solicitud GDPR</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consent" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> Preferencias de Consentimiento</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {[{ key: 'necessary', label: 'Cookies necesarias', desc: 'Requeridas para el funcionamiento básico', required: true }, { key: 'analytics', label: 'Cookies analíticas', desc: 'Nos ayudan a entender cómo usa el sitio', required: false }, { key: 'marketing', label: 'Cookies de marketing', desc: 'Utilizadas para mostrar publicidad relevante', required: false }].map(c => (
                  <div key={c.key} className="flex items-start justify-between space-x-4">
                    <div className="flex-1"><div className="flex items-center gap-2 mb-1"><h4 className="font-medium">{c.label}</h4>{c.required && <Badge variant="secondary" className="text-xs">Requerido</Badge>}</div><p className="text-sm text-muted-foreground">{c.desc}</p></div>
                    <Checkbox checked={consentPreferences[c.key as keyof typeof consentPreferences]} onCheckedChange={checked => !c.required && setConsentPreferences(prev => ({...prev, [c.key]: checked}))} disabled={c.required} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <Card><CardHeader><CardTitle>Sus Derechos GDPR</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {requestTypes.map(r => { const Icon = r.icon; return (
                  <div key={r.value} className="flex items-start gap-3"><Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" /><div><h4 className="font-medium text-sm">{r.label}</h4><p className="text-xs text-muted-foreground">{r.description}</p></div></div>
                ); })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default GDPRPage;

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Key, Globe, Puzzle, Shield, Zap, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface APIEndpoint { method: string; endpoint: string; description: string; auth: boolean; rateLimit: string; }
interface Partner { id: string; name: string; type: string; status: 'active' | 'pending' | 'inactive'; integrationType: string; apiCalls: number; }

const APIEcosystemPage = () => {
  const { toast } = useToast();
  const [newKey, setNewKey] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  const apiEndpoints: APIEndpoint[] = [
    { method: 'GET', endpoint: '/api/v1/properties', description: 'Obtener listado de propiedades', auth: true, rateLimit: '1000/hora' },
    { method: 'GET', endpoint: '/api/v1/properties/{id}', description: 'Detalles de propiedad específica', auth: true, rateLimit: '1000/hora' },
    { method: 'POST', endpoint: '/api/v1/analytics/predict', description: 'Análisis predictivo con IA', auth: true, rateLimit: '100/hora' },
    { method: 'GET', endpoint: '/api/v1/market/insights', description: 'Insights de mercado en tiempo real', auth: true, rateLimit: '500/hora' },
    { method: 'POST', endpoint: '/api/v1/competitors/analyze', description: 'Análisis de competidores', auth: true, rateLimit: '50/hora' },
  ];

  const partners: Partner[] = [
    { id: '1', name: 'PropTech Solutions', type: 'Integración', status: 'active', integrationType: 'REST API', apiCalls: 15420 },
    { id: '2', name: 'Real Estate Analytics', type: 'Partner', status: 'active', integrationType: 'WebHooks', apiCalls: 8930 },
    { id: '3', name: 'Investment Platform', type: 'Cliente', status: 'pending', integrationType: 'SDK', apiCalls: 0 },
  ];

  useEffect(() => { generateAPIKey(); }, []);

  const generateAPIKey = () => {
    setNewKey('ikesa_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copiado", description: "API Key copiada al portapapeles" });
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = { GET: 'bg-blue-500', POST: 'bg-green-500', PUT: 'bg-orange-500', DELETE: 'bg-red-500' };
    return colors[method] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { active: 'bg-green-500', pending: 'bg-yellow-500', inactive: 'bg-red-500' };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" /> API Pública & Ecosistema
          </h1>
          <p className="text-muted-foreground">Plataforma de integraciones para partners tecnológicos y desarrolladores</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[{ label: 'Total API Calls', value: '1,247', icon: Zap }, { label: 'Partners Activos', value: '8', icon: Puzzle }, { label: 'Uptime', value: '99.9%', icon: Shield }].map((stat, i) => (
            <Card key={i}><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div><stat.icon className="h-8 w-8 text-primary" /></div></CardContent></Card>
          ))}
        </div>

        <Tabs defaultValue="documentation" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documentation">Documentación</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="usage">Uso</TabsTrigger>
          </TabsList>

          <TabsContent value="documentation" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Code className="h-5 w-5" /> Endpoints Disponibles</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiEndpoints.map((ep, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge className={`${getMethodColor(ep.method)} text-white`}>{ep.method}</Badge>
                        <div><code className="text-sm font-mono">{ep.endpoint}</code><p className="text-sm text-muted-foreground">{ep.description}</p></div>
                      </div>
                      <div className="flex items-center gap-2">{ep.auth && <Shield className="h-4 w-4 text-green-600" />}<Badge variant="outline">{ep.rateLimit}</Badge></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Gestión de API Keys</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input value={newKey} readOnly className="font-mono" />
                  <Button onClick={generateAPIKey} variant="outline">Generar Nueva</Button>
                  <Button onClick={() => copyToClipboard(newKey)} variant="outline">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
                </div>
                <Button onClick={() => { setApiKey(newKey); toast({ title: "API Key Activada" }); }} className="w-full" disabled={!newKey || apiKey === newKey}>Activar API Key</Button>
                {apiKey && <div className="p-4 bg-green-50 border border-green-200 rounded-lg"><p className="text-sm font-medium text-green-800">✓ API Key Activa</p><code className="text-sm text-green-700 font-mono">{apiKey}</code></div>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Puzzle className="h-5 w-5" /> Ecosistema de Partners</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partners.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4"><div className={`w-3 h-3 rounded-full ${getStatusColor(p.status)}`} /><div><h4 className="font-semibold">{p.name}</h4><p className="text-sm text-muted-foreground">{p.type} · {p.integrationType}</p></div></div>
                      <div className="text-right"><p className="font-semibold">{p.apiCalls.toLocaleString()}</p><p className="text-sm text-muted-foreground">API Calls</p></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage"><Card><CardContent className="text-center py-8"><p className="text-muted-foreground">Panel de métricas y analytics en desarrollo</p></CardContent></Card></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default APIEcosystemPage;

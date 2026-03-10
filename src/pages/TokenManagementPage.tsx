import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Copy, Plus, Trash2, Shield, Clock, BarChart3, AlertTriangle } from "lucide-react";

const mockTokens = [
  { id: 1, name: "API Principal", key: "ik_live_****...a3f2", created: "2024-01-15", lastUsed: "Hace 2h", calls: 12450, status: "Activo" },
  { id: 2, name: "Webhook Producción", key: "ik_live_****...b7d1", created: "2024-02-20", lastUsed: "Hace 5 min", calls: 8920, status: "Activo" },
  { id: 3, name: "Sandbox Testing", key: "ik_test_****...c9e0", created: "2024-03-01", lastUsed: "Ayer", calls: 342, status: "Activo" },
];

const TokenManagementPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Gestión de Tokens API | IKESA Admin" description="Administración de tokens y claves API" canonical="/admin/tokens" />
      <Navbar />
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2"><Key className="h-8 w-8 text-primary" /><h1 className="text-4xl font-bold font-heading">Gestión de Tokens API</h1></div>
            <p className="text-xl text-muted-foreground">Administra las claves de acceso a la API de IKESA</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Nuevo Token</Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Tokens Activos", value: "3", icon: Key },
            { label: "Llamadas Hoy", value: "1,250", icon: BarChart3 },
            { label: "Límite Diario", value: "10,000", icon: Shield },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 flex items-center gap-4"><s.icon className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div></CardContent></Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>Tokens API</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTokens.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Key className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <code className="bg-muted px-2 py-0.5 rounded">{t.key}</code>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Copy className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Último uso: {t.lastUsed}</p>
                      <p className="text-muted-foreground">{t.calls.toLocaleString()} llamadas</p>
                    </div>
                    <Badge>{t.status}</Badge>
                    <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default TokenManagementPage;

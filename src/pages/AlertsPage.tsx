import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Search, MapPin, TrendingUp, Filter, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';

const mockAlerts = [
  { id: '1', name: 'Pisos Madrid Centro <200K', filters: { location: 'Madrid', maxPrice: 200000, type: 'piso' }, active: true, matches: 3 },
  { id: '2', name: 'Locales Barcelona', filters: { location: 'Barcelona', type: 'local' }, active: true, matches: 1 },
  { id: '3', name: 'NPL Valencia', filters: { location: 'Valencia', saleType: 'npl' }, active: false, matches: 0 },
];

const AlertsPage = () => {
  const [alerts, setAlerts] = useState(mockAlerts);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold flex items-center gap-3"><Bell className="h-8 w-8 text-primary" /> Mis Alertas</h1><p className="text-muted-foreground">Recibe notificaciones de nuevas oportunidades que coincidan con tus criterios</p></div>
          <Button><Bell className="h-4 w-4 mr-2" />Nueva Alerta</Button>
        </div>

        <div className="space-y-4">
          {alerts.map(alert => (
            <Card key={alert.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Bell className={`h-5 w-5 ${alert.active ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <h3 className="font-semibold">{alert.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {Object.entries(alert.filters).map(([key, val]) => <Badge key={key} variant="outline" className="text-xs">{String(val)}</Badge>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {alert.matches > 0 && <Badge>{alert.matches} coincidencias</Badge>}
                    <Badge variant={alert.active ? 'default' : 'secondary'}>{alert.active ? 'Activa' : 'Pausada'}</Badge>
                    <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
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
};

export default AlertsPage;

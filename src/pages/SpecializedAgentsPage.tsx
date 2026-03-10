import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, Users, MessageSquare, Zap, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const agents = [
  { name: 'INÉS', emoji: '👩‍💼', role: 'Especialista Comercial', color: 'bg-blue-100', items: ['Análisis de inversión', 'Valoraciones inmobiliarias', 'Estrategias comerciales', 'Cualificación de leads'] },
  { name: 'PELAYO', emoji: '👨‍⚖️', role: 'Especialista Jurídico', color: 'bg-green-100', items: ['Due diligence jurídico', 'Análisis de riesgos', 'Compliance normativo', 'Procedimientos judiciales'] },
  { name: 'NPL Expert', emoji: '💼', role: 'Especialista en Activos Distressed', color: 'bg-purple-100', items: ['Carteras NPL', 'Estrategias recuperación', 'Scoring de riesgo', 'Valoración distressed'] },
  { name: 'PBC Expert', emoji: '🏛️', role: 'Especialista en Licitaciones', color: 'bg-orange-100', items: ['Procedimientos PBC', 'Estrategias de puja', 'Documentación legal', 'Adjudicaciones públicas'] },
];

const SpecializedAgentsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">🤖 Centro de Agentes IA Especializados</h1>
        <p className="text-xl opacity-90 max-w-3xl mx-auto">Sistema inteligente de asistentes especializados en inversión inmobiliaria</p>
        <div className="flex justify-center space-x-4 mt-6">
          <Badge variant="secondary" className="text-sm"><Zap className="h-4 w-4 mr-1" />IA Avanzada</Badge>
          <Badge variant="secondary" className="text-sm"><Users className="h-4 w-4 mr-1" />Multi-Especialista</Badge>
          <Badge variant="secondary" className="text-sm"><MessageSquare className="h-4 w-4 mr-1" />Tiempo Real</Badge>
        </div>
      </div>
    </div>

    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {agents.map(agent => (
          <Card key={agent.name} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3"><CardTitle className="flex items-center text-lg"><div className={`${agent.color} p-2 rounded-lg mr-3`}>{agent.emoji}</div>{agent.name}</CardTitle><p className="text-sm text-muted-foreground">{agent.role}</p></CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1">{agent.items.map(it => <li key={it}>• {it}</li>)}</ul>
              <Button size="sm" className="w-full mt-4"><MessageSquare className="h-4 w-4 mr-2" />Consultar</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card><CardHeader><CardTitle className="flex items-center"><Bot className="h-5 w-5 mr-2" />Características del Sistema</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[{ title: 'Routing Inteligente', desc: 'Análisis automático de consultas para conectar con el especialista más adecuado', icon: Zap, color: 'bg-blue-100 text-blue-600' },
              { title: 'Multi-Canal', desc: 'Disponible en web, WhatsApp, Telegram y API', icon: MessageSquare, color: 'bg-green-100 text-green-600' },
              { title: 'Aprendizaje Continuo', desc: 'Los agentes mejoran basándose en interacciones y feedback', icon: Settings, color: 'bg-purple-100 text-purple-600' },
            ].map(f => (
              <div key={f.title} className="flex items-start space-x-3"><div className={`p-2 rounded-lg ${f.color.split(' ')[0]}`}><f.icon className={`h-4 w-4 ${f.color.split(' ')[1]}`} /></div><div><h4 className="font-semibold">{f.title}</h4><p className="text-sm text-muted-foreground">{f.desc}</p></div></div>
            ))}
          </CardContent></Card>
        <Card><CardHeader><CardTitle>🌐 Canales de Comunicación</CardTitle></CardHeader>
          <CardContent><div className="grid grid-cols-2 gap-4">
            {[{ emoji: '💬', title: 'Chat Web', sub: 'Interface principal' }, { emoji: '📱', title: 'WhatsApp', sub: 'Business API' }, { emoji: '🤖', title: 'Telegram', sub: 'Bot especializado' }, { emoji: '📊', title: 'API REST', sub: 'Integraciones' }].map(ch => (
              <div key={ch.title} className="text-center p-4 border rounded-lg"><div className="text-2xl mb-2">{ch.emoji}</div><h4 className="font-semibold">{ch.title}</h4><p className="text-xs text-muted-foreground">{ch.sub}</p></div>
            ))}
          </div></CardContent></Card>
      </div>
    </div>
    <Footer />
  </div>
);

export default SpecializedAgentsPage;

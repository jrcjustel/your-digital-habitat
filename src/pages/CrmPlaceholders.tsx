import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CrmPlaceholderProps {
  title: string;
  subtitle: string;
  description: string;
  seoTitle: string;
  canonical: string;
}

const CrmPlaceholderPage = ({ title, subtitle, description, seoTitle, canonical }: CrmPlaceholderProps) => (
  <div className="min-h-screen bg-background">
    <SEOHead title={seoTitle} description={subtitle} canonical={canonical} />
    <Navbar />
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading mb-2">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Próximamente</CardTitle>
            <CardDescription>Esta funcionalidad estará disponible próximamente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </div>
    </main>
    <Footer />
  </div>
);

export const CrmCalendar = () => (
  <CrmPlaceholderPage title="Agenda" subtitle="Calendario y gestión de citas" description="El módulo de Agenda permitirá gestionar citas, visitas y eventos relacionados con propiedades." seoTitle="Agenda | IKESA" canonical="/crm/agenda" />
);

export const CrmCommunications = () => (
  <CrmPlaceholderPage title="Comunicaciones" subtitle="Centro de comunicaciones y mensajería" description="El módulo de Comunicaciones permitirá gestionar emails, SMS y otras comunicaciones con clientes." seoTitle="Comunicaciones | IKESA" canonical="/crm/comunicaciones" />
);

export const CrmContracts = () => (
  <CrmPlaceholderPage title="Contratos" subtitle="Gestión de contratos inmobiliarios" description="El módulo de Contratos permitirá crear, gestionar y hacer seguimiento de contratos de compraventa y alquiler." seoTitle="Contratos | IKESA" canonical="/crm/contratos" />
);

export const CrmDemand = () => (
  <CrmPlaceholderPage title="Demanda IA" subtitle="Análisis inteligente de demanda inmobiliaria" description="El módulo de Demanda IA permitirá analizar patrones de demanda y predecir oportunidades de mercado." seoTitle="Demanda IA | IKESA" canonical="/crm/demanda" />
);

export const CrmJudicial = () => (
  <CrmPlaceholderPage title="Judicial/NPL" subtitle="Gestión de procesos judiciales y activos NPL" description="El módulo Judicial/NPL permitirá gestionar procesos judiciales y activos non-performing loans." seoTitle="Judicial | IKESA" canonical="/crm/judicial" />
);

export const CrmPipeline = () => (
  <CrmPlaceholderPage title="Pipeline" subtitle="Gestión del pipeline de ventas" description="El módulo de Pipeline permitirá gestionar y visualizar el flujo de ventas completo." seoTitle="Pipeline | IKESA" canonical="/crm/pipeline" />
);

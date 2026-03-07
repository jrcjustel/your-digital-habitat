import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InvestorDashboard from "@/components/InvestorDashboard";
import MarketIntelligence from "@/components/MarketIntelligence";
import AssetComparator from "@/components/AssetComparator";
import AlertsManager from "@/components/AlertsManager";
import LegalForms from "@/components/LegalForms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, GitCompare, Bell, Scale } from "lucide-react";

const AnalyticsDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-10 md:py-14 bg-gradient-to-b from-secondary to-background">
        <div className="container mx-auto px-4 text-center">
          <span className="section-label">Inteligencia de Inversión</span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-4 mb-3">
            Panel Analítico Avanzado
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Análisis de cartera, inteligencia de mercado, comparador de activos, alertas y formularios legales en un solo lugar.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
            <TabsTrigger value="dashboard" className="gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="market" className="gap-2 text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4" /> Mercado
            </TabsTrigger>
            <TabsTrigger value="comparator" className="gap-2 text-xs sm:text-sm">
              <GitCompare className="w-4 h-4" /> Comparador
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2 text-xs sm:text-sm">
              <Bell className="w-4 h-4" /> Alertas
            </TabsTrigger>
            <TabsTrigger value="legal" className="gap-2 text-xs sm:text-sm">
              <Scale className="w-4 h-4" /> Legal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <InvestorDashboard />
          </TabsContent>

          <TabsContent value="market">
            <MarketIntelligence />
          </TabsContent>

          <TabsContent value="comparator">
            <AssetComparator />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsManager />
          </TabsContent>

          <TabsContent value="legal">
            <LegalForms />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AnalyticsDashboard;

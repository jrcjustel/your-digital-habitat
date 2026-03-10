import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import PropertyListing from "./pages/PropertyListing";
import PropertyDetail from "./pages/PropertyDetail";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminImport from "./pages/AdminImport";
import AdminDocuments from "./pages/AdminDocuments";
import AdminRoute from "./components/AdminRoute";
import NplListing from "./pages/NplListing";
import AiChatWidget from "./components/AiChatWidget";
import SocialChannelsFloat from "./components/SocialChannelsFloat";
import CookieConsent from "./components/CookieConsent";
import ScrollToTop from "./components/ScrollToTop";
import NplDetail from "./pages/NplDetail";
import ComoFunciona from "./pages/ComoFunciona";
import AvisoLegal from "./pages/AvisoLegal";
import AvisoLegalNpl from "./pages/AvisoLegalNpl";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import PoliticaCookies from "./pages/PoliticaCookies";
import CanalDenuncias from "./pages/CanalDenuncias";
import Valorador from "./pages/Valorador";
import AdminValuationLeads from "./pages/AdminValuationLeads";
import Servicios from "./pages/Servicios";
import Contacto from "./pages/Contacto";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import Academia from "./pages/Academia";
import AcademiaArticle from "./pages/AcademiaArticle";
import AcademiaRuta from "./pages/AcademiaRuta";
import CrmLeads from "./pages/CrmLeads";
import CrmPropertyNew from "./pages/CrmPropertyNew";
import CrmInesAI from "./pages/CrmInesAI";
import CrmPelayoAI from "./pages/CrmPelayoAI";
import { CrmCalendar, CrmCommunications, CrmContracts, CrmDemand, CrmJudicial, CrmPipeline } from "./pages/CrmPlaceholders";
import AIInsightsPage from "./pages/AIInsightsPage";
import PredictiveAnalyticsPage from "./pages/PredictiveAnalyticsPage";
import MarketplacePage from "./pages/MarketplacePage";
import AuctionsPage from "./pages/AuctionsPage";
import MapPage from "./pages/MapPage";
import CalculatorsPage from "./pages/CalculatorsPage";
import ExcelAnalyzerPage from "./pages/ExcelAnalyzerPage";
import ClientAreaPage from "./pages/ClientAreaPage";
import HybridValuationPage from "./pages/HybridValuationPage";
import InvestmentHomePage from "./pages/InvestmentHomePage";
import APIEcosystemPage from "./pages/APIEcosystemPage";
import AlertsPage from "./pages/AlertsPage";
import BlogPage from "./pages/BlogPage";
import CollaboratorsPage from "./pages/CollaboratorsPage";
import CommunicationsPage from "./pages/CommunicationsPage";
import ComparatorPage from "./pages/ComparatorPage";
import FAQPage from "./pages/FAQPage";
import GDPRPage from "./pages/GDPRPage";
import InvestmentsPage from "./pages/InvestmentsPage";
import LegalTermsPage from "./pages/LegalTermsPage";
import PortfolioManagementPage from "./pages/PortfolioManagementPage";
import ProfessionalNetworkPage from "./pages/ProfessionalNetworkPage";
import PublicMetricsPage from "./pages/PublicMetricsPage";
import SecurityDashboardPage from "./pages/SecurityDashboardPage";
import SpecializedAgentsPage from "./pages/SpecializedAgentsPage";
import SystemDiagnosticsPage from "./pages/SystemDiagnosticsPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import WhistleblowingPage from "./pages/WhistleblowingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/inmuebles" element={<PropertyListing />} />
            <Route path="/inmueble/:id" element={<PropertyDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/mi-cuenta" element={<Dashboard />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin/importar" element={<AdminRoute><AdminImport /></AdminRoute>} />
            <Route path="/admin/documentos" element={<AdminRoute><AdminDocuments /></AdminRoute>} />
            <Route path="/admin/leads-valoracion" element={<AdminRoute><AdminValuationLeads /></AdminRoute>} />
            <Route path="/admin/panel" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            {/* Redirects from old investor routes */}
            <Route path="/inversores" element={<Navigate to="/inmuebles" replace />} />
            <Route path="/inversores/npl" element={<Navigate to="/inmuebles?saleType=npl" replace />} />
            <Route path="/inversores/cesiones-remate" element={<Navigate to="/inmuebles?saleType=cesion-remate" replace />} />
            <Route path="/inversores/ocupados" element={<Navigate to="/inmuebles?saleType=ocupado" replace />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/academia" element={<Academia />} />
            <Route path="/academia/ruta/:rutaSlug" element={<AcademiaRuta />} />
            <Route path="/academia/:slug" element={<AcademiaArticle />} />
            <Route path="/npl" element={<NplListing />} />
            <Route path="/npl/:id" element={<NplDetail />} />
            {/* Legal */}
            <Route path="/aviso-legal" element={<AvisoLegal />} />
            <Route path="/aviso-legal-activos" element={<AvisoLegalNpl />} />
            <Route path="/privacidad" element={<PoliticaPrivacidad />} />
            <Route path="/cookies" element={<PoliticaCookies />} />
            <Route path="/canal-denuncias" element={<CanalDenuncias />} />
            <Route path="/valorar" element={<Valorador />} />
            <Route path="/contacto" element={<Contacto />} />
            {/* Investment & Tools routes */}
            <Route path="/ai-insights" element={<AIInsightsPage />} />
            <Route path="/analitica-predictiva" element={<PredictiveAnalyticsPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/subastas" element={<AuctionsPage />} />
            <Route path="/mapa" element={<MapPage />} />
            <Route path="/calculadoras" element={<CalculatorsPage />} />
            <Route path="/excel-analyzer" element={<AdminRoute><ExcelAnalyzerPage /></AdminRoute>} />
            <Route path="/area-cliente" element={<ClientAreaPage />} />
            <Route path="/valoracion-avanzada" element={<HybridValuationPage />} />
            <Route path="/inversion" element={<InvestmentHomePage />} />
            {/* CRM routes */}
            <Route path="/crm/leads" element={<AdminRoute><CrmLeads /></AdminRoute>} />
            <Route path="/crm/propiedad-nueva" element={<AdminRoute><CrmPropertyNew /></AdminRoute>} />
            <Route path="/crm/ai/ines" element={<AdminRoute><CrmInesAI /></AdminRoute>} />
            <Route path="/crm/ai/pelayo" element={<AdminRoute><CrmPelayoAI /></AdminRoute>} />
            <Route path="/crm/agenda" element={<AdminRoute><CrmCalendar /></AdminRoute>} />
            <Route path="/crm/comunicaciones" element={<AdminRoute><CrmCommunications /></AdminRoute>} />
            <Route path="/crm/contratos" element={<AdminRoute><CrmContracts /></AdminRoute>} />
            <Route path="/crm/demanda" element={<AdminRoute><CrmDemand /></AdminRoute>} />
            <Route path="/crm/judicial" element={<AdminRoute><CrmJudicial /></AdminRoute>} />
            <Route path="/crm/pipeline" element={<AdminRoute><CrmPipeline /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AiChatWidget />
          <SocialChannelsFloat />
          <CookieConsent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

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
import Inmobilator from "./pages/Inmobilatilator";
import AdminValuationLeads from "./pages/AdminValuationLeads";
import Servicios from "./pages/Servicios";
import Contacto from "./pages/Contacto";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import Academia from "./pages/Academia";
import AcademiaArticle from "./pages/AcademiaArticle";
import AcademiaRuta from "./pages/AcademiaRuta";

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
            <Route patinmobilator" element={<Inmobilatorador />} />
            <Route path="/contacto" element={<Contacto />} />
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

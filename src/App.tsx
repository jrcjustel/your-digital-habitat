import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NplDetail from "./pages/NplDetail";
import Inversores from "./pages/Inversores";
import InversoresNpl from "./pages/InversoresNpl";
import InversoresCdr from "./pages/InversoresCdr";
import InversoresOcupados from "./pages/InversoresOcupados";
import ComoFunciona from "./pages/ComoFunciona";
import AvisoLegal from "./pages/AvisoLegal";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import PoliticaCookies from "./pages/PoliticaCookies";
import CanalDenuncias from "./pages/CanalDenuncias";
import Valorador from "./pages/Valorador";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/inmuebles" element={<PropertyListing />} />
            <Route path="/inmueble/:id" element={<PropertyDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/mi-cuenta" element={<Dashboard />} />
            <Route path="/admin/importar" element={<AdminRoute><AdminImport /></AdminRoute>} />
            <Route path="/admin/documentos" element={<AdminRoute><AdminDocuments /></AdminRoute>} />
            <Route path="/inversores" element={<Inversores />} />
            <Route path="/inversores/npl" element={<InversoresNpl />} />
            <Route path="/inversores/cesiones-remate" element={<InversoresCdr />} />
            <Route path="/inversores/ocupados" element={<InversoresOcupados />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/npl" element={<NplListing />} />
            <Route path="/npl/:id" element={<NplDetail />} />
            {/* Legal */}
            <Route path="/aviso-legal" element={<AvisoLegal />} />
            <Route path="/privacidad" element={<PoliticaPrivacidad />} />
            <Route path="/cookies" element={<PoliticaCookies />} />
            <Route path="/canal-denuncias" element={<CanalDenuncias />} />
            <Route path="/valorar" element={<Valorador />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

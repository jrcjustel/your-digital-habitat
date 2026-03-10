import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { AiChatPanel } from "@/components/crm/ai-chat-panel";
import { useAiChat } from "@/hooks/useAiChatStream";

const SUGGESTIONS = [
  "¿Qué pasos tiene un procedimiento de ejecución hipotecaria?",
  "Analiza los riesgos de comprar en subasta judicial",
  "¿Qué documentos necesito para una due diligence?",
  "Explica la normativa KYC en operaciones inmobiliarias",
];

const CrmPelayoAI = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useAiChat("pelayo-chat");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title="Pelayo AI | IKESA" description="Asistente IA de Judicial y Compliance" canonical="/crm/ai/pelayo" />
      <Navbar />
      <div className="border-b px-6 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">PL</div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold font-heading">Pelayo AI</h1>
            <Badge variant="secondary" className="bg-blue-600/10 text-blue-600 text-xs">En línea</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Asistente IA · Judicial & Compliance</p>
        </div>
      </div>
      <div className="flex-1 container mx-auto max-w-4xl">
        <AiChatPanel
          messages={messages} isLoading={isLoading} onSend={sendMessage} onClear={clearMessages}
          assistantName="Pelayo" assistantInitials="PL" assistantColor="bg-blue-600"
          placeholder="Pregunta a Pelayo sobre temas judiciales, NPLs, compliance..." suggestions={SUGGESTIONS}
        />
      </div>
      <Footer />
    </div>
  );
};

export default CrmPelayoAI;

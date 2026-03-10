import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { AiChatPanel } from "@/components/crm/ai-chat-panel";
import { useAiChat } from "@/hooks/useAiChatStream";

const SUGGESTIONS = [
  "¿Cómo puedo mejorar la captación de leads?",
  "Analiza el precio de un ático de 120m² en Madrid centro",
  "Redacta un anuncio para un piso reformado",
  "¿Qué KPIs debo seguir en ventas?",
];

const CrmInesAI = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useAiChat("ines-chat");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title="Inés AI | IKESA" description="Asistente IA de Comercial y Growth" canonical="/crm/ai/ines" />
      <Navbar />
      <div className="border-b px-6 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">IN</div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold font-heading">Inés AI</h1>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-xs">En línea</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Asistente IA · Comercial & Growth</p>
        </div>
      </div>
      <div className="flex-1 container mx-auto max-w-4xl">
        <AiChatPanel
          messages={messages} isLoading={isLoading} onSend={sendMessage} onClear={clearMessages}
          assistantName="Inés" assistantInitials="IN" assistantColor="bg-emerald-500"
          placeholder="Pregunta a Inés sobre ventas, leads, marketing..." suggestions={SUGGESTIONS}
        />
      </div>
      <Footer />
    </div>
  );
};

export default CrmInesAI;

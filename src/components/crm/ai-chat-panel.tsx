import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Trash2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "@/hooks/useAiChatStream";
import { cn } from "@/lib/utils";

interface AiChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (message: string) => void;
  onClear: () => void;
  assistantName: string;
  assistantInitials: string;
  assistantColor: string;
  placeholder?: string;
  suggestions?: string[];
}

export const AiChatPanel = ({
  messages, isLoading, onSend, onClear,
  assistantName, assistantInitials, assistantColor,
  placeholder = "Escribe tu mensaje...", suggestions = [],
}: AiChatPanelProps) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-6">
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold", assistantColor)}>{assistantInitials}</div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Hola, soy {assistantName}</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                {assistantName === "Inés"
                  ? "Tu asistente de Comercial & Growth. Pregúntame sobre leads, estrategias de ventas, marketing inmobiliario o valoraciones."
                  : "Tu asistente de Judicial & Compliance. Pregúntame sobre procesos judiciales, NPLs, due diligence o normativa."}
              </p>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 max-w-lg justify-center">
                {suggestions.map((s, i) => (
                  <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => onSend(s)}>
                    <Sparkles className="h-3 w-3 mr-1" />{s}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <Avatar className="h-8 w-8 flex-shrink-0"><AvatarFallback className={cn("text-white text-xs font-bold", assistantColor)}>{assistantInitials}</AvatarFallback></Avatar>
                )}
                <Card className={cn("max-w-[80%] px-4 py-3", msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </Card>
                {msg.role === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0"><AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-bold">TÚ</AvatarFallback></Avatar>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0"><AvatarFallback className={cn("text-white text-xs font-bold", assistantColor)}>{assistantInitials}</AvatarFallback></Avatar>
                <Card className="bg-muted px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{assistantName} está pensando...</div>
                </Card>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      <div className="border-t p-4 bg-background">
        {messages.length > 0 && (
          <div className="flex justify-end mb-2">
            <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-muted-foreground"><Trash2 className="h-3 w-3 mr-1" />Limpiar chat</Button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }} placeholder={placeholder} className="min-h-[44px] max-h-[120px] resize-none" rows={1} disabled={isLoading} />
          <Button onClick={handleSubmit} disabled={!input.trim() || isLoading} size="icon" className="flex-shrink-0 h-[44px] w-[44px]">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

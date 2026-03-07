import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, Trash2, Database, TrendingUp, MapPin, Building2, Plus, MessageSquare, Clock, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Msg = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; updated_at: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-advisor`;

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Mejores oportunidades", text: "Analiza los activos de IKESA y recomiéndame las mejores oportunidades de inversión con mayor descuento y menor riesgo" },
  { icon: MapPin, label: "Activos en Madrid", text: "¿Qué activos tiene IKESA en Madrid? Analiza cada uno con su rentabilidad y riesgo" },
  { icon: Building2, label: "Cesiones de remate", text: "Muéstrame los activos de IKESA disponibles como cesión de remate y analiza cuáles son más interesantes" },
  { icon: Database, label: "Activos ocupados", text: "Analiza los activos ocupados de la cartera IKESA: riesgos legales, costes de recuperación y rentabilidad potencial" },
  { icon: TrendingUp, label: "Persona física vs jurídica", text: "¿Es mejor comprar un inmueble como persona física o jurídica? Compara fiscalidad por CCAA" },
  { icon: MapPin, label: "ITP por CCAA", text: "¿Cuáles son los tipos de ITP por comunidad autónoma para persona física y jurídica?" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

const AiAdvisorChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (data) setConversations(data);
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load a specific conversation's messages
  const loadConversation = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data as Msg[]);
      setActiveConvId(convId);
      setShowSidebar(false);
    }
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (firstMessage: string): Promise<string | null> => {
    if (!user) return null;
    const title = firstMessage.length > 60 ? firstMessage.substring(0, 57) + "..." : firstMessage;
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();
    if (error || !data) {
      console.error("Error creating conversation:", error);
      return null;
    }
    return data.id;
  }, [user]);

  // Save a message to DB
  const saveMessage = useCallback(async (convId: string, role: string, content: string) => {
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role,
      content,
    });
    // Update conversation timestamp
    await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(async (convId: string) => {
    await supabase.from("chat_conversations").delete().eq("id", convId);
    if (activeConvId === convId) {
      setActiveConvId(null);
      setMessages([]);
    }
    loadConversations();
  }, [activeConvId, loadConversations]);

  const streamChat = useCallback(async (allMessages: Msg[]): Promise<string> => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Error de conexión" }));
      throw new Error(err.error || `Error ${resp.status}`);
    }
    if (!resp.body) throw new Error("No stream body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            assistantContent += delta;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    return assistantContent;
  }, []);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    const userMsg: Msg = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Create or reuse conversation (only for logged-in users)
      let convId = activeConvId;
      if (user && !convId) {
        convId = await createConversation(msg);
        setActiveConvId(convId);
      }

      // Save user message
      if (user && convId) {
        await saveMessage(convId, "user", msg);
      }

      const assistantContent = await streamChat(newMessages);

      // Save assistant message
      if (user && convId && assistantContent) {
        await saveMessage(convId, "assistant", assistantContent);
        loadConversations();
      }
    } catch (e: any) {
      toast.error(e.message || "Error al conectar con el asesor IA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setShowSidebar(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] max-h-[800px] bg-card rounded-2xl border border-border overflow-hidden">
      {/* Sidebar - conversation history */}
      {user && (
        <div className={`${showSidebar ? "flex" : "hidden"} md:flex flex-col w-64 border-r border-border bg-secondary/30 flex-shrink-0`}>
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Historial</span>
            <Button variant="ghost" size="sm" onClick={handleNewChat} className="h-7 px-2 text-xs">
              <Plus className="w-3 h-3 mr-1" /> Nueva
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Sin conversaciones aún
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-start gap-2 px-3 py-2.5 cursor-pointer border-b border-border/50 transition-colors ${
                    activeConvId === conv.id ? "bg-primary/10" : "hover:bg-secondary"
                  }`}
                  onClick={() => loadConversation(conv.id)}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{conv.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" /> {timeAgo(conv.updated_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            {user && (
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setShowSidebar(!showSidebar)}>
                {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              </Button>
            )}
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-foreground text-sm">Asesor IA IKESA</h2>
              <p className="text-[10px] text-muted-foreground">Comercial · Legal · Fiscal · Activos NPL</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleNewChat} className="text-muted-foreground text-xs h-7">
              <Plus className="w-3 h-3 mr-1" /> Nueva
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">¿En qué puedo ayudarte?</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Tengo acceso a la cartera de activos NPL de IKESA. Puedo analizar oportunidades, comparar activos, calcular fiscalidad por CCAA y darte recomendaciones personalizadas.
              </p>
              {!user && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-xs text-muted-foreground">
                    <User className="w-3 h-3 inline mr-1" />
                    Inicia sesión para guardar tus conversaciones
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleSend(p.text)}
                    className="flex items-start gap-3 text-left px-4 py-3 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors text-sm text-foreground group"
                  >
                    <p.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-1">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-foreground"
                }`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex-shrink-0 flex items-center justify-center mt-1">
                    <User className="w-3.5 h-3.5 text-accent" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-primary animate-pulse" />
              </div>
              <div className="bg-secondary/70 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Database className="w-3 h-3 text-muted-foreground animate-pulse" />
                  <span className="text-xs text-muted-foreground">Consultando activos...</span>
                  <div className="flex gap-1 ml-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3 bg-background/50">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta sobre activos, fiscalidad, legal, inversión..."
              className="min-h-[44px] max-h-[120px] resize-none"
              rows={1}
              disabled={isLoading}
            />
            <Button onClick={() => handleSend()} disabled={!input.trim() || isLoading} size="icon" className="h-11 w-11 flex-shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Información orientativa. Consulte con un profesional para su caso concreto.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiAdvisorChat;

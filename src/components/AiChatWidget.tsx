import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, Sparkles, Trash2, Database, TrendingUp, MapPin, Building2, Plus, MessageSquare, Clock, X, Minus, Bell, Search, Map, SlidersHorizontal, ExternalLink, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

type Msg = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; updated_at: string };

interface AssetCard {
  ref: string;
  tipo: string;
  ubicacion: string;
  superficie: string;
  precio: string;
  valor_mercado: string;
  descuento: string;
  ocupacion: string;
  estado_judicial: string;
  cesion_remate: boolean;
  cesion_credito: boolean;
  scoring: string;
  veredicto: string;
  resumen: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-advisor`;

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Mejores oportunidades", text: "Analiza los activos de IKESA y recomiéndame las mejores oportunidades de inversión con mayor descuento y menor riesgo" },
  { icon: MapPin, label: "Activos en Madrid", text: "¿Qué activos tiene IKESA en Madrid? Analiza cada uno con su rentabilidad y riesgo" },
  { icon: Building2, label: "Cesiones de remate", text: "Muéstrame los activos de IKESA disponibles como cesión de remate y analiza cuáles son más interesantes" },
  { icon: Database, label: "Activos ocupados", text: "Analiza los activos ocupados de la cartera IKESA: riesgos legales, costes de recuperación y rentabilidad potencial" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

// Scoring badge color
function scoringColor(score: number) {
  if (score >= 8) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  if (score >= 5) return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
  return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30";
}

function verdictColor(veredicto: string) {
  const v = veredicto.toLowerCase();
  if (v.includes("comprar")) return "text-emerald-600 dark:text-emerald-400";
  if (v.includes("esperar")) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

// Parse asset cards and actions from message content
function parseAssetContent(content: string): { segments: Array<{ type: "text" | "card" | "actions"; data?: AssetCard; text?: string }> } {
  const segments: Array<{ type: "text" | "card" | "actions"; data?: AssetCard; text?: string }> = [];
  let remaining = content;

  while (remaining.length > 0) {
    const cardStart = remaining.indexOf("<ASSET_CARD>");
    const actionsIdx = remaining.indexOf("<ASSET_ACTIONS/>");

    const nextSpecial = Math.min(
      cardStart === -1 ? Infinity : cardStart,
      actionsIdx === -1 ? Infinity : actionsIdx
    );

    if (nextSpecial === Infinity) {
      if (remaining.trim()) segments.push({ type: "text", text: remaining });
      break;
    }

    // Text before the next special
    const before = remaining.slice(0, nextSpecial);
    if (before.trim()) segments.push({ type: "text", text: before });

    if (nextSpecial === cardStart) {
      const cardEnd = remaining.indexOf("</ASSET_CARD>", cardStart);
      if (cardEnd === -1) {
        segments.push({ type: "text", text: remaining.slice(cardStart) });
        break;
      }
      const jsonStr = remaining.slice(cardStart + "<ASSET_CARD>".length, cardEnd).trim();
      try {
        const data = JSON.parse(jsonStr) as AssetCard;
        segments.push({ type: "card", data });
      } catch {
        segments.push({ type: "text", text: jsonStr });
      }
      remaining = remaining.slice(cardEnd + "</ASSET_CARD>".length);
    } else {
      segments.push({ type: "actions" });
      remaining = remaining.slice(actionsIdx + "<ASSET_ACTIONS/>".length);
    }
  }

  return { segments };
}

// Asset card component
const AssetCardComponent = ({ asset, onViewDetail }: { asset: AssetCard; onViewDetail: (ref: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const score = parseInt(asset.scoring) || 0;

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden my-1.5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between gap-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${scoringColor(score)}`}>
            {score}/10
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{asset.tipo} — {asset.ubicacion}</p>
            <p className="text-[10px] text-muted-foreground">Ref: {asset.ref} · {asset.superficie}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-xs font-bold ${verdictColor(asset.veredicto)}`}>{asset.veredicto}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>

      {/* Price bar */}
      <div className="px-3 pb-2 flex items-center gap-3">
        <div>
          <span className="text-[10px] text-muted-foreground">Precio</span>
          <p className="text-xs font-bold text-foreground">{formatCurrency(asset.precio)}</p>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground">Mercado</span>
          <p className="text-xs font-medium text-muted-foreground line-through">{formatCurrency(asset.valor_mercado)}</p>
        </div>
        {asset.descuento && (
          <div className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
            -{asset.descuento}
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border px-3 py-2 space-y-2 bg-secondary/30">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            <div><span className="text-muted-foreground">Ocupación:</span> <span className="font-medium text-foreground">{asset.ocupacion || "N/A"}</span></div>
            <div><span className="text-muted-foreground">Judicial:</span> <span className="font-medium text-foreground">{asset.estado_judicial || "N/A"}</span></div>
            <div><span className="text-muted-foreground">Cesión remate:</span> <span className="font-medium text-foreground">{asset.cesion_remate ? "Sí" : "No"}</span></div>
            <div><span className="text-muted-foreground">Cesión crédito:</span> <span className="font-medium text-foreground">{asset.cesion_credito ? "Sí" : "No"}</span></div>
          </div>
          <p className="text-[11px] text-foreground leading-relaxed">{asset.resumen}</p>
          <Button
            size="sm"
            variant="outline"
            className="w-full h-7 text-[11px] gap-1.5"
            onClick={(e) => { e.stopPropagation(); onViewDetail(asset.ref); }}
          >
            <ExternalLink className="w-3 h-3" /> Ver ficha completa
          </Button>
        </div>
      )}
    </div>
  );
};

function formatCurrency(val: string) {
  const num = parseInt(val?.replace(/[^\d]/g, "") || "0");
  if (!num) return val || "N/A";
  return num.toLocaleString("es-ES") + " €";
}

// Action buttons after assets
const AssetActionsBar = ({ onAction }: { onAction: (action: string) => void }) => (
  <div className="my-2 space-y-1.5">
    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider px-1">¿Qué quieres hacer?</p>
    <div className="grid grid-cols-2 gap-1.5">
      <button
        onClick={() => onAction("alert")}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-[11px] text-foreground"
      >
        <Bell className="w-3.5 h-3.5 text-primary" />
        <span className="font-medium">Crear alerta</span>
      </button>
      <button
        onClick={() => onAction("map")}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-[11px] text-foreground"
      >
        <Map className="w-3.5 h-3.5 text-primary" />
        <span className="font-medium">Ver en mapa</span>
      </button>
      <button
        onClick={() => onAction("filter")}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-[11px] text-foreground"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
        <span className="font-medium">Filtrar más</span>
      </button>
      <button
        onClick={() => onAction("search")}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-[11px] text-foreground"
      >
        <Search className="w-3.5 h-3.5 text-primary" />
        <span className="font-medium">Buscar otro</span>
      </button>
    </div>
  </div>
);

const AiChatWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertFilters, setAlertFilters] = useState({ provincia: "", tipo_activo: "", precio_max: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(30);
    if (data) setConversations(data);
  }, [user]);

  useEffect(() => { if (isOpen) loadConversations(); }, [isOpen, loadConversations]);

  const loadConversation = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data as Msg[]);
      setActiveConvId(convId);
      setShowHistory(false);
    }
  }, []);

  const createConversation = useCallback(async (firstMessage: string): Promise<string | null> => {
    if (!user) return null;
    const title = firstMessage.length > 60 ? firstMessage.substring(0, 57) + "..." : firstMessage;
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();
    if (error || !data) return null;
    return data.id;
  }, [user]);

  const saveMessage = useCallback(async (convId: string, role: string, content: string) => {
    await supabase.from("chat_messages").insert({ conversation_id: convId, role, content });
    await supabase.from("chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
  }, []);

  const deleteConversation = useCallback(async (convId: string) => {
    await supabase.from("chat_conversations").delete().eq("id", convId);
    if (activeConvId === convId) { setActiveConvId(null); setMessages([]); }
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
    setShowHistory(false);

    try {
      let convId = activeConvId;
      if (user && !convId) {
        convId = await createConversation(msg);
        setActiveConvId(convId);
      }
      if (user && convId) await saveMessage(convId, "user", msg);

      const assistantContent = await streamChat(newMessages);

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
    setShowHistory(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleViewAssetDetail = async (ref: string) => {
    // Look up the real UUID by asset_id, then navigate
    const { data } = await supabase
      .from("npl_assets")
      .select("id")
      .eq("asset_id", ref)
      .maybeSingle();
    
    if (data?.id) {
      navigate(`/npl/${data.id}`);
    } else {
      // Fallback: navigate with the ref and let NplDetail handle lookup
      navigate(`/npl/${encodeURIComponent(ref)}`);
    }
    setIsOpen(false);
  };

  const handleCreateAlert = async () => {
    if (!user) {
      toast.info("Inicia sesión para crear alertas personalizadas");
      navigate("/auth");
      return;
    }

    const filters: Record<string, string> = {};
    if (alertFilters.provincia) filters.provincia = alertFilters.provincia;
    if (alertFilters.tipo_activo) filters.tipo_activo = alertFilters.tipo_activo;
    if (alertFilters.precio_max) filters.precio_max = alertFilters.precio_max;

    const name = [
      alertFilters.tipo_activo || "Todos los activos",
      alertFilters.provincia ? `en ${alertFilters.provincia}` : "",
      alertFilters.precio_max ? `< ${parseInt(alertFilters.precio_max).toLocaleString("es-ES")} €` : "",
    ].filter(Boolean).join(" ");

    const { error } = await supabase.from("alerts").insert({
      user_id: user.id,
      name,
      filters,
    });

    if (error) {
      toast.error("Error al crear la alerta");
    } else {
      toast.success("Alerta creada correctamente. Te avisaremos cuando haya nuevos activos.");
      setShowAlertForm(false);
      setAlertFilters({ provincia: "", tipo_activo: "", precio_max: "" });
    }
  };

  const handleAssetAction = (action: string) => {
    switch (action) {
      case "alert":
        if (!user) {
          toast.info("Inicia sesión para crear alertas personalizadas");
          navigate("/auth");
        } else {
          setShowAlertForm(true);
        }
        break;
      case "map":
        navigate("/inmuebles");
        setIsOpen(false);
        toast.info("Usa el mapa interactivo para explorar por ubicación");
        break;
      case "filter":
        handleSend("Ayúdame a refinar la búsqueda. Quiero filtrar por precio, tipo de activo, provincia o tipo de operación (cesión de remate, crédito, subasta). ¿Qué criterios quieres aplicar?");
        break;
      case "search":
        handleSend("Busca otro tipo de activo diferente. ¿Qué zona, rango de precio o tipo de inmueble te interesa?");
        break;
    }
  };

  const renderMessageContent = (content: string) => {
    const { segments } = parseAssetContent(content);

    return segments.map((seg, i) => {
      if (seg.type === "card" && seg.data) {
        return <AssetCardComponent key={i} asset={seg.data} onViewDetail={handleViewAssetDetail} />;
      }
      if (seg.type === "actions") {
        return <AssetActionsBar key={i} onAction={handleAssetAction} />;
      }
      // Text segment — render as markdown
      return (
        <div key={i} className="prose prose-xs dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 text-xs [&_p]:text-xs [&_li]:text-xs [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs">
          <ReactMarkdown>{seg.text || ""}</ReactMarkdown>
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-muted text-muted-foreground hover:bg-muted/80 scale-90"
            : "bg-primary text-primary-foreground hover:scale-110"
        }`}
        aria-label="Asesor IA"
      >
        {isOpen ? <X className="w-5 h-5" /> : <span className="text-2xl">👩‍💼</span>}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9998] w-[400px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-card rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-foreground text-sm leading-tight">Asesor IA</h2>
                <p className="text-[10px] text-muted-foreground">Comercial · Legal · Fiscal</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {user && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHistory(!showHistory)} title="Historial">
                  <Clock className="w-3.5 h-3.5" />
                </Button>
              )}
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNewChat} title="Nueva conversación">
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)} title="Minimizar">
                <Minus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* History panel */}
          {showHistory && user ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversaciones</span>
              </div>
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
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
                    <MessageSquare className="w-3 h-3 text-muted-foreground mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{conv.title}</p>
                      <p className="text-[10px] text-muted-foreground">{timeAgo(conv.updated_at)}</p>
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
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-2">
                    <Sparkles className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-heading text-sm font-bold text-foreground mb-1">¿En qué puedo ayudarte?</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Acceso a activos NPL, fiscalidad por CCAA, análisis legal y recomendaciones.
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 w-full">
                      {QUICK_PROMPTS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => handleSend(p.text)}
                          className="flex items-center gap-2 text-left px-3 py-2 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors text-xs text-foreground"
                        >
                          <p.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="font-medium">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center mt-1">
                          <Bot className="w-3 h-3 text-primary" />
                        </div>
                      )}
                      <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs ${
                        m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-foreground"
                      }`}>
                        {m.role === "assistant" ? renderMessageContent(m.content) : (
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-primary animate-pulse" />
                    </div>
                    <div className="bg-secondary/70 rounded-xl px-3 py-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border px-3 py-2 bg-background/50 flex-shrink-0">
                <div className="flex gap-2 items-end">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pregunta sobre activos, fiscal, legal..."
                    className="min-h-[36px] max-h-[80px] resize-none text-xs"
                    rows={1}
                    disabled={isLoading}
                  />
                  <Button onClick={() => handleSend()} disabled={!input.trim() || isLoading} size="icon" className="h-9 w-9 flex-shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AiChatWidget;

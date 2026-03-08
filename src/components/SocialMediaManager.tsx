import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import {
  Send, Sparkles, Calendar, BarChart3, Twitter, MessageCircle,
  Linkedin, Clock, CheckCircle, XCircle, RefreshCw, Trash2,
  Eye, Plus, Wand2, Copy, TrendingUp, Users, MousePointerClick, Target,
  Instagram, Facebook,
} from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.74a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.17z" />
  </svg>
);

type Channel = "twitter" | "telegram" | "whatsapp" | "linkedin" | "instagram" | "tiktok" | "facebook";
type PostStatus = "draft" | "scheduled" | "publishing" | "published" | "failed";

interface SocialPost {
  id: string;
  channel: Channel;
  content: string;
  media_url: string | null;
  asset_id: string | null;
  status: PostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  ai_generated: boolean;
  metrics: { impressions: number; clicks: number; engagement: number; leads: number };
  error_message: string | null;
  created_at: string;
}

interface AssetOption {
  id: string;
  asset_id: string | null;
  tipo_activo: string | null;
  municipio: string | null;
  provincia: string | null;
  precio_orientativo: number | null;
  valor_mercado: number | null;
  sqm: number | null;
  estado_ocupacional: string | null;
  cesion_remate: boolean | null;
  cesion_credito: boolean | null;
  anio_construccion: number | null;
  comunidad_autonoma: string | null;
}

const channelConfig: Record<Channel, { label: string; icon: any; color: string; bgColor: string }> = {
  twitter: { label: "Twitter/X", icon: Twitter, color: "text-foreground", bgColor: "bg-foreground/10" },
  telegram: { label: "Telegram", icon: Send, color: "text-[#0088cc]", bgColor: "bg-[#0088cc]/10" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "text-[#25D366]", bgColor: "bg-[#25D366]/10" },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "text-[#0A66C2]", bgColor: "bg-[#0A66C2]/10" },
  instagram: { label: "Instagram", icon: Instagram, color: "text-[#E4405F]", bgColor: "bg-[#E4405F]/10" },
  tiktok: { label: "TikTok", icon: TikTokIcon, color: "text-foreground", bgColor: "bg-foreground/10" },
  facebook: { label: "Facebook", icon: Facebook, color: "text-[#1877F2]", bgColor: "bg-[#1877F2]/10" },
};

const SocialMediaManager = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer state
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(["twitter"]);
  const [composerContent, setComposerContent] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filter
  const [filterChannel, setFilterChannel] = useState<Channel | "all">("all");
  const [filterStatus, setFilterStatus] = useState<PostStatus | "all">("all");

  useEffect(() => {
    loadPosts();
    loadAssets();
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase
      .from("social_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setPosts(data as unknown as SocialPost[]);
    setLoading(false);
  };

  const loadAssets = async () => {
    const { data } = await supabase
      .from("npl_assets")
      .select("id, asset_id, tipo_activo, municipio, provincia, precio_orientativo, valor_mercado, sqm, estado_ocupacional, cesion_remate, cesion_credito, anio_construccion, comunidad_autonoma")
      .eq("publicado", true)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setAssets(data as unknown as AssetOption[]);
  };

  const toggleChannel = (ch: Channel) => {
    setSelectedChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const generateWithAI = async () => {
    if (selectedChannels.length === 0) {
      toast.error("Selecciona al menos un canal");
      return;
    }
    setGenerating(true);
    try {
      const asset = selectedAssetId
        ? assets.find(a => a.id === selectedAssetId)
        : null;

      // Generate for the first selected channel
      const { data, error } = await supabase.functions.invoke("generate-social-post", {
        body: {
          channel: selectedChannels[0],
          asset: asset || null,
          custom_prompt: customPrompt || null,
        },
      });
      if (error) throw error;
      setComposerContent(data.content);
      toast.success("Contenido generado con IA");
    } catch (e: any) {
      toast.error(e.message || "Error generando contenido");
    }
    setGenerating(false);
  };

  const savePost = async (status: "draft" | "scheduled") => {
    if (!composerContent.trim()) {
      toast.error("Escribe o genera contenido primero");
      return;
    }
    if (selectedChannels.length === 0) {
      toast.error("Selecciona al menos un canal");
      return;
    }
    if (status === "scheduled" && !scheduledAt) {
      toast.error("Selecciona fecha y hora para programar");
      return;
    }

    setSaving(true);
    let saved = 0;

    for (const ch of selectedChannels) {
      const { error } = await supabase.from("social_posts").insert({
        channel: ch,
        content: composerContent.trim(),
        asset_id: selectedAssetId || null,
        status,
        scheduled_at: status === "scheduled" ? scheduledAt : null,
        ai_generated: generating || composerContent.includes("🏠"), // heuristic
        created_by: (await supabase.auth.getUser()).data.user?.id,
      } as any);
      if (!error) saved++;
    }

    if (saved > 0) {
      toast.success(`${saved} post(s) ${status === "scheduled" ? "programados" : "guardados como borrador"}`);
      setComposerContent("");
      setSelectedAssetId("");
      setCustomPrompt("");
      setScheduledAt("");
      loadPosts();
    } else {
      toast.error("Error guardando posts");
    }
    setSaving(false);
  };

  const publishNow = async (post: SocialPost) => {
    // Update status to publishing
    await supabase.from("social_posts").update({ status: "publishing" } as any).eq("id", post.id);

    // For mockup: simulate publishing with a delay
    setTimeout(async () => {
      await supabase.from("social_posts").update({
        status: "published",
        published_at: new Date().toISOString(),
        metrics: {
          impressions: Math.floor(Math.random() * 5000) + 100,
          clicks: Math.floor(Math.random() * 200) + 10,
          engagement: Math.floor(Math.random() * 100) + 5,
          leads: Math.floor(Math.random() * 15),
        },
      } as any).eq("id", post.id);
      toast.success(`Post publicado en ${channelConfig[post.channel].label}`);
      loadPosts();
    }, 1500);

    toast.info("Publicando...");
    loadPosts();
  };

  const deletePost = async (id: string) => {
    await supabase.from("social_posts").delete().eq("id", id);
    toast.success("Post eliminado");
    loadPosts();
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  // Filtered posts
  const filteredPosts = posts.filter(p => {
    if (filterChannel !== "all" && p.channel !== filterChannel) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    return true;
  });

  // Analytics
  const totalPosts = posts.length;
  const publishedPosts = posts.filter(p => p.status === "published");
  const totalImpressions = publishedPosts.reduce((s, p) => s + (p.metrics?.impressions || 0), 0);
  const totalClicks = publishedPosts.reduce((s, p) => s + (p.metrics?.clicks || 0), 0);
  const totalLeads = publishedPosts.reduce((s, p) => s + (p.metrics?.leads || 0), 0);
  const avgEngagement = publishedPosts.length > 0
    ? Math.round(publishedPosts.reduce((s, p) => s + (p.metrics?.engagement || 0), 0) / publishedPosts.length)
    : 0;

  const statusIcon = (s: PostStatus) => {
    switch (s) {
      case "draft": return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
      case "scheduled": return <Calendar className="w-3.5 h-3.5 text-accent" />;
      case "publishing": return <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />;
      case "published": return <CheckCircle className="w-3.5 h-3.5 text-[hsl(142,71%,45%)]" />;
      case "failed": return <XCircle className="w-3.5 h-3.5 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="composer" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="composer" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" /> Crear
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5" /> Publicaciones
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </TabsTrigger>
        </TabsList>

        {/* COMPOSER */}
        <TabsContent value="composer">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" /> Crear Publicación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Channel selector */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Canales</label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(channelConfig) as [Channel, typeof channelConfig.twitter][]).map(([ch, cfg]) => {
                        const Icon = cfg.icon;
                        const selected = selectedChannels.includes(ch);
                        return (
                          <Button
                            key={ch}
                            variant={selected ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleChannel(ch)}
                            className="gap-1.5 text-xs"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {cfg.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Asset selector */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Vincular activo (opcional)</label>
                    <select
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                    >
                      <option value="">Sin activo vinculado</option>
                      {assets.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.asset_id || a.id.slice(0, 8)} — {a.tipo_activo || "Activo"} | {a.municipio}, {a.provincia} | {a.precio_orientativo?.toLocaleString("es-ES") || "?"} €
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* AI prompt */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Instrucciones para la IA (opcional)</label>
                    <Input
                      placeholder="Ej: Enfoca en la rentabilidad, menciona que es zona turística..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={generateWithAI}
                    disabled={generating}
                    variant="outline"
                    className="gap-2 w-full border-accent/30 hover:bg-accent/10"
                  >
                    {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-accent" />}
                    Generar con IA
                  </Button>

                  {/* Content editor */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-medium text-muted-foreground">Contenido</label>
                      <span className="text-xs text-muted-foreground">{composerContent.length} chars</span>
                    </div>
                    <textarea
                      className="w-full min-h-[180px] rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                      placeholder="Escribe el contenido del post o genera con IA..."
                      value={composerContent}
                      onChange={(e) => setComposerContent(e.target.value)}
                    />
                  </div>

                  {/* Schedule */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Programar (opcional)</label>
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button onClick={() => savePost("draft")} variant="outline" disabled={saving} className="flex-1 gap-2">
                      <Clock className="w-4 h-4" /> Guardar borrador
                    </Button>
                    {scheduledAt ? (
                      <Button onClick={() => savePost("scheduled")} disabled={saving} className="flex-1 gap-2">
                        <Calendar className="w-4 h-4" /> Programar
                      </Button>
                    ) : (
                      <Button onClick={() => savePost("draft")} disabled={saving || !composerContent.trim()} className="flex-1 gap-2">
                        <Send className="w-4 h-4" /> Guardar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Vista previa</CardTitle></CardHeader>
                <CardContent>
                  {composerContent ? (
                    <div className="space-y-3">
                      {selectedChannels.map(ch => {
                        const cfg = channelConfig[ch];
                        const Icon = cfg.icon;
                        return (
                          <div key={ch} className={`rounded-xl p-3 ${cfg.bgColor} border border-border/50`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                              <span className="text-xs font-medium text-foreground">{cfg.label}</span>
                              {ch === "twitter" && composerContent.length > 280 && (
                                <Badge variant="destructive" className="text-[9px]">+{composerContent.length - 280}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-foreground whitespace-pre-line leading-relaxed">{composerContent}</p>
                          </div>
                        );
                      })}
                      <Button variant="ghost" size="sm" onClick={() => copyContent(composerContent)} className="w-full gap-2 text-xs">
                        <Copy className="w-3.5 h-3.5" /> Copiar texto
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      Escribe o genera contenido para ver la vista previa
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">Límites por canal</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Twitter/X</span><span className="font-mono text-foreground">280 chars</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Telegram</span><span className="font-mono text-foreground">4.096 chars</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">WhatsApp</span><span className="font-mono text-foreground">1.024 chars</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">LinkedIn</span><span className="font-mono text-foreground">3.000 chars</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* PUBLICATIONS */}
        <TabsContent value="calendar">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value as any)}
              >
                <option value="all">Todos los canales</option>
                {Object.entries(channelConfig).map(([ch, cfg]) => (
                  <option key={ch} value={ch}>{cfg.label}</option>
                ))}
              </select>
              <select
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="scheduled">Programado</option>
                <option value="published">Publicado</option>
                <option value="failed">Fallido</option>
              </select>
              <div className="flex-1" />
              <Badge variant="secondary">{filteredPosts.length} posts</Badge>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay publicaciones {filterStatus !== "all" ? `con estado "${filterStatus}"` : ""}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPosts.map(post => {
                  const cfg = channelConfig[post.channel];
                  const Icon = cfg.icon;
                  return (
                    <Card key={post.id}>
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bgColor}`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {statusIcon(post.status)}
                            <span className="text-xs font-medium text-foreground capitalize">{post.status}</span>
                            {post.ai_generated && <Badge variant="outline" className="text-[9px] gap-1"><Sparkles className="w-2.5 h-2.5" />IA</Badge>}
                            <span className="text-[10px] text-muted-foreground ml-auto">
                              {new Date(post.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs text-foreground line-clamp-3 whitespace-pre-line">{post.content}</p>
                          {post.scheduled_at && post.status === "scheduled" && (
                            <p className="text-[10px] text-accent mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Programado: {new Date(post.scheduled_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                          {post.status === "published" && post.metrics && (
                            <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.metrics.impressions}</span>
                              <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" />{post.metrics.clicks}</span>
                              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{post.metrics.engagement}</span>
                              <span className="flex items-center gap-1"><Target className="w-3 h-3" />{post.metrics.leads} leads</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          {(post.status === "draft" || post.status === "scheduled") && (
                            <Button variant="outline" size="sm" onClick={() => publishNow(post)} className="text-xs gap-1 h-7">
                              <Send className="w-3 h-3" /> Publicar
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => copyContent(post.content)} className="text-xs gap-1 h-7">
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deletePost(post.id)} className="text-xs text-destructive gap-1 h-7">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ANALYTICS */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Publicaciones", value: publishedPosts.length, icon: CheckCircle, total: totalPosts, sublabel: `de ${totalPosts} total` },
                { label: "Impresiones", value: totalImpressions, icon: Eye, sublabel: "alcance total" },
                { label: "Clics", value: totalClicks, icon: MousePointerClick, sublabel: "tráfico generado" },
                { label: "Leads", value: totalLeads, icon: Target, sublabel: "captados por redes" },
              ].map(kpi => {
                const Icon = kpi.icon;
                return (
                  <Card key={kpi.label}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{kpi.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{kpi.value.toLocaleString("es-ES")}</p>
                      <p className="text-[10px] text-muted-foreground">{kpi.sublabel}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Per-channel breakdown */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Rendimiento por canal</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Object.entries(channelConfig) as [Channel, typeof channelConfig.twitter][]).map(([ch, cfg]) => {
                    const Icon = cfg.icon;
                    const chPosts = posts.filter(p => p.channel === ch && p.status === "published");
                    const chImpressions = chPosts.reduce((s, p) => s + (p.metrics?.impressions || 0), 0);
                    const chClicks = chPosts.reduce((s, p) => s + (p.metrics?.clicks || 0), 0);
                    const chLeads = chPosts.reduce((s, p) => s + (p.metrics?.leads || 0), 0);
                    const ctr = chImpressions > 0 ? Math.round((chClicks / chImpressions) * 1000) / 10 : 0;

                    return (
                      <div key={ch} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bgColor}`}>
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-foreground">{cfg.label}</span>
                          <p className="text-[10px] text-muted-foreground">{chPosts.length} publicaciones</p>
                        </div>
                        <div className="text-right text-xs space-y-0.5">
                          <p className="text-foreground font-mono">{chImpressions.toLocaleString("es-ES")} imp.</p>
                          <p className="text-muted-foreground">{ctr}% CTR · {chLeads} leads</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Engagement medio</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center">
                    <span className="text-xl font-bold text-foreground">{avgEngagement}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Engagement medio por publicación</p>
                    <p className="text-xs mt-1">Basado en {publishedPosts.length} publicaciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMediaManager;

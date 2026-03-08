import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Euro, Gavel, Clock, TrendingUp, Users, UserCheck, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";

interface AuctionSettings {
  auction_type: string;
  start_date: string | null;
  end_date: string | null;
  min_bid: number;
  bid_increment: number;
  is_active: boolean;
}

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  full_name: string;
}

interface BiddingPanelProps {
  assetId: string;
  precioOrientativo?: number;
  userId?: string;
  userName?: string;
  userEmail?: string;
}

const BiddingPanel = ({ assetId, precioOrientativo = 0, userId, userName = "", userEmail = "" }: BiddingPanelProps) => {
  const [auction, setAuction] = useState<AuctionSettings | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [highestBid, setHighestBid] = useState(0);
  const [bidCount, setBidCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [representacion, setRepresentacion] = useState<"propio" | "tercero">("propio");
  const [personaTipo, setPersonaTipo] = useState<"fisica" | "juridica">("fisica");
  const [form, setForm] = useState({
    amount: "",
    fullName: userName,
    email: userEmail,
    phone: "",
    empresa: "",
    cif: "",
    representedName: "",
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, fullName: userName, email: userEmail }));
  }, [userName, userEmail]);

  const fetchData = useCallback(async () => {
    const [auctionRes, bidsRes] = await Promise.all([
      supabase.from("auction_settings").select("*").eq("asset_id", assetId).maybeSingle(),
      supabase.from("bids").select("id, amount, created_at, status, full_name").eq("asset_id", assetId).eq("status", "active").order("amount", { ascending: false }).limit(10),
    ]);
    setAuction((auctionRes.data as unknown as AuctionSettings) || null);
    const bidData = (bidsRes.data as unknown as Bid[]) || [];
    setBids(bidData);
    setHighestBid(bidData.length > 0 ? bidData[0].amount : 0);
    setBidCount(bidData.length);
    setLoading(false);
  }, [assetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription for bids
  useEffect(() => {
    const channel = supabase
      .channel(`bids-${assetId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bids", filter: `asset_id=eq.${assetId}` }, () => {
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [assetId, fetchData]);

  // Countdown timer
  useEffect(() => {
    if (!auction?.end_date) return;
    const interval = setInterval(() => {
      const end = new Date(auction.end_date!).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("Subasta finalizada");
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [auction?.end_date]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) { toast.error("Inicia sesión para hacer una oferta"); return; }

    const amount = parseFloat(form.amount.replace(/[^\d.,]/g, "").replace(",", "."));
    if (isNaN(amount) || amount <= 0) { toast.error("Introduce un importe válido"); return; }

    const minBid = auction?.min_bid || Math.round(precioOrientativo * 0.95);
    if (minBid > 0 && amount < minBid) {
      toast.error(`La oferta mínima es de ${minBid.toLocaleString("es-ES")} €`);
      return;
    }

    if (auction?.bid_increment && highestBid > 0 && amount < highestBid + auction.bid_increment) {
      toast.error(`Debes superar la oferta actual en al menos ${auction.bid_increment.toLocaleString("es-ES")} €`);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("bids").insert({
      asset_id: assetId,
      user_id: userId,
      amount,
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      representacion,
      persona_tipo: personaTipo,
      empresa: personaTipo === "juridica" ? form.empresa.trim() : null,
      cif: personaTipo === "juridica" ? form.cif.trim() : null,
      represented_name: representacion === "tercero" ? form.representedName.trim() : null,
    });

    if (error) {
      console.error(error);
      toast.error("Error al enviar la oferta");
    } else {
      toast.success("¡Oferta enviada correctamente!");
      setForm((prev) => ({ ...prev, amount: "", representedName: "", empresa: "", cif: "" }));
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isAuction = auction?.is_active && auction?.auction_type !== "private_sale";
  const minBid = auction?.min_bid || Math.round(precioOrientativo * 0.95);
  const nextMinBid = highestBid > 0 && auction?.bid_increment ? highestBid + auction.bid_increment : minBid;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className={`p-5 ${isAuction ? "bg-gradient-to-r from-accent to-primary" : "bg-primary"}`}>
        <h3 className="font-heading text-xl font-bold text-primary-foreground flex items-center gap-2">
          {isAuction ? <Gavel className="w-5 h-5" /> : <Euro className="w-5 h-5" />}
          {isAuction ? "Subasta activa" : "¡Haz tu oferta!"}
        </h3>
        {isAuction && timeLeft && (
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-4 h-4 text-primary-foreground/70" />
            <span className="text-sm font-mono text-primary-foreground/90">{timeLeft}</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Bid stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">
              {isAuction ? "Oferta más alta" : "Precio orientativo"}
            </p>
            <p className="text-lg font-bold text-accent">
              {(isAuction && highestBid > 0 ? highestBid : precioOrientativo).toLocaleString("es-ES")} €
            </p>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">
              {isAuction ? "Ofertas recibidas" : "Oferta mínima"}
            </p>
            <p className="text-lg font-bold text-foreground">
              {isAuction ? bidCount : `${minBid.toLocaleString("es-ES")} €`}
            </p>
          </div>
        </div>

        {/* Live bid ticker for auctions */}
        {isAuction && bids.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Últimas ofertas
            </p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {bids.slice(0, 5).map((bid, i) => (
                <div key={bid.id} className={`flex items-center justify-between text-xs p-2 rounded-lg ${i === 0 ? "bg-accent/10 border border-accent/20" : "bg-muted/50"}`}>
                  <span className="text-muted-foreground">
                    {bid.full_name.split(" ")[0]}***
                  </span>
                  <span className={`font-bold ${i === 0 ? "text-accent" : "text-foreground"}`}>
                    {bid.amount.toLocaleString("es-ES")} €
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border" />

        {/* Representación */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-2">¿Quién hace la oferta?</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setRepresentacion("propio")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${representacion === "propio" ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-muted-foreground border-border hover:border-accent/50"}`}>
              <UserCheck className="w-4 h-4" /> En nombre propio
            </button>
            <button type="button" onClick={() => setRepresentacion("tercero")}
              className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${representacion === "tercero" ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-muted-foreground border-border hover:border-accent/50"}`}>
              <Users className="w-4 h-4" /> Representación
            </button>
          </div>
        </div>

        {/* Persona tipo */}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setPersonaTipo("fisica")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${personaTipo === "fisica" ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-muted-foreground border-border hover:border-accent/50"}`}>
            <User className="w-4 h-4" /> Persona física
          </button>
          <button type="button" onClick={() => setPersonaTipo("juridica")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${personaTipo === "juridica" ? "bg-accent text-accent-foreground border-accent" : "bg-secondary text-muted-foreground border-border hover:border-accent/50"}`}>
            <Building2 className="w-4 h-4" /> Persona jurídica
          </button>
        </div>

        <div className="border-t border-border" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nombre completo *" required maxLength={100} />
          <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email *" required maxLength={255} />
          <Input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Teléfono" maxLength={20} />

          {representacion === "tercero" && (
            <Input name="representedName" value={form.representedName} onChange={handleChange} placeholder="Nombre del representado *" required maxLength={100} />
          )}
          {personaTipo === "juridica" && (
            <>
              <Input name="empresa" value={form.empresa} onChange={handleChange} placeholder="Razón social *" required maxLength={200} />
              <Input name="cif" value={form.cif} onChange={handleChange} placeholder="CIF *" required maxLength={20} />
            </>
          )}

          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">
              {isAuction ? "Tu oferta" : "Importe de la oferta"}
            </label>
            <Input name="amount" value={form.amount} onChange={handleChange} placeholder={`Introduce tu oferta (€) *`} required maxLength={20} />
            <p className="text-xs text-muted-foreground mt-1.5">
              {isAuction ? (
                <>Oferta mínima: <span className="font-bold text-accent">{nextMinBid.toLocaleString("es-ES")} €</span></>
              ) : (
                minBid > 0 && <>Introduce <span className="font-bold text-accent">{minBid.toLocaleString("es-ES")} €</span> o más.</>
              )}
            </p>
          </div>

          <Button type="submit" disabled={submitting || !userId} className="w-full gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Enviando..." : isAuction ? "Pujar" : "Enviar oferta"}
          </Button>

          {!userId && (
            <p className="text-xs text-center text-muted-foreground">
              <a href="/auth" className="text-accent hover:underline">Inicia sesión</a> para hacer una oferta.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default BiddingPanel;

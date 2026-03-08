import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Loader2 } from "lucide-react";

interface WaitlistButtonProps {
  assetId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

const WaitlistButton = ({ assetId, userId, userEmail, userName }: WaitlistButtonProps) => {
  const [inWaitlist, setInWaitlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase
      .from("waitlist")
      .select("id")
      .eq("asset_id", assetId)
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setInWaitlist(!!data);
        setLoading(false);
      });
  }, [assetId, userId]);

  const handleJoin = async () => {
    if (!userId || !userEmail) {
      toast.error("Inicia sesión para unirte a la lista de espera");
      return;
    }
    setJoining(true);
    try {
      // Get current max position
      const { data: maxPos } = await supabase
        .from("waitlist")
        .select("position")
        .eq("asset_id", assetId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextPosition = (maxPos?.position || 0) + 1;

      const { error } = await supabase.from("waitlist").insert({
        asset_id: assetId,
        user_id: userId,
        email: userEmail,
        full_name: userName || userEmail,
        position: nextPosition,
      });

      if (error) throw error;
      setInWaitlist(true);
      toast.success(`Te has unido a la lista de espera (posición ${nextPosition})`);

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: userId,
        action: "joined_waitlist",
        entity_type: "npl_asset",
        entity_id: assetId,
      });
    } catch (err: any) {
      toast.error(err.message || "Error al unirse a la lista de espera");
    }
    setJoining(false);
  };

  const handleLeave = async () => {
    if (!userId) return;
    setJoining(true);
    await supabase.from("waitlist").delete().eq("asset_id", assetId).eq("user_id", userId);
    setInWaitlist(false);
    toast.success("Has salido de la lista de espera");
    setJoining(false);
  };

  if (loading) return null;

  if (inWaitlist) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-primary">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Estás en la lista de espera</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleLeave} disabled={joining} className="w-full text-xs">
          Salir de la lista de espera
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleJoin} disabled={joining} className="w-full gap-2" variant="secondary">
      {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
      Añadirme a la lista de espera
    </Button>
  );
};

export default WaitlistButton;

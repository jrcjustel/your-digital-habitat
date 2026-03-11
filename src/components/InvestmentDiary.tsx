import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { StickyNote, Save, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface DiaryEntry {
  id: string;
  asset_id: string;
  asset_reference: string;
  note: string;
  created_at: string;
}

const InvestmentDiary = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [newRef, setNewRef] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Load from localStorage since this is a lightweight feature
    const stored = localStorage.getItem(`ikesa-diary-${user.id}`);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, [user]);

  const persist = (updated: DiaryEntry[]) => {
    if (!user) return;
    setEntries(updated);
    localStorage.setItem(`ikesa-diary-${user.id}`, JSON.stringify(updated));
  };

  const addEntry = () => {
    if (!newNote.trim()) {
      toast.error("Escribe una nota antes de guardar");
      return;
    }
    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      asset_id: "",
      asset_reference: newRef.trim() || "General",
      note: newNote.trim(),
      created_at: new Date().toISOString(),
    };
    persist([entry, ...entries]);
    setNewNote("");
    setNewRef("");
    toast.success("Nota guardada");
  };

  const deleteEntry = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
    toast.success("Nota eliminada");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <StickyNote className="w-5 h-5 text-accent" />
        <h3 className="font-heading text-lg font-bold text-foreground">Diario de Inversión</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Anota tus observaciones, análisis y decisiones sobre los activos que estás evaluando.
      </p>

      {/* New entry */}
      <Card className="border-accent/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Referencia del activo (opcional)"
              value={newRef}
              onChange={(e) => setNewRef(e.target.value)}
              className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 border-0 focus:ring-1 focus:ring-accent outline-none"
            />
          </div>
          <Textarea
            placeholder="Escribe tu nota de análisis, observaciones o decisiones..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <Button size="sm" onClick={addEntry} className="gap-2">
            <Plus className="w-4 h-4" /> Añadir nota
          </Button>
        </CardContent>
      </Card>

      {/* Entries */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <StickyNote className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No tienes notas todavía.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Usa el diario para documentar tu análisis de oportunidades.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        {entry.asset_reference}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString("es-ES", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{entry.note}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteEntry(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestmentDiary;

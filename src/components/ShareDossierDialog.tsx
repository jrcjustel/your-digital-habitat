import { useState } from "react";
import { Mail, Send, Copy, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { DossierData } from "@/lib/dossier/types";
import { generateDossierBlob } from "@/lib/dossier";

interface ShareDossierDialogProps {
  dossierData: DossierData;
  children?: React.ReactNode;
}

const ShareDossierDialog = ({ dossierData, children }: ShareDossierDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [sending, setSending] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      toast.error("Introduce un email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Formato de email inválido");
      return;
    }

    if (!user) {
      toast.error("Debes iniciar sesión para enviar dossiers");
      return;
    }

    setSending(true);
    try {
      // 1. Generate PDF blob
      const blob = await generateDossierBlob(dossierData);

      // 2. Upload to storage
      const fileName = `${user.id}/${dossierData.reference}-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("dossiers")
        .upload(fileName, blob, { contentType: "application/pdf" });

      if (uploadError) {
        throw new Error(`Error al subir el PDF: ${uploadError.message}`);
      }

      // 3. Call edge function to get signed URL + mailto
      const { data, error } = await supabase.functions.invoke("send-dossier", {
        body: {
          recipientEmail: email.trim(),
          recipientName: recipientName.trim() || undefined,
          filePath: fileName,
          reference: dossierData.reference,
          senderName: user.email?.split("@")[0],
        },
      });

      if (error) throw error;

      if (data?.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
      }

      // Open mailto
      if (data?.mailtoUrl) {
        window.open(data.mailtoUrl, "_blank");
      }

      toast.success("Email preparado — revisa tu cliente de correo");
    } catch (err: any) {
      console.error("Error sending dossier:", err);
      toast.error(err?.message || "Error al preparar el envío");
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = async () => {
    if (!downloadUrl) return;
    await navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEmail("");
      setRecipientName("");
      setDownloadUrl(null);
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="w-3.5 h-3.5" />
            Enviar por email
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Enviar Dossier de Inversión
          </DialogTitle>
          <DialogDescription>
            Ref: {dossierData.reference} — Se generará el PDF y se abrirá tu cliente de correo con el enlace de descarga.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Email del destinatario *</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="inversor@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient-name">Nombre del destinatario (opcional)</Label>
            <Input
              id="recipient-name"
              type="text"
              placeholder="Juan García"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              maxLength={100}
              disabled={sending}
            />
          </div>

          {!user && (
            <p className="text-sm text-destructive">
              Debes iniciar sesión para enviar dossiers por email.
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSend}
              disabled={sending || !user || !email.trim()}
              className="flex-1 gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar dossier
                </>
              )}
            </Button>
          </div>

          {downloadUrl && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Enlace de descarga (válido 7 días):
              </p>
              <div className="flex gap-2">
                <Input
                  value={downloadUrl}
                  readOnly
                  className="text-xs font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  title="Copiar enlace"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDossierDialog;

import { useState } from "react";
import { MessageCircle, Send, X, Instagram, Facebook } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Placeholder URLs — replace with your real channel/number links
const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/IKESA";
const WHATSAPP_CHAT_URL = "https://wa.me/34600000000?text=Hola%2C%20me%20interesa%20una%20consulta%20sobre%20activos%20de%20IKESA";
const TELEGRAM_CHANNEL_URL = "https://t.me/ikesa_inversiones";
const TELEGRAM_BOT_URL = "https://t.me/ikesa_bot";
const INSTAGRAM_URL = "https://instagram.com/ikesa_inversiones";
const TIKTOK_URL = "https://tiktok.com/@ikesa_inversiones";
const FACEBOOK_URL = "https://facebook.com/ikesainversiones";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.74a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.17z" />
  </svg>
);

const SocialChannelsFloat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const channels = [
    {
      label: "WhatsApp Chat",
      description: "Habla con un asesor",
      url: WHATSAPP_CHAT_URL,
      icon: <MessageCircle className="w-5 h-5" />,
      color: "bg-[#25D366]",
      hoverColor: "hover:bg-[#20bd5a]",
    },
    {
      label: "Canal WhatsApp",
      description: "Ofertas y novedades",
      url: WHATSAPP_CHANNEL_URL,
      icon: <MessageCircle className="w-5 h-5" />,
      color: "bg-[#25D366]",
      hoverColor: "hover:bg-[#20bd5a]",
    },
    {
      label: "Canal Telegram",
      description: "Alertas de inversión",
      url: TELEGRAM_CHANNEL_URL,
      icon: <Send className="w-5 h-5" />,
      color: "bg-[#0088cc]",
      hoverColor: "hover:bg-[#0077b3]",
    },
    {
      label: "Bot Telegram",
      description: "Consulta activos",
      url: TELEGRAM_BOT_URL,
      icon: <Send className="w-5 h-5" />,
      color: "bg-[#0088cc]",
      hoverColor: "hover:bg-[#0077b3]",
    },
    {
      label: "Instagram",
      description: "Contenido visual",
      url: INSTAGRAM_URL,
      icon: <Instagram className="w-5 h-5" />,
      color: "bg-[#E4405F]",
      hoverColor: "hover:bg-[#d63150]",
    },
    {
      label: "TikTok",
      description: "Vídeos cortos",
      url: TIKTOK_URL,
      icon: <TikTokIcon className="w-5 h-5" />,
      color: "bg-[#010101]",
      hoverColor: "hover:bg-[#333]",
    },
    {
      label: "Facebook",
      description: "Comunidad inversora",
      url: FACEBOOK_URL,
      icon: <Facebook className="w-5 h-5" />,
      color: "bg-[#1877F2]",
      hoverColor: "hover:bg-[#1565d8]",
    },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-[9997] flex flex-col items-start gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border rounded-2xl shadow-2xl p-3 mb-2 w-64"
          >
            <p className="text-xs font-heading font-bold text-foreground mb-2 px-1">
              Canales de difusión
            </p>
            <div className="space-y-1.5">
              {channels.map((ch) => (
                <a
                  key={ch.label}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-white ${ch.color} ${ch.hoverColor} transition-colors`}
                >
                  {ch.icon}
                  <div>
                    <p className="text-sm font-semibold leading-tight">{ch.label}</p>
                    <p className="text-[10px] text-white/80">{ch.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-muted text-muted-foreground hover:bg-muted/80 scale-90"
            : "bg-[#25D366] text-white hover:scale-110"
        }`}
        aria-label="Canales de contacto"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

export default SocialChannelsFloat;

import { useNavigate } from "react-router-dom";
import { MessageCircle, Send, Instagram, Facebook, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.74a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.17z" />
  </svg>
);

const footerSections = [
  {
    title: "Explora inmuebles",
    links: [
      { label: "Viviendas", href: "/inmuebles?type=vivienda" },
      { label: "Locales", href: "/inmuebles?type=local" },
      { label: "Oficinas", href: "/inmuebles?type=oficina" },
      { label: "Terrenos", href: "/inmuebles?type=terreno" },
      { label: "Naves", href: "/inmuebles?type=nave" },
      { label: "NPL (Deuda)", href: "/inmuebles?saleType=npl" },
      { label: "Cesiones de Remate", href: "/inmuebles?saleType=cesion-remate" },
      { label: "Activos Ocupados", href: "/inmuebles?saleType=ocupado" },
    ],
  },
  {
    title: "Aprende con nosotros",
    links: [
      { label: "Ruta Ocupados", href: "/academia/ruta/ruta-inmuebles-ocupados" },
      { label: "Ruta Cesiones de Remate", href: "/academia/ruta/ruta-cesiones-remate" },
      { label: "Ruta Subastas BOE", href: "/academia/ruta/ruta-subastas-boe" },
      { label: "Ruta Deuda / NPL", href: "/academia/ruta/ruta-deuda-npl" },
      { label: "Todos los artículos", href: "/academia" },
      { label: "Cómo funciona", href: "/como-funciona" },
      { label: "Valorar mi inmueble", href: "/valorar" },
    ],
  },
  {
    title: "Transparencia",
    links: [
      { label: "Aviso legal", href: "/aviso-legal" },
      { label: "Política de privacidad", href: "/privacidad" },
      { label: "Política de cookies", href: "/cookies" },
      { label: "Canal de denuncias", href: "/canal-denuncias" },
    ],
  },
];

const popularSearches = [
  { label: "Viviendas en Cádiz", href: "/inmuebles?q=cádiz&type=vivienda" },
  { label: "Locales en Sevilla", href: "/inmuebles?q=sevilla&type=local" },
  { label: "Terrenos en Huelva", href: "/inmuebles?q=huelva&type=terreno" },
  { label: "Inversión en Málaga", href: "/inmuebles?q=málaga&saleType=npl" },
  { label: "NPLs España", href: "/inmuebles?saleType=npl" },
];

const socialChannels = [
  { href: "https://whatsapp.com/channel/IKESA", icon: MessageCircle, label: "Canal WhatsApp", className: "bg-[#25D366] hover:bg-[#20bd5a] text-white" },
  { href: "https://wa.me/34600000000?text=Hola%2C%20quiero%20información%20sobre%20activos%20IKESA", icon: MessageCircle, label: "WhatsApp directo", className: "bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30" },
  { href: "https://t.me/ikesa_inversiones", icon: Send, label: "Canal Telegram", className: "bg-[#0088cc] hover:bg-[#0077b3] text-white" },
  { href: "https://t.me/ikesa_bot", icon: Send, label: "Bot Telegram", className: "bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-[#0088cc] border border-[#0088cc]/30" },
  { href: "https://instagram.com/ikesa_inversiones", icon: Instagram, label: "Instagram", className: "bg-[#E4405F] hover:bg-[#d63150] text-white" },
  { href: "https://tiktok.com/@ikesa_inversiones", icon: TikTokIcon, label: "TikTok", className: "bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground" },
  { href: "https://facebook.com/ikesainversiones", icon: Facebook, label: "Facebook", className: "bg-[#1877F2] hover:bg-[#1565d8] text-white" },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Organic blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <span className="font-heading text-2xl font-extrabold text-primary-foreground">ikesa</span>
            <span className="block text-xs text-accent mt-0.5 font-medium tracking-wide">Inmobiliaria / Real Estate</span>
            <p className="text-primary-foreground/50 text-sm leading-relaxed mt-3">
              Invertir en inmuebles no debería ser solo para unos pocos. Nosotros te abrimos la puerta.
            </p>
            <motion.button
              onClick={() => navigate("/como-funciona")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors group"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Descubre cómo funciona
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </div>

          {footerSections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: si * 0.08, duration: 0.4 }}
            >
              <h4 className="font-heading font-bold text-sm mb-4 text-primary-foreground/90">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.href)}
                      className="text-sm text-primary-foreground/45 hover:text-primary-foreground hover:translate-x-1 transition-all duration-200 text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="border-t border-primary-foreground/10 pt-8 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="font-heading font-bold text-sm mb-3 text-primary-foreground/80">Lo que más se busca ahora</h4>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search) => (
              <motion.button
                key={search.label}
                onClick={() => navigate(search.href)}
                className="text-xs text-primary-foreground/40 hover:text-primary-foreground border border-primary-foreground/10 hover:border-primary-foreground/30 px-3.5 py-1.5 rounded-full transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {search.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="border-t border-primary-foreground/10 pt-8 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h4 className="font-heading font-bold text-sm mb-1 text-primary-foreground/80">Estemos en contacto</h4>
          <p className="text-xs text-primary-foreground/40 mb-4">Elige el canal que más te guste — publicamos oportunidades a diario.</p>
          <div className="flex flex-wrap gap-2.5">
            {socialChannels.map((ch, i) => (
              <motion.a
                key={ch.label}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${ch.className}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <ch.icon className="w-4 h-4" />
                {ch.label}
              </motion.a>
            ))}
          </div>
        </motion.div>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/30">
            © 2026 IKESA Inmobiliaria / Real Estate · Hecho con cariño en España 🇪🇸
          </p>
          <div className="flex items-center gap-4">
            {["Aviso Legal", "Privacidad", "Cookies", "Canal de Denuncias"].map((item) => {
              const routes: Record<string, string> = {
                "Aviso Legal": "/aviso-legal",
                "Privacidad": "/privacidad",
                "Cookies": "/cookies",
                "Canal de Denuncias": "/canal-denuncias",
              };
              return (
                <button
                  key={item}
                  onClick={() => navigate(routes[item])}
                  className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors"
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
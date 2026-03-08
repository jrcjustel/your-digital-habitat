import { useNavigate } from "react-router-dom";
import { MessageCircle, Send } from "lucide-react";

const footerSections = [
  {
    title: "Inmuebles",
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
    title: "Academia",
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
    title: "Legal",
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

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <span className="font-heading text-2xl font-extrabold text-primary-foreground">ikesa</span>
            <span className="block text-xs text-accent mt-0.5 font-medium">Inmobiliaria / Real Estate</span>
            <p className="text-primary-foreground/50 text-sm leading-relaxed mt-2">
              Democratizamos la inversión inmobiliaria. Acceso transparente a oportunidades de alta rentabilidad para todos.
            </p>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-heading font-bold text-sm mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.href)}
                      className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 mb-8">
          <h4 className="font-heading font-bold text-sm mb-3">Los más buscados</h4>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search) => (
              <button
                key={search.label}
                onClick={() => navigate(search.href)}
                className="text-xs text-primary-foreground/40 hover:text-primary-foreground border border-primary-foreground/10 px-3 py-1.5 rounded-full transition-colors"
              >
                {search.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canales de difusión */}
        <div className="border-t border-primary-foreground/10 pt-8 mb-8">
          <h4 className="font-heading font-bold text-sm mb-4">Síguenos en nuestros canales</h4>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://whatsapp.com/channel/IKESA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              Canal WhatsApp
            </a>
            <a
              href="https://wa.me/34600000000?text=Hola%2C%20quiero%20información%20sobre%20activos%20IKESA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp directo
            </a>
            <a
              href="https://t.me/ikesa_inversiones"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
            >
              <Send className="w-4 h-4" />
              Canal Telegram
            </a>
            <a
              href="https://t.me/ikesa_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-[#0088cc] border border-[#0088cc]/30 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
            >
              <Send className="w-4 h-4" />
              Bot Telegram
            </a>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/30">
            © 2026 IKESA Inmobiliaria / Real Estate. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/aviso-legal")} className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Aviso Legal
            </button>
            <button onClick={() => navigate("/privacidad")} className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Privacidad
            </button>
            <button onClick={() => navigate("/cookies")} className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Cookies
            </button>
            <button onClick={() => navigate("/canal-denuncias")} className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Canal de Denuncias
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Menu, X, Heart, LogOut, Shield, ChevronDown, Map, Calculator, GitCompare, Gavel, Store, TrendingUp, Brain, BarChart3, BookOpen, Wrench, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useRole";
import ikesaLogo from "@/assets/ikesa-logo-color.png";

interface DropdownItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface NavGroup {
  label: string;
  items: DropdownItem[];
}

interface NavSingle {
  label: string;
  href: string;
}

type NavEntry = NavSingle | NavGroup;

const isGroup = (entry: NavEntry): entry is NavGroup => "items" in entry;

const navEntries: NavEntry[] = [
  { label: "Inmuebles", href: "/inmuebles" },
  {
    label: "Inversión",
    items: [
      { label: "Marketplace", href: "/marketplace", icon: Store, description: "Activos disponibles" },
      { label: "Subastas", href: "/subastas", icon: Gavel, description: "Pujas en tiempo real" },
      { label: "Inversiones", href: "/inversiones", icon: TrendingUp, description: "Portfolio y seguimiento" },
      { label: "Inversores", href: "/inversores", icon: BarChart3, description: "Hub del inversor" },
    ],
  },
  {
    label: "Herramientas",
    items: [
      { label: "Calculadoras", href: "/calculadoras", icon: Calculator, description: "Hipoteca y rentabilidad" },
      { label: "Mapa", href: "/mapa", icon: Map, description: "Explorar por ubicación" },
      { label: "Comparador", href: "/comparador", icon: GitCompare, description: "Compara activos" },
      { label: "Valorar inmueble", href: "/valorar", icon: Home, description: "Valoración online" },
    ],
  },
  {
    label: "IA & Análisis",
    items: [
      { label: "Insights IA", href: "/ai-insights", icon: Brain, description: "Análisis con IA" },
      { label: "Analítica predictiva", href: "/analitica-predictiva", icon: TrendingUp, description: "Predicciones de mercado" },
      { label: "Valoración híbrida", href: "/valoracion-hibrida", icon: BarChart3, description: "IA + datos reales" },
    ],
  },
  { label: "Academia", href: "/academia" },
  { label: "Servicios", href: "/servicios" },
];

const DropdownMenu = ({ group, onNavigate }: { group: NavGroup; onNavigate: (href: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => { if (timeout.current) clearTimeout(timeout.current); };
  }, []);

  const handleEnter = () => { if (timeout.current) clearTimeout(timeout.current); setOpen(true); };
  const handleLeave = () => { timeout.current = setTimeout(() => setOpen(false), 150); };

  return (
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors rounded-lg hover:bg-secondary"
      >
        {group.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-lg py-2 z-50 animate-fade-in">
          {group.items.map((item) => (
            <button
              key={item.href}
              onClick={() => { onNavigate(item.href); setOpen(false); }}
              className="flex items-start gap-3 w-full px-4 py-2.5 text-left hover:bg-secondary transition-colors"
            >
              <item.icon className="w-4 h-4 mt-0.5 text-accent shrink-0" />
              <div>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const nav = (href: string) => { setMobileOpen(false); navigate(href); };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="/" className="flex items-center">
          <img src={ikesaLogo} alt="ikesa Inmobiliaria / Real Estate" className="h-10" />
        </a>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navEntries.map((entry) =>
            isGroup(entry) ? (
              <DropdownMenu key={entry.label} group={entry} onNavigate={navigate} />
            ) : (
              <button
                key={entry.label}
                onClick={() => navigate(entry.href)}
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors rounded-lg hover:bg-secondary"
              >
                {entry.label}
              </button>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button onClick={() => navigate("/mi-cuenta")} className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors">
                <Heart className="w-4 h-4" />
                Favoritos
              </button>
              <button onClick={() => navigate("/mi-cuenta")} className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors">
                <User className="w-4 h-4" />
                Mi cuenta
              </button>
              {isAdmin && (
                <button onClick={() => navigate("/admin/panel")} className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-accent transition-colors">
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              )}
              <button onClick={handleSignOut} className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/auth")} className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors">
                <User className="w-4 h-4" />
                Acceso
              </button>
              <a href="#contacto" className="hidden lg:inline-flex btn-search text-sm py-2 px-6">
                Contáctanos
              </a>
            </>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-card border-t border-border animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navEntries.map((entry) =>
              isGroup(entry) ? (
                <div key={entry.label}>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === entry.label ? null : entry.label)}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg"
                  >
                    {entry.label}
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === entry.label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileExpanded === entry.label && (
                    <div className="ml-4 space-y-1 pb-2">
                      {entry.items.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => nav(item.href)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-secondary rounded-lg"
                        >
                          <item.icon className="w-4 h-4 text-accent" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  key={entry.label}
                  onClick={() => nav(entry.href)}
                  className="block w-full text-left px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg"
                >
                  {entry.label}
                </button>
              )
            )}
            {user ? (
              <>
                <button onClick={() => nav("/mi-cuenta")} className="block w-full text-left px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">
                  Mi cuenta
                </button>
                <button onClick={() => { setMobileOpen(false); handleSignOut(); }} className="block w-full text-left px-4 py-3 text-sm font-medium text-destructive hover:bg-secondary rounded-lg">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => nav("/auth")}
                className="block w-full text-center btn-search text-sm mt-4"
              >
                Acceso / Registro
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

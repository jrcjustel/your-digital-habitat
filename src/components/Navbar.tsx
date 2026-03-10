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
  {
    label: "Oportunidades",
    items: [
      { label: "Todas las oportunidades", href: "/inmuebles", icon: TrendingUp, description: "Catálogo completo de activos" },
      { label: "Subastas BOE", href: "/subastas", icon: Gavel, description: "Subastas judiciales activas" },
      { label: "NPL / Créditos", href: "/npl", icon: BarChart3, description: "Carteras de deuda hipotecaria" },
      { label: "Mapa de oportunidades", href: "/mapa", icon: Map, description: "Visualización geográfica" },
    ],
  },
  {
    label: "Herramientas",
    items: [
      { label: "Calculadoras", href: "/calculadoras", icon: Calculator, description: "Hipoteca y rentabilidad" },
      { label: "Valorar inmueble", href: "/valorar", icon: Home, description: "Valoración online gratuita" },
      { label: "Comparador", href: "/comparador", icon: GitCompare, description: "Compara hasta 4 activos" },
    ],
  },
  { label: "Vendedores", href: "/vendedores" },
  { label: "Academia", href: "/academia" },
  { label: "Nosotros", href: "/nosotros" },
];

const DropdownMenu = ({ group, onNavigate }: { group: NavGroup; onNavigate: (href: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => { if (timeout.current) clearTimeout(timeout.current); };
  }, []);

  const handleEnter = () => { if (timeout.current) clearTimeout(timeout.current); setOpen(true); };
  const handleLeave = () => { timeout.current = setTimeout(() => setOpen(false), 200); };

  return (
    <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors rounded-lg hover:bg-secondary"
      >
        {group.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`absolute top-full left-0 mt-2 w-72 bg-card border border-border/60 rounded-2xl shadow-xl z-50 overflow-hidden transition-all duration-200 ease-out origin-top ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="p-2">
          <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {group.label}
          </p>
          <div className="h-px bg-border/50 mx-2 mb-1" />
          {group.items.map((item, i) => (
            <div key={item.href}>
              <button
                onClick={() => { onNavigate(item.href); setOpen(false); }}
                className="flex items-start gap-3 w-full px-3 py-2.5 text-left rounded-xl hover:bg-accent/10 transition-colors duration-150 group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors duration-150 shrink-0">
                  <item.icon className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors duration-150">{item.label}</span>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{item.description}</p>
                  )}
                </div>
              </button>
              {i < group.items.length - 1 && (
                <div className="h-px bg-border/30 mx-3 my-0.5" />
              )}
            </div>
          ))}
        </div>
      </div>
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
                    <div className="ml-4 space-y-0.5 pb-2 animate-fade-in">
                      <div className="h-px bg-border/40 mx-2 mb-1" />
                      {entry.items.map((item, i) => (
                        <div key={item.href}>
                          <button
                            onClick={() => nav(item.href)}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-accent/10 rounded-xl transition-colors duration-150"
                          >
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 shrink-0">
                              <item.icon className="w-3.5 h-3.5 text-accent" />
                            </div>
                            {item.label}
                          </button>
                          {i < entry.items.length - 1 && (
                            <div className="h-px bg-border/30 mx-6 my-0.5" />
                          )}
                        </div>
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

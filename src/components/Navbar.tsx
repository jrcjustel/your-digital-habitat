import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Menu, X, LogOut, GraduationCap, Briefcase, Users, Building2, Home, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Academia", href: "/academia", icon: GraduationCap },
  { label: "Herramientas", href: "/valorar", icon: Briefcase },
  { label: "Comunidad", href: "/comunidad", icon: Users },
  { label: "Oportunidades", href: "/inmuebles", icon: Building2 },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-primary/98 backdrop-blur-xl border-b border-primary-foreground/5">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <span className="font-heading text-xl font-black tracking-tight text-primary-foreground">
            IKESA
          </span>
          <span className="hidden sm:block text-[10px] font-medium text-accent uppercase tracking-[0.2em] border-l border-primary-foreground/20 pl-2">
            Investor Academy
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.href)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? "text-accent bg-accent/10"
                    : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button
                onClick={() => navigate("/mi-cuenta")}
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors rounded-lg hover:bg-primary-foreground/5"
              >
                <User className="w-4 h-4" />
                Perfil
              </button>
              <button
                onClick={handleSignOut}
                className="hidden lg:flex items-center gap-1 px-3 py-2 text-sm text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/auth")}
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                Acceder
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="hidden lg:inline-flex px-5 py-2 text-sm font-semibold bg-accent text-accent-foreground rounded-lg hover:brightness-110 transition-all"
              >
                Empezar gratis
              </button>
            </>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-primary-foreground/80"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-primary border-t border-primary-foreground/5 animate-fade-in">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.label}
                  onClick={() => { setMobileOpen(false); navigate(item.href); }}
                  className={`flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "text-accent bg-accent/10"
                      : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <div className="border-t border-primary-foreground/10 pt-3 mt-2">
              {user ? (
                <>
                  <button
                    onClick={() => { setMobileOpen(false); navigate("/mi-cuenta"); }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-primary-foreground/70 hover:text-primary-foreground rounded-lg"
                  >
                    <User className="w-4 h-4" />
                    Mi perfil
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-medium text-destructive/80 hover:text-destructive rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); navigate("/auth"); }}
                  className="w-full text-center px-6 py-3 text-sm font-semibold bg-accent text-accent-foreground rounded-lg"
                >
                  Acceder / Registro
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

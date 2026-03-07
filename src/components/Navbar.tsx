import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Menu, X, Heart, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ikesaLogo from "@/assets/ikesa-logo-color.png";

const navItems = [
  { label: "Particulares", href: "/inmuebles" },
  { label: "Inversores", href: "/inversores" },
  { label: "Cómo funciona", href: "/como-funciona" },
  { label: "Marketplace", href: "/inversores" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="/" className="flex items-center">
          <img src={ikesaLogo} alt="ikesa Inmobiliaria / Real Estate" className="h-10" />
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.href)}
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors rounded-lg hover:bg-secondary"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button onClick={() => navigate("/mi-cuenta")} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors">
                <Heart className="w-4 h-4" />
                Favoritos
              </button>
              <button onClick={() => navigate("/mi-cuenta")} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors">
                <User className="w-4 h-4" />
                Mi cuenta
              </button>
              <button onClick={handleSignOut} className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/auth")} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors">
                <User className="w-4 h-4" />
                Acceso
              </button>
              <a href="#contacto" className="hidden md:inline-flex btn-search text-sm py-2 px-6">
                Contáctanos
              </a>
            </>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { setMobileOpen(false); navigate(item.href); }}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg"
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <>
                <button onClick={() => { setMobileOpen(false); navigate("/mi-cuenta"); }} className="block w-full text-left px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">
                  Mi cuenta
                </button>
                <button onClick={() => { setMobileOpen(false); handleSignOut(); }} className="block w-full text-left px-4 py-3 text-sm font-medium text-destructive hover:bg-secondary rounded-lg">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => { setMobileOpen(false); navigate("/auth"); }}
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

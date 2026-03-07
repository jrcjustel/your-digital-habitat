import { useState } from "react";
import { User, Menu, X } from "lucide-react";
import ikesaLogo from "@/assets/ikesa-logo-color.png";

const navItems = [
  { label: "Particulares", href: "#particulares" },
  { label: "Inversores", href: "#inversores" },
  { label: "Obra Nueva", href: "#obra-nueva" },
  { label: "Marketplace", href: "#marketplace" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="/" className="flex items-center">
          <img src={ikesaLogo} alt="ikesa Inmobiliaria / Real Estate" className="h-10" />
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors rounded-lg hover:bg-secondary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-accent transition-colors">
            <User className="w-4 h-4" />
            Acceso
          </button>
          <a
            href="#contacto"
            className="hidden md:inline-flex btn-search text-sm py-2 px-6"
          >
            Contáctanos
          </a>
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
              <a
                key={item.label}
                href={item.href}
                className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contacto"
              className="block text-center btn-search text-sm mt-4"
              onClick={() => setMobileOpen(false)}
            >
              Contáctanos
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

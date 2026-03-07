import { Link } from "react-router-dom";
import { Home, MapPin, Hash, Briefcase } from "lucide-react";

const links = [
  { icon: Home, label: "Inmuebles sin posesión", href: "/inmuebles?saleType=ocupado" },
  { icon: MapPin, label: "Buscar por mapa", href: "/inmuebles" },
  { icon: Hash, label: "Buscar por referencia", href: "/inmuebles" },
  { icon: Briefcase, label: "Inversores", href: "/inversores" },
];

const QuickLinks = () => {
  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center divide-x divide-border">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="flex items-center gap-2.5 px-6 py-4 text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;

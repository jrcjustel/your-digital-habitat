import { Home, MapPin, Hash, Briefcase } from "lucide-react";

const links = [
  { icon: Home, label: "Inmuebles sin posesión", href: "#sin-posesion" },
  { icon: MapPin, label: "Buscar por mapa", href: "#mapa" },
  { icon: Hash, label: "Buscar por referencia", href: "#referencia" },
  { icon: Briefcase, label: "Profesionales", href: "#profesionales" },
];

const QuickLinks = () => {
  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center divide-x divide-border">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-2.5 px-6 py-4 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;

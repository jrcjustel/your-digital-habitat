const footerLinks = {
  "Inmuebles": ["Viviendas", "Locales", "Oficinas", "Terrenos", "Naves", "Garajes"],
  "Inversión": ["Obra Parada", "Edificios", "NPL (Deuda)", "Cesiones de Remate", "Grandes Lotes", "Activos Ocupados"],
  "Compañía": ["Sobre nosotros", "Blog", "Contacto", "Trabaja con nosotros"],
  "Legal": ["Aviso legal", "Política de privacidad", "Cookies"],
};

const popularSearches = [
  "Viviendas en Cádiz", "Locales en Sevilla", "Terrenos en Huelva",
  "Obra nueva en Granada", "Inversión en Málaga", "NPLs España",
];

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <span className="font-heading text-2xl font-extrabold">IKESA</span>
            <p className="text-primary-foreground/50 text-sm mt-3 leading-relaxed">
              Inversiones inteligentes para inversores exigentes. Tu partner inmobiliario de confianza.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-bold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                      {link}
                    </a>
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
              <a
                key={search}
                href="#"
                className="text-xs text-primary-foreground/40 hover:text-primary-foreground border border-primary-foreground/10 px-3 py-1.5 rounded-full transition-colors"
              >
                {search}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/30">
            © 2026 IKESA Real Estate. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Aviso Legal
            </a>
            <a href="#" className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Privacidad
            </a>
            <a href="#" className="text-xs text-primary-foreground/30 hover:text-primary-foreground/60 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

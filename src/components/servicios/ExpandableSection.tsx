import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ExpandableSectionProps {
  emoji?: string;
  icon?: LucideIcon;
  title: string;
  items: { s: string; p: string }[];
  defaultOpen?: boolean;
}

const ExpandableSection = ({ emoji, icon: Icon, title, items, defaultOpen = false }: ExpandableSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors text-left"
      >
        {emoji && <span className="text-lg">{emoji}</span>}
        {Icon && <Icon className="w-4 h-4 text-accent shrink-0" />}
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground text-xs"
        >
          ▼
        </motion.span>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-3"
        >
          {items.map((item, i) => (
            <div key={i} className="flex items-start justify-between gap-2 py-2 border-b border-dashed border-border/40 last:border-b-0">
              <span className="text-xs text-muted-foreground leading-snug flex-1">{item.s}</span>
              <span className="text-xs font-bold text-foreground whitespace-nowrap tabular-nums bg-accent/10 px-2 py-0.5 rounded-md">{item.p}</span>
            </div>
          ))}
          <Link
            to={`/contacto?servicio=${encodeURIComponent(title)}`}
            className="group mt-3 mb-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-accent bg-accent/5 hover:bg-accent hover:text-white rounded-lg py-2 px-3 transition-all duration-300 hover:shadow-md hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Mail className="w-3 h-3 transition-transform duration-300 group-hover:-rotate-12" />
            Solicitar este servicio
            <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default ExpandableSection;

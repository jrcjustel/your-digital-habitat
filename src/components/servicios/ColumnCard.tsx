import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface ColumnCardProps {
  color: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
  delay?: number;
}

const ColumnCard = ({ color, icon: Icon, title, subtitle, badge, children, delay = 0 }: ColumnCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.97 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-shadow duration-500"
  >
    <div className={`px-6 py-6 ${color} relative overflow-hidden md:w-64 md:shrink-0 md:flex md:flex-col md:justify-center`}>
      {badge && (
        <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {badge}
        </span>
      )}
      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-heading text-xl font-bold text-white">{title}</h3>
      <p className="text-white/70 text-sm mt-1">{subtitle}</p>
    </div>
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  </motion.div>
);

export default ColumnCard;

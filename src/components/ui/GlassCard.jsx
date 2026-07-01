import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", hover = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={hover ? { y: -2, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" } : undefined}
      className={`glass-card rounded-2xl border shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

import { motion } from "framer-motion";

export default function GradientButton({ onClick, disabled, children, variant = "primary", className = "", type = "button", size = "md" }) {
  const sizes = { sm: "px-4 py-2 text-xs", md: "px-6 py-3 text-sm", lg: "px-8 py-4 text-base" };
  const base = `relative rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${sizes[size]}`;
  const styles = {
    primary: "btn-primary text-white shadow-lg",
    secondary: "btn-secondary text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
    ghost: "bg-transparent hover:bg-white/5 text-[var(--text-secondary)]",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`${base} ${styles[variant]} ${className}`}
    >
      <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
      {children}
    </motion.button>
  );
}

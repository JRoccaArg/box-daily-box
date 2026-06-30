import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  /** Ocupar todo el ancho disponible. */
  block?: boolean;
  children: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-racing text-white hover:bg-racing-400 active:bg-racing-600 shadow-glow disabled:shadow-none",
  ghost: "bg-transparent text-ink hover:bg-white/5 active:bg-white/10",
  outline:
    "bg-transparent text-ink border border-white/15 hover:border-white/30 hover:bg-white/5",
  danger:
    "bg-transparent text-racing-400 border border-racing/40 hover:bg-racing/10 active:bg-racing/20",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-5 text-[15px] rounded-lg",
  lg: "h-13 px-7 text-base rounded-xl",
};

/**
 * Boton base del sistema. Mantiene foco accesible (heredado de :focus-visible)
 * y estados deshabilitados consistentes.
 */
export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 font-medium tracking-tight",
        "transition-colors duration-150 select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        block ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}

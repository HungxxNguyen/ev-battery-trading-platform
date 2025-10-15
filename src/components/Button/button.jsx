import React from "react";

const variants = {
  solid: "bg-cyan-500/90 text-white hover:bg-cyan-500",
  outline:
    "border border-slate-700/50 bg-transparent text-slate-200 hover:bg-slate-800/60",
  destructive: "bg-rose-500/90 text-white hover:bg-rose-500",
  ghost: "bg-transparent text-slate-200 hover:bg-slate-800/60",
  // extra palettes (để tương thích code cũ)
  sky: "bg-sky-500/90 text-white hover:bg-sky-500",
  skySoft: "bg-sky-400/80 text-white hover:bg-sky-400",
  green: "bg-emerald-500/90 text-white hover:bg-emerald-500",
  greenSoft: "bg-emerald-400/80 text-white hover:bg-emerald-400",
  amber: "bg-amber-500/90 text-white hover:bg-amber-500",
  amberSoft: "bg-amber-400/80 text-white hover:bg-amber-400",
  redSoft: "bg-rose-400/80 text-white hover:bg-rose-400",
  muted: "bg-slate-800/60 text-slate-200 hover:bg-slate-800/80",
};

export const Button = ({
  className = "",
  children,
  variant = "solid",
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors select-none cursor-pointer ${
        variants[variant] || variants.solid
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

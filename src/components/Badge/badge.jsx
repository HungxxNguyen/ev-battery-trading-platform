import React from "react";
import { cn } from "../../utils/cn.jsx";

export const Badge = ({
  className = "",
  children,
  color = "slate",
  pill = false,
  ...props
}) => {
  const map = {
    slate: "border border-slate-700/50 bg-slate-900/35 text-slate-200",
    amber: "border border-amber-500/30 bg-amber-400/20 text-amber-200",
    green: "border border-emerald-500/30 bg-emerald-400/20 text-emerald-200",
    red: "border border-rose-500/30 bg-rose-400/20 text-rose-200",
    sky: "border border-sky-500/30 bg-sky-400/20 text-sky-200",
    blue: "border border-blue-500/30 bg-blue-400/20 text-blue-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs rounded-md whitespace-nowrap align-middle",
        map[color] || map.slate,
        pill && "rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

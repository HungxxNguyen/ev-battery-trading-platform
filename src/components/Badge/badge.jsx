import React from "react";
import { cn } from "../../utils/cn.jsx";

export const Badge = ({ className = "", children, color = "gray", pill = false }) => {
  const map = {
    gray:  "bg-gray-100 text-gray-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    red:   "bg-red-100 text-red-700",
    sky:   "bg-sky-100 text-sky-700",
    blue:  "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs rounded-md whitespace-nowrap align-middle",
        map[color] || map.gray,
        pill && "rounded-full",
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;

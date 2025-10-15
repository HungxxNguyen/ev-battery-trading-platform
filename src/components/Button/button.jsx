import React from "react";

const styles = {
  solid: "bg-blue-600 text-white hover:bg-blue-700",
  outline: "border bg-white text-gray-700 hover:bg-gray-50",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  ghost: "hover:bg-gray-100",
  sky: "bg-sky-600 text-white hover:bg-sky-700",
  skySoft: "bg-sky-400 text-white hover:bg-sky-500",
  green: "bg-emerald-600 text-white hover:bg-emerald-700",
  greenSoft: "bg-emerald-400 text-white hover:bg-emerald-500",
  amber: "bg-amber-600 text-white hover:bg-amber-700",
  amberSoft: "bg-amber-400 text-white hover:bg-amber-500",
  redSoft: "bg-red-400 text-white hover:bg-red-500",
  muted: "bg-gray-100 text-gray-700 hover:bg-gray-200",
};

export const Button = ({ className = "", children, variant = "solid", ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition select-none cursor-pointer ${styles[variant] || styles.solid} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

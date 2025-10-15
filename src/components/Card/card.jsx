import React from "react";

export const Card = ({ className = "", children }) => (
  <div className={`rounded-xl border bg-white shadow-sm ${className}`}>{children}</div>
);

export const CardHeader = ({ className = "", children }) => (
  <div className={`px-4 pt-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children }) => (
  <h3 className="text-base md:text-lg font-semibold">{children}</h3>
);

export const CardContent = ({ className = "", children }) => (
  <div className={`px-4 pb-4 ${className}`}>{children}</div>
);

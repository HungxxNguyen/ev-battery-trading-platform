import React from "react";

export const Tabs = ({ children }) => <div>{children}</div>;

export const TabsList = ({ className = "", children }) => (
  <div className={`flex items-center gap-2 ${className}`}>{children}</div>
);

export const TabsTrigger = ({ value, className = "", ...props }) => (
  <button data-value={value} className={`px-3 py-2 rounded-lg hover:bg-gray-100 ${className}`} {...props} />
);

export const TabsContent = ({ value, className = "", children }) => (
  <div data-value={value} className={className}>
    {children}
  </div>
);

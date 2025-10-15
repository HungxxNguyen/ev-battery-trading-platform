import React, { createContext, useContext, useMemo, useState } from "react";

const TabsCtx = createContext(null);

export const Tabs = ({
  defaultValue,
  value: controlled,
  onValueChange,
  children,
  className = "",
}) => {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = isControlled ? controlled : uncontrolled;

  const api = useMemo(
    () => ({
      value: current,
      setValue: (v) => {
        if (!isControlled) setUncontrolled(v);
        onValueChange?.(v);
      },
    }),
    [current, isControlled, onValueChange]
  );

  return (
    <TabsCtx.Provider value={api}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
};

export const TabsList = ({ className = "", children, ...props }) => (
  <div className={`flex items-center gap-2 ${className}`} {...props}>
    {children}
  </div>
);

export const TabsTrigger = ({ value, className = "", children, ...props }) => {
  const ctx = useContext(TabsCtx);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      data-value={value}
      data-state={active ? "active" : "inactive"}
      onClick={() => ctx?.setValue(value)}
      className={`px-3 py-2 rounded-lg transition-colors hover:bg-slate-800/60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, className = "", children, ...props }) => {
  const ctx = useContext(TabsCtx);
  const active = ctx?.value === value;
  return (
    <div
      data-value={value}
      data-state={active ? "active" : "inactive"}
      className={`${active ? "" : "hidden"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

import React from "react";

export const Table = ({ className = "", children, ...props }) => (
  <div className={`overflow-x-auto ${className}`} {...props}>
    <table className="w-full text-sm border-separate border-spacing-0">
      {children}
    </table>
  </div>
);

export const TableHeader = ({ className = "", children, ...props }) => (
  <thead
    className={`text-left border-b border-slate-800/60 ${className}`}
    {...props}
  >
    {children}
  </thead>
);

export const TableRow = ({ className = "", ...props }) => (
  <tr className={`border-b border-slate-800/60 ${className}`} {...props} />
);

export const TableHead = ({ className = "", children, ...props }) => (
  <th
    className={`px-3 py-2 text-slate-300 font-medium ${className}`}
    {...props}
  >
    {children}
  </th>
);

export const TableBody = ({ className = "", children, ...props }) => (
  <tbody className={`align-middle ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableCell = ({ className = "", children, colSpan, ...props }) => (
  <td
    colSpan={colSpan}
    className={`px-3 py-2 align-middle ${className}`}
    {...props}
  >
    {children}
  </td>
);

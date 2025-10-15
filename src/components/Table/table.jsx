import React from "react";

export const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-separate border-spacing-0">{children}</table>
  </div>
);

export const TableHeader = ({ children }) => (
  <thead className="text-left bg-gray-50 border-b border-gray-200">{children}</thead>
);

export const TableRow = ({ className = "", ...props }) => (
  <tr className={`border-b border-gray-200 ${className}`} {...props} />
);

export const TableHead = ({ className = "", children }) => (
  <th className={`px-3 py-2 font-semibold text-gray-700 uppercase text-xs md:text-sm tracking-wide border-b border-gray-200 border-r last:border-r-0 ${className}`}>
    {children}
  </th>
);

export const TableBody = ({ children }) => <tbody className="align-middle">{children}</tbody>;

export const TableCell = ({ className = "", children, colSpan }) => (
  <td colSpan={colSpan} className={`px-3 py-2 border-r last:border-r-0 border-gray-200 ${className}`}>
    {children}
  </td>
);

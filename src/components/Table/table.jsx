import * as React from "react";
import { cn } from "../../utils/cn";

const Table = ({ className, ...props }) => (
  <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
);
const TableHeader = ({ className, ...props }) => (
  <thead className={cn("[&_tr]:border-b", className)} {...props} />
);
const TableBody = ({ className, ...props }) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);
const TableFooter = ({ className, ...props }) => (
  <tfoot className={cn("bg-muted font-medium text-foreground", className)} {...props} />
);
const TableRow = ({ className, ...props }) => (
  <tr className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />
);
const TableHead = ({ className, ...props }) => (
  <th className={cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground", className)} {...props} />
);
const TableCell = ({ className, ...props }) => (
  <td className={cn("p-2 align-middle", className)} {...props} />
);
const TableCaption = ({ className, ...props }) => (
  <caption className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};

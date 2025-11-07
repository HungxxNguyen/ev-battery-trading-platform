export const currency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);

// Hiển thị KPI: nếu là "Doanh thu" thì coi value đang tính theo TRIỆU,
// chuyển sang VND rồi format currency. Các KPI khác giữ nguyên format số.
const formatKpiValue = (k) => {
  if (typeof k?.label === "string" && k.label.toLowerCase().includes("doanh thu")) {
    const vnd = Math.round((Number(k?.value) || 0) * 1_000_000); // 92.4 -> 92,400,000
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(vnd);
  }
  return (Number(k?.value) || 0).toLocaleString("vi-VN");
};


export const normalizePhone = (s = "") => s.replace(/\D/g, "").slice(0, 10);

export const formatPhone = (s = "") => {
  const d = normalizePhone(s);
  if (d.length <= 4) return d;
  if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
};

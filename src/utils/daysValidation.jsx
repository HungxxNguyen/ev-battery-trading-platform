export const clampDays = (n, min = 1, max = 30) => {
  const v = parseInt(n ?? 0, 10);
  if (isNaN(v)) return min;
  return Math.max(min, Math.min(max, v));
};

export const validateDays = (n, { min = 1, max = 30 } = {}) => {
  const v = parseInt(n ?? 0, 10);
  if (isNaN(v)) return { ok: false, msg: `Vui lòng nhập số ngày hợp lệ (${min}–${max}).` };
  if (v < min || v > max) return { ok: false, msg: `Số ngày phải trong khoảng ${min}–${max}.` };
  return { ok: true, msg: "" };
};

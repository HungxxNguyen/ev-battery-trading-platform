// src/constants/brands.jsx
// Data & hằng số dùng cho trang Quản lý Hãng

import { slugify } from "../utils/text.jsx"; // đã có sẵn; nếu chưa, thêm nhanh trong utils/text.jsx

// Chỉ 2 phân khúc theo yêu cầu
export const SEGMENTS = ["Xe điện", "Pin"];

// Danh sách quốc gia dùng cho dropdown (có thể mở rộng)
export const COUNTRIES = [
  "Việt Nam",
  "Đài Loan",
  "Nhật Bản",
  "Hàn Quốc",
  "Trung Quốc",
  "Thái Lan",
  "Mỹ",
  "Đức",
];

// Dữ liệu mẫu (seed)
const RAW_BRANDS = [
  {
    id: "brd_datbike",
    name: "Dat Bike",
    country: "Việt Nam",
    segment: "Xe điện",
    logo: "",
    enabled: true,
  },
  {
    id: "brd_gogoro",
    name: "Gogoro",
    country: "Đài Loan",
    segment: "Xe điện",
    logo: "",
    enabled: true,
  },
  {
    id: "brd_vinfast",
    name: "VinFast",
    country: "Việt Nam",
    segment: "Xe điện",
    logo: "",
    enabled: true,
  },
];

// Chuẩn hoá & bổ sung slug
export function seedBrands() {
  return RAW_BRANDS.map((b) => ({
    ...b,
    slug: b.slug || slugify(b.name),
  }));
}

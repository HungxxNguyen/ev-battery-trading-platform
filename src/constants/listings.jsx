export const pendingPosts = [
  {
    id: "lst_001",
    title: "Xe điện VinFast Vento S 2022",
    seller: "Nguyễn A",
    price: 18500000,
    createdAt: "2025-09-24 09:12",
    category: "Xe điện",
  },
  {
    id: "lst_002",
    title: "Pin Lithium 60V - 48Ah (cũ 80%)",
    seller: "Trần B",
    price: 4200000,
    createdAt: "2025-09-24 08:41",
    category: "Pin",
  },
  {
    id: "lst_003",
    title: "Xe đạp điện Pega Aura 2021",
    seller: "Lâm C",
    price: 6900000,
    createdAt: "2025-09-25 10:05",
    category: "Xe điện",
  },
];

export const initialListingStatuses = {
  lst_001: "pending",
  lst_002: "rejected",
  lst_003: "approved",
};

export const LISTING_DETAILS = [
  {
    id: "lst_001",
    title: "Xe điện VinFast Vento S 2022",
    category: "Xe điện",
    seller: { name: "Nguyễn A" },
    price: 18500000,
    images: ["/demo/vento-1.jpg", "/demo/vento-2.jpg"],
    evidence: [{ name: "hoa_don_vento.pdf" }, { name: "phieu_bao_hanh.jpg" }],
  },
  {
    id: "lst_002",
    title: "Pin Lithium 60V - 48Ah (cũ 80%)",
    category: "Pin",
    seller: { name: "Trần B" },
    price: 4200000,
    images: ["/demo/pin-1.jpg", "/demo/pin-2.jpg"],
    evidence: [{ name: "hoa_don_pin.pdf" }],
  },
  {
    id: "lst_003",
    title: "Xe đạp điện Pega Aura 2021",
    category: "Xe điện",
    seller: { name: "Lâm C" },
    price: 6900000,
    images: ["/demo/pega-1.jpg", "/demo/pega-2.jpg"],
    evidence: [{ name: "hoa_don_pega.pdf" }],
  },
];

export const allTickets = [
  { id: "tkt_101", subject: "Không thanh toán được gói Pro", user: "Hoàng V.", tag: "billing", sla: "1h còn lại", status: "open" },
  { id: "tkt_102", subject: "Bài bị từ chối nhưng thiếu lý do", user: "Thu T.", tag: "moderation", sla: "3h còn lại", status: "open" },
  { id: "tkt_090", subject: "Không nhận được email kích hoạt", user: "Minh K.", tag: "account", status: "closed" },
  { id: "tkt_045", subject: "Lỗi upload hình ảnh", user: "Lan P.", tag: "bug", status: "closed" },
];

export const openTickets = allTickets.filter((t) => t.status === "open");

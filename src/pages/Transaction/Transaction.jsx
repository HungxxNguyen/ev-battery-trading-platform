import React, { useMemo, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import {
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArrowUpRight,
} from "react-icons/fi";

const ORDER_TABS = [{ key: "orders", label: "Đơn hàng" }];

const TRANSACTIONS = [
  {
    id: "TX-2045",
    title: "Gia hạn gói Volt Boost cho tin 'VinFast VF 8 Eco'",
    orderCode: "VX2045",
    time: "11:08 - 27/09/2025",
    amount: 3510000,
    status: "failed",
    statusNote: "Thanh toán thất bại",
    productThumb:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    channel: "Ví VoltPay",
  },
  {
    id: "TX-2044",
    title: "Gia hạn gói Volt Boost cho tin 'Pin solid-state 120 kWh'",
    orderCode: "VX2044",
    time: "10:42 - 27/09/2025",
    amount: 3510000,
    status: "failed",
    statusNote: "Thanh toán thất bại",
    productThumb:
      "https://images.unsplash.com/photo-1617813489478-0e96bde477c0?auto=format&fit=crop&w=400&q=80",
    channel: "Thẻ tín dụng",
  },
  {
    id: "TX-2043",
    title: "Gia hạn gói Volt Boost cho tin 'Kho pin tái chế Volt X'",
    orderCode: "VX2043",
    time: "10:34 - 27/09/2025",
    amount: 2808000,
    status: "success",
    statusNote: "Hoàn tất",
    productThumb:
      "https://images.unsplash.com/photo-1580894906472-6ec1c6dc1d92?auto=format&fit=crop&w=400&q=80",
    channel: "Ví VoltPay",
  },
  {
    id: "TX-2042",
    title: "Đặt gói quảng bá Volt Spotlight",
    orderCode: "VX2042",
    time: "09:58 - 26/09/2025",
    amount: 1800000,
    status: "pending",
    statusNote: "Đang xử lý",
    productThumb:
      "https://images.unsplash.com/photo-1580894924511-6477593a1f28?auto=format&fit=crop&w=400&q=80",
    channel: "Chuyển khoản",
  },
];

const STATUS_TOKEN = {
  success: {
    label: "Thành công",
    icon: <FiCheckCircle className="mr-1" />,
    pill: "bg-green-50 text-green-700 border border-green-200",
    amountColor: "text-green-600",
  },
  failed: {
    label: "Thất bại",
    icon: <FiXCircle className="mr-1" />,
    pill: "bg-red-50 text-red-700 border border-red-200",
    amountColor: "text-red-600",
  },
  pending: {
    label: "Chờ xử lý",
    icon: <FiClock className="mr-1" />,
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    amountColor: "text-amber-600",
  },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const TransactionCard = ({ item }) => {
  const statusInfo = STATUS_TOKEN[item.status] ?? STATUS_TOKEN.pending;

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="relative flex-shrink-0 w-full sm:w-32">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50 border border-gray-200">
          <img
            src={item.productThumb}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="absolute -bottom-3 left-3 flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
          <FiArrowUpRight /> Volt Boost
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 leading-snug">
              {item.title}
            </h3>
            <div className="mt-2 grid gap-x-8 gap-y-1 text-sm text-gray-600 sm:grid-cols-2">
              <span>
                <span className="text-gray-500">Mã đơn hàng:</span>{" "}
                {item.orderCode}
              </span>
              <span>
                <span className="text-gray-500">Thời gian:</span> {item.time}
              </span>
              {item.channel && (
                <span>
                  <span className="text-gray-500">Kênh thanh toán:</span>{" "}
                  {item.channel}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className={`text-xl font-bold ${statusInfo.amountColor}`}>
              {formatCurrency(item.amount)}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.pill}`}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </span>
            <span className="text-xs text-gray-500">{item.statusNote}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Transaction = () => {
  const [activeTab] = useState("orders");

  const stats = useMemo(() => {
    const totalSuccess = TRANSACTIONS.filter((t) => t.status === "success");
    const totalAmount = totalSuccess.reduce((acc, cur) => acc + cur.amount, 0);
    return {
      totalSuccess: totalSuccess.length,
      totalAmount,
      totalOrders: TRANSACTIONS.length,
    };
  }, []);

  return (
    <MainLayout>
      {/* Giữ nền trắng */}
      <div className="bg-white min-h-screen py-8">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 space-y-8">
          {/* Header stats */}
          <header className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="mt-3 text-3xl font-bold  text-gray-800">
                  Lịch sử giao dịch
                </h1>
                <p className="mt-2 text-base text-gray-600 max-w-xl">
                  Theo dõi trạng thái thanh toán cho các gói quảng bá và dịch vụ
                  tăng trưởng của Volt X. Dữ liệu có thể mất vài phút để đồng
                  bộ.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Tổng đơn
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-green-700">
                    Đã thanh toán
                  </p>
                  <p className="mt-2 text-2xl font-bold text-green-700">
                    {stats.totalSuccess}
                  </p>
                </div>
                <div className="col-span-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Doanh số đã ghi nhận
                  </p>
                  <p className="mt-2 text-2xl font-bold text-green-700">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* List */}
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6">
              {/* Info */}
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <FiInfo className="mt-0.5 h-5 w-5 text-blue-600" />
                  <p>
                    Nếu đơn hàng đã thanh toán nhưng chưa hiển thị, vui lòng tải
                    lại trang sau vài phút để đồng bộ trạng thái mới nhất.
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-gray-200 pb-2">
                  {ORDER_TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        className={`relative pb-3 text-sm font-semibold uppercase tracking-wide transition ${
                          isActive
                            ? "text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab.label}
                        {isActive && (
                          <span className="absolute left-0 -bottom-[2px] h-1 w-full rounded-full bg-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-5">
                {TRANSACTIONS.map((item) => (
                  <TransactionCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Transaction;

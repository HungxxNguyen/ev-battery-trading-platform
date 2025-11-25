// src/pages/Favorites/Favorites.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import { useFavorites } from "../../contexts/FavoritesContext";

const formatDate = (iso) => {
  if (!iso) return "Chưa xác định";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "Chưa xác định";
  }
};

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "Liên hệ";
  const num = Number(value);
  if (!Number.isFinite(num)) return value;

  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  } catch {
    return value;
  }
};

const Favorites = () => {
  const { favorites, toggleFavorite, clearFavorites, reload } = useFavorites();
  const hasFavorites = favorites.length > 0;

  // GỌI API MỖI LẦN MỞ TRANG
  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8 min-h-[70vh]">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Tin đăng đã lưu ({favorites.length} tin)
            </h1>

            <div className="flex items-center gap-3">
              {hasFavorites && (
                <button
                  onClick={clearFavorites}
                  className="text-xs uppercase font-bold tracking-wide text-gray-400 hover:text-red-500"
                >
                  Xóa tất cả
                </button>
              )}
              <FiHeart className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {/* Items */}
          {hasFavorites ? (
            <div className="space-y-4">
              {favorites.map((fav) => {
                const isSold =
                  String(fav.status || "").toLowerCase() !== "active";
                const detailUrl = `/listing/${fav.id}`;
                const thumbClasses =
                  "w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 relative";

                return (
                  <div
                    key={fav.id}
                    className={`group relative flex gap-4 rounded-2xl border p-4 transition-all ${
                      isSold
                        ? "border-gray-200 bg-gray-50 opacity-95"
                        : "border-gray-100 bg-white/95 hover:-translate-y-0.5 hover:border-blue-500/60 hover:shadow-lg"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-24 w-28 flex-shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-36">
                      {isSold ? (
                        <div className="h-full w-full cursor-not-allowed">
                          <img
                            src={fav.image}
                            alt={fav.title}
                            className="h-full w-full object-cover grayscale"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="rounded-full border border-white/70 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white text-center">
                              Đã bán / Không còn hiển thị
                            </span>
                          </div>
                        </div>
                      ) : (
                        <Link to={detailUrl} className="block h-full w-full">
                          <img
                            src={fav.image}
                            alt={fav.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </Link>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title + heart */}
                      <div className="flex items-start justify-between gap-3">
                        {isSold ? (
                          <p className="line-clamp-2 text-base sm:text-lg font-semibold text-gray-800">
                            {fav.title}
                          </p>
                        ) : (
                          <Link
                            to={detailUrl}
                            className="line-clamp-2 text-base sm:text-lg font-semibold text-gray-800 hover:text-blue-600"
                          >
                            {fav.title}
                          </Link>
                        )}

                        <button
                          onClick={() => toggleFavorite(fav)}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-red-500 shadow-sm transition hover:border-red-300 hover:shadow-md"
                          aria-label="Bỏ lưu tin"
                        >
                          <FiHeart className="h-5 w-5 fill-current" />
                        </button>
                      </div>

                      {/* Price + status */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold text-red-600">
                          {formatPrice(fav.price)}
                        </span>

                        {isSold && (
                          <span className="inline-flex items-center rounded-full border border-red-100 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600">
                            Tin đã đóng
                          </span>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <span className="font-medium">
                          Đã lưu: {formatDate(fav.savedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
              <h2 className="text-xl font-semibold text-gray-700">
                Chưa có tin đăng nào được lưu
              </h2>
              <p className="mt-2 text-gray-500">
                Nhấn vào trái tim trên các tin để thêm vào mục yêu thích.
              </p>
              <Link
                to="/"
                className="inline-block mt-4 px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Về trang chủ
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Favorites;

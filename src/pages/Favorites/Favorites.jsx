// src/pages/Favorites/Favorites.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiMessageSquare } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import { useFavorites } from "../../contexts/FavoritesContext";

const formatDate = (iso) => {
  if (!iso) return "Chua xac dinh";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "Chua xac dinh";
  }
};

const Favorites = () => {
  const { favorites, toggleFavorite, clearFavorites } = useFavorites();
  const hasFavorites = favorites.length > 0;

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8 min-h-[70vh]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Trang chu / Tin dang da luu</p>
              <h1 className="text-2xl font-bold text-gray-800">
                Tin dang da luu ({favorites.length} / 100)
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {hasFavorites && (
                <button
                  onClick={clearFavorites}
                  className="text-xs uppercase tracking-wide text-gray-400 hover:text-red-500"
                >
                  Xoa tat ca
                </button>
              )}
              <FiHeart className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {hasFavorites ? (
            <div className="space-y-4">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex gap-4 items-center"
                >
                  <Link
                    to={`/listing/${fav.id}`}
                    className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100"
                  >
                    <img
                      src={fav.image}
                      alt={fav.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        to={`/listing/${fav.id}`}
                        className="text-lg font-semibold text-gray-800 hover:text-blue-600 line-clamp-2"
                      >
                        {fav.title}
                      </Link>
                      <button
                        onClick={() => toggleFavorite(fav)}
                        className="text-red-500 hover:text-red-600"
                        aria-label="Bo luu tin"
                      >
                        <FiHeart className="w-6 h-6 fill-current" />
                      </button>
                    </div>
                    <div className="mt-2 text-red-600 font-semibold text-lg">
                      {fav.price || "Lien he"}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {fav.location || "Chua cap nhat dia chi"}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Link
                        to={`/chat?listingId=${fav.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded-full text-sm font-semibold hover:bg-green-50"
                      >
                        <FiMessageSquare />
                        Chat
                      </Link>
                      <span className="text-xs text-gray-400">
                        Da luu: {formatDate(fav.savedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
              <h2 className="text-xl font-semibold text-gray-700">Chua co tin dang nao duoc luu</h2>
              <p className="mt-2 text-gray-500">
                Bam vao bieu tuong trai tim tren cac tin dang de them vao danh sach yeu thich.
              </p>
              <Link
                to="/"
                className="inline-block mt-4 px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                Ve trang chu
              </Link>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Favorites;

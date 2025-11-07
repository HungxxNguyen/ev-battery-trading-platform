// src/pages/Favorites/Favorites.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiMessageSquare } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";
import { useFavorites } from "../../contexts/FavoritesContext";
import listingService from "../../services/apis/listingApi";
import { AuthContext } from "../../contexts/AuthContext";
import { decodeToken } from "../../utils/tokenUtils";

const formatDate = (iso) => {
  if (!iso) return "Chưa xác định";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return "Chưa xác định";
  }
};

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const tokenInfo = token ? decodeToken(token) : null;
  const currentUserId =
    user?.id?.toString?.() ||
    (tokenInfo?.userId != null ? String(tokenInfo.userId) : "");
  const { favorites, toggleFavorite, clearFavorites } = useFavorites();
  const hasFavorites = favorites.length > 0;

  const handleChatFromFavorite = async (fav) => {
    if (!fav || !fav.id) return;
    const directSellerId = fav.sellerId ? String(fav.sellerId) : null;
    if (
      directSellerId &&
      (!currentUserId || directSellerId !== String(currentUserId))
    ) {
      navigate("/chat", { state: { participantId: directSellerId } });
      return;
    }

    try {
      let response = await listingService.getById(fav.id);
      if (!response?.success || response?.status === 404) {
        response = await listingService.getListingDetail(fav.id);
      }
      if (response?.success) {
        const payload = response.data;
        const listing =
          payload?.data &&
          typeof payload.data === "object" &&
          !Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload)
            ? payload[0] ?? null
            : payload && typeof payload === "object"
            ? payload
            : null;
        const seller = listing?.user;
        const sellerId =
          seller?.id ??
          seller?.userId ??
          seller?.accountId ??
          seller?.userID ??
          seller?.user_id ??
          listing?.userId ??
          listing?.ownerId ??
          null;
        if (
          sellerId &&
          (!currentUserId || String(sellerId) !== String(currentUserId))
        ) {
          navigate("/chat", { state: { participantId: String(sellerId) } });
        }
      }
    } catch (e) {
      // ignore fetch errors
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8 min-h-[70vh]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Tin đăng đã lưu ({favorites.length} / 100)
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {hasFavorites && (
                <button
                  onClick={clearFavorites}
                  className="text-xs uppercase font-bold tracking-wide text-gray-400 hover:text-red-500 cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
              <FiHeart className="w-8 h-8 text-red-500" />
            </div>
          </div>

          {hasFavorites ? (
            <div className="space-y-4">
              {favorites.map((fav) => {
                const isOwnerSelf = !!(
                  currentUserId &&
                  ((fav?.sellerId &&
                    String(fav.sellerId) === String(currentUserId)) ||
                    (fav?.userId &&
                      String(fav.userId) === String(currentUserId)) ||
                    (fav?.ownerId &&
                      String(fav.ownerId) === String(currentUserId)))
                );
                return (
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
                        {fav.area || fav.location || "Chua cap nhat dia chi"}
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        {!isOwnerSelf && (
                          <button
                            type="button"
                            onClick={() => handleChatFromFavorite(fav)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-green-500 text-green-600 hover:bg-green-50"
                            title="Chat"
                          >
                            <FiMessageSquare />
                            Chat
                          </button>
                        )}
                        <span className="text-xs text-gray-400 font-bold">
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
                Nhấn vào biểu tượng trái tim trên các tin đăng để thêm vào danh
                sách yêu thích.
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

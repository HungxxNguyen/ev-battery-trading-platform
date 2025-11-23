// src/pages/ListingDetail/ListingDetail.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiTag,
  FiMessageCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { useFavorites } from "../../contexts/FavoritesContext";
import MainLayout from "../../components/layout/MainLayout";
import listingService from "../../services/apis/listingApi";
import ReportButton from "../../components/report/ReportButton";
import { AuthContext } from "../../contexts/AuthContext";

const FALLBACK_IMAGE = "https://placehold.co/1200x800?text=Listing";
const FALLBACK_AVATAR = "https://placehold.co/160x160?text=User";

const CATEGORY_OPTIONS = [
  { value: "ElectricCar", label: "Ô tô điện" },
  { value: "ElectricMotorbike", label: "Xe máy điện" },
  { value: "RemovableBattery", label: "Pin điện" },
];

const formatCategory = (category) => {
  if (!category) return "Không rõ";
  const found = CATEGORY_OPTIONS.find((opt) => opt.value === category);
  return found?.label || category;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Liên hệ";
  }

  try {
    return `${new Intl.NumberFormat("vi-VN").format(Number(value))} VND`;
  } catch {
    return `${value} VND`;
  }
};

const formatListingStatus = (status) => {
  if (!status) return "Không rõ";
  const mapping = {
    New: "Mới",
    Used: "Đã sử dụng",
  };
  return mapping[status] || status;
};

const ListingDetail = () => {
  const auth = useContext(AuthContext) || {};
  const currentUserId = auth?.user?.id;
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const locationListing = location.state?.listing;
  const { toggleFavorite, isFavorite } = useFavorites();

  const [listing, setListing] = useState(locationListing ?? null);
  const [loading, setLoading] = useState(!locationListing);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (locationListing && String(locationListing.id) === String(id)) {
      setListing(locationListing);
      setLoading(false);
      setError("");
    }
  }, [id, locationListing]);

  useEffect(() => {
    if (locationListing && String(locationListing.id) === String(id)) {
      return;
    }

    let active = true;

    const fetchDetail = async () => {
      setLoading(true);
      setError("");

      try {
        let response = await listingService.getById(id);

        if (!active) {
          return;
        }

        if (response.success) {
          const payload = response.data;
          const detail =
            payload?.data &&
            typeof payload.data === "object" &&
            !Array.isArray(payload.data)
              ? payload.data
              : Array.isArray(payload)
              ? payload[0] ?? null
              : payload && typeof payload === "object"
              ? payload
              : null;
          if (detail) {
            setListing(detail);
          } else {
            setListing(null);
            setError("Không tìm thấy thông tin tin đăng");
          }
        } else {
          setListing(null);
          setError(response.error || "Không thể tải chi tiết tin đăng");
        }
      } catch (fetchError) {
        if (!active) {
          return;
        }
        setListing(null);
        setError(fetchError.message || "Không thể tải chi tiết tin đăng");
      } finally {
        if (active) {
          setLoading(false);
          setCurrentImage(0);
        }
      }
    };

    fetchDetail();

    return () => {
      active = false;
    };
  }, [id, locationListing]);

  useEffect(() => {
    setCurrentImage(0);
  }, [listing?.id]);

  const images = useMemo(() => {
    const fromListing =
      listing?.listingImages?.map((img) => img?.imageUrl).filter(Boolean) ?? [];
    return fromListing.length > 0 ? fromListing : [FALLBACK_IMAGE];
  }, [listing]);

  useEffect(() => {
    if (currentImage >= images.length) {
      setCurrentImage(0);
    }
  }, [images, currentImage]);

  const handlePrevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, images.length]);

  const favoriteItem = listing
    ? {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        location: listing.area,
        area: listing.area,
        image: images[0],
      }
    : null;

  const favActive = favoriteItem ? isFavorite(favoriteItem.id) : false;

  const specItems = useMemo(
    () => [
      {
        label: "Danh mục",
        value: formatCategory(listing?.category),
        icon: "📂",
      },
      { label: "Thương hiệu", value: listing?.brand?.name, icon: "🏷️" },
      { label: "Model", value: listing?.model, icon: "🔧" },
      {
        label: "Năm sản xuất",
        value: listing?.yearOfManufacture
          ? String(listing.yearOfManufacture)
          : null,
        icon: "📅",
      },
      {
        label: "Trạng thái",
        value: formatListingStatus(listing?.listingStatus),
        icon: "✨",
      },
      { label: "Màu sắc", value: listing?.color, icon: "🎨" },
      {
        label: "Odo",
        value: listing?.odo ? `${listing.odo} km` : null,
        icon: "📏",
      },
      {
        label: "Dung lượng pin",
        value: listing?.batteryCapacity
          ? `${listing.batteryCapacity} kWh`
          : null,
        icon: "🔋",
      },
      {
        label: "Thời gian sạc",
        value: listing?.chargingTime ? `${listing.chargingTime} giờ` : null,
        icon: "⚡",
      },
      {
        label: "Phạm vi hoạt động",
        value: listing?.actualOperatingRange
          ? `${listing.actualOperatingRange} km`
          : null,
        icon: "🛣️",
      },
      {
        label: "Kích thước",
        value: listing?.size ? String(listing.size) : null,
        icon: "📐",
      },
      {
        label: "Khối lượng",
        value: listing?.mass ? `${listing.mass} kg` : null,
        icon: "⚖️",
      },
      {
        label: "Khu vực",
        value: listing?.area,
        icon: "📍",
      },
    ],
    [listing]
  ).filter((item) => item.value);

  const seller = listing?.user;
  const sellerId =
    seller?.id ??
    seller?.userId ??
    seller?.accountId ??
    seller?.userID ??
    seller?.user_id ??
    null;
  const isSellerSelf =
    sellerId && currentUserId && String(sellerId) === String(currentUserId);

  const handleChatWithSeller = () => {
    if (!sellerId || isSellerSelf) return;
    const listingForChat = listing
      ? {
          id: listing.id,
          title: listing.title,
          price: listing.price,
          thumbnail: images?.[0] || FALLBACK_IMAGE,
        }
      : null;

    navigate("/chat", { state: { participantId: sellerId, listingForChat } });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">
            Đang tải thông tin tin đăng...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-xl font-semibold text-red-600">{error}</p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Quay lại trang chủ
          </Link>
        </div>
      );
    }

    if (!listing) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center space-y-4">
          <p className="text-xl font-semibold text-gray-700">
            Không tìm thấy tin đăng
          </p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Quay lại trang chủ
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
              <button
                type="button"
                onClick={handlePrevImage}
                className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-white shadow-lg transition-all hover:scale-110"
                aria-label="Ảnh trước"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={openLightbox}
                className="block w-full cursor-pointer group"
                aria-label="Xem ảnh kích thước đầy đủ"
              >
                <img
                  src={images[currentImage]}
                  alt={listing.title}
                  className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium transition-opacity">
                    Nhấn để phóng to
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleNextImage}
                className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-white shadow-lg transition-all hover:scale-110"
                aria-label="Ảnh tiếp theo"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {currentImage + 1} / {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="p-4 bg-white">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((imgSrc, idx) => (
                    <button
                      type="button"
                      key={`${imgSrc}-${idx}`}
                      onClick={() => setCurrentImage(idx)}
                      className={`h-24 w-32 flex-shrink-0 rounded-xl overflow-hidden transition-all cursor-pointer ${
                        currentImage === idx
                          ? "ring-4 ring-blue-500 scale-105"
                          : "ring-2 ring-gray-200 hover:ring-gray-300"
                      }`}
                    >
                      <img
                        src={imgSrc}
                        alt={`thumb-${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
              Thông tin chi tiết
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specItems.map((item) => (
                <div
                  key={item.label}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
                      {item.label}
                    </p>
                  </div>
                  <p className="text-base font-semibold text-gray-800 ml-7">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
              Mô tả chi tiết
            </h2>
            {listing.description ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                  {listing.description}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500">
                  Người bán chưa cập nhật mô tả chi tiết.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Price & Actions Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white text-blue-600 border border-blue-200 shadow-sm">
                    {formatListingStatus(listing.listingStatus)}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-800 mt-3 leading-tight">
                    {listing.title}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => favoriteItem && toggleFavorite(favoriteItem)}
                  className={`flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-all shadow-md ${
                    favActive
                      ? "bg-red-500 text-white scale-110"
                      : "bg-white text-gray-400 hover:text-red-500 hover:scale-110"
                  }`}
                  aria-label="Lưu tin yêu thích"
                >
                  <FiHeart
                    className={`w-6 h-6 ${favActive ? "fill-current" : ""}`}
                  />
                </button>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Giá bán</p>
                <p className="text-red-600 font-bold text-3xl">
                  {formatCurrency(listing.price)}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="pt-4 space-y-3">
                {!isSellerSelf && sellerId && (
                  <button
                    type="button"
                    onClick={handleChatWithSeller}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <FiMessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Chat với người bán
                  </button>
                )}
                {listing?.id && (
                  <ReportButton
                    listingId={listing.id}
                    userId={currentUserId}
                    ownerId={sellerId}
                    variant="button"
                    className="w-full justify-center py-3.5 rounded-xl border-2 hover:bg-gray-50 transition-all font-semibold"
                    label="Báo cáo tin đăng"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Seller Info Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Thông tin người bán
            </h2>

            <div className="flex items-center gap-4 mb-5 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
              <img
                src={seller?.thumbnail || FALLBACK_AVATAR}
                alt={seller?.userName || "Người bán"}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
              />
              <div>
                <p className="font-bold text-lg text-gray-800">
                  {seller?.userName || "Người bán"}
                </p>
                <p className="text-sm text-gray-500">Thành viên</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">📧</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-800 truncate text-sm">
                    {seller?.email || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">📱</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                  <p className="font-medium text-gray-800 text-sm">
                    {seller?.phoneNumber || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              {seller?.provider && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">🔗</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Nguồn</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {seller.provider}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {renderContent()}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closeLightbox}
            aria-hidden
          />
          <div className="relative z-10 max-w-[95vw] max-h-[95vh] flex items-center justify-center px-4">
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="cursor-pointer absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all hover:scale-110"
                aria-label="Ảnh trước"
              >
                <FiChevronLeft className="w-7 h-7" />
              </button>
            )}

            <img
              src={images[currentImage]}
              alt={listing?.title || "image"}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="cursor-pointer absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition-all hover:scale-110"
                aria-label="Ảnh tiếp theo"
              >
                <FiChevronRight className="w-7 h-7" />
              </button>
            )}

            <button
              type="button"
              onClick={closeLightbox}
              className="cursor-pointer absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
              aria-label="Đóng"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Image counter in lightbox */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              {currentImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ListingDetail;

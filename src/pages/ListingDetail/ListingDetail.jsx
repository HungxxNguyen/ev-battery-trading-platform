// src/pages/ListingDetail/ListingDetail.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { FiHeart, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useFavorites } from "../../contexts/FavoritesContext";
import MainLayout from "../../components/layout/MainLayout";
import listingService from "../../services/apis/listingApi";
import ReportButton from "../../components/report/ReportButton";
import { AuthContext } from "../../contexts/AuthContext";

const FALLBACK_IMAGE = "https://placehold.co/1200x800?text=Listing";
const FALLBACK_AVATAR = "https://placehold.co/160x160?text=User";

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
        // Prefer the stable GetById endpoint; fall back to GetDetail
        let response = await listingService.getById(id);
        if (!response?.success || response?.status === 404) {
          response = await listingService.getListingDetail(id);
        }

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
        image: images[0],
      }
    : null;

  const favActive = favoriteItem ? isFavorite(favoriteItem.id) : false;

  const specItems = useMemo(
    () => [
      { label: "Danh mục", value: listing?.category },
      { label: "Thương hiệu", value: listing?.brand?.name },
      { label: "Model", value: listing?.model },
      {
        label: "Năm sản xuất",
        value: listing?.yearOfManufacture
          ? String(listing.yearOfManufacture)
          : null,
      },
      {
        label: "Trạng thái",
        value: formatListingStatus(listing?.listingStatus),
      },
      { label: "Màu sắc", value: listing?.color },
      {
        label: "Odo",
        value: listing?.odo ? `${listing.odo} km` : null,
      },
      {
        label: "Dung lượng pin",
        value: listing?.batteryCapacity
          ? `${listing.batteryCapacity} kWh`
          : null,
      },
      {
        label: "Thời gian sạc",
        value: listing?.chargingTime ? `${listing.chargingTime} giờ` : null,
      },
      {
        label: "Phạm vi hoạt động",
        value: listing?.actualOperatingRange
          ? `${listing.actualOperatingRange} km`
          : null,
      },
      {
        label: "Kích thước",
        value: listing?.size ? String(listing.size) : null,
      },
      {
        label: "Khối lượng",
        value: listing?.mass ? `${listing.mass} kg` : null,
      },
      {
        label: "Khu vực",
        value: listing?.area,
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
  const isSellerSelf = sellerId && currentUserId && String(sellerId) === String(currentUserId);
  const packageInfo = listing?.package;

  const handleChatWithSeller = () => {
    if (!sellerId || isSellerSelf) return;
    // Route to chat and pass participantId (seller) to start/select thread
    navigate("/chat", { state: { participantId: sellerId } });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md border text-center">
          <p className="text-gray-600">Đang tải thông tin tin đăng...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md border text-center space-y-4">
          <p className="text-lg font-semibold text-red-600">{error}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md"
          >
            Quay lại trang chủ
          </Link>
        </div>
      );
    }

    if (!listing) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md border text-center space-y-4">
          <p className="text-lg font-semibold text-gray-700">
            Không tìm thấy tin đăng
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md"
          >
            Quay lại trang chủ
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-lg shadow-md border">
            <div className="relative">
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800/60 text-white p-2 rounded-full hover:bg-gray-800 cursor-pointer"
                aria-label="Ảnh trước"
              >
                {"<"}
              </button>

              <button
                type="button"
                onClick={openLightbox}
                className="block w-full cursor-pointer"
                aria-label="Xem ảnh kích thước đầy đủ"
              >
                <img
                  src={images[currentImage]}
                  alt={listing.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </button>

              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800/60 text-white p-2 rounded-full hover:bg-gray-800 cursor-pointer"
                aria-label="Ảnh tiếp theo"
              >
                {">"}
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto mt-4 pb-1">
                {images.map((imgSrc, idx) => (
                  <button
                    type="button"
                    key={`${imgSrc}-${idx}`}
                    onClick={() => setCurrentImage(idx)}
                    className={`h-20 w-28 flex-shrink-0 border rounded-md overflow-hidden cursor-pointer ${
                      currentImage === idx
                        ? "border-blue-500"
                        : "border-transparent"
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
            )}
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Thông tin chi tiết
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {specItems.map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase text-gray-400 mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-md border">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Mô tả</h2>
            {listing.description ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Người bán chưa cập nhật mô tả chi tiết.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">
                  {formatListingStatus(listing.listingStatus)}
                </span>
                <h1 className="text-xl font-bold text-gray-800 mt-2">
                  {listing.title}
                </h1>
              </div>
              <button
                type="button"
                onClick={() => favoriteItem && toggleFavorite(favoriteItem)}
                className={`flex items-center justify-center w-10 h-10 rounded-full border transition ${
                  favActive
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "bg-white border-gray-200 text-gray-400 hover:text-red-400"
                }`}
                aria-label="Lưu tin yêu thích"
              >
                <FiHeart
                  className={`w-5 h-5 cursor-pointer ${
                    favActive ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>

            <p className="text-red-600 font-bold text-2xl mb-2">
              {formatCurrency(listing.price)}
            </p>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Khu vực</span>
                <span className="font-medium">
                  {listing.area || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Danh mục</span>
                <span className="font-medium">
                  {listing.category || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thương hiệu</span>
                <span className="font-medium">
                  {listing.brand?.name || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Model</span>
                <span className="font-medium">
                  {listing.model || "Chưa cập nhật"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              {(!isSellerSelf && sellerId) && (
              <button
                type="button"
                onClick={handleChatWithSeller}
                className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
              >
                Chat với người bán
              </button>
              )}
              {listing?.id && (
                <ReportButton
                  listingId={listing.id}
                  userId={currentUserId}
                  ownerId={sellerId}
                  variant="button"
                  className="flex-1 justify-center"
                  label="Báo cáo tin"
                />
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Thông tin người bán
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={seller?.thumbnail || FALLBACK_AVATAR}
                alt={seller?.userName || "Người bán"}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div>
                <p className="font-semibold text-gray-800">
                  {seller?.userName || "Người bán"}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Email</span>
                <span className="font-medium">
                  {seller?.email || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Số điện thoại</span>
                <span className="font-medium">
                  {seller?.phoneNumber || "Chưa cập nhật"}
                </span>
              </div>
              {seller?.provider && (
                <div className="flex justify-between">
                  <span>Nguồn</span>
                  <span className="font-medium">{seller.provider}</span>
                </div>
              )}
            </div>

            {/* Removed extra report action under seller card as requested */}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">{renderContent()}</div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeLightbox}
            aria-hidden
          />
          <div className="relative z-10 max-w-[95vw] max-h-[95vh] flex items-center justify-center px-4">
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
                aria-label="Ảnh trước"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={images[currentImage]}
              alt={listing?.title || "image"}
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
                aria-label="Ảnh tiếp theo"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            )}

            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
              aria-label="Đóng"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ListingDetail;

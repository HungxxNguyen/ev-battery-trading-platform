// src/pages/ListingDetail/ListingDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { useFavorites } from "../../contexts/FavoritesContext";
import MainLayout from "../../components/layout/MainLayout";
import listingService from "../../services/apis/listingApi";

const FALLBACK_IMAGE = "https://placehold.co/1200x800?text=Listing";
const FALLBACK_AVATAR = "https://placehold.co/160x160?text=User";

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Lien he";
  }

  try {
    return `${new Intl.NumberFormat("vi-VN").format(Number(value))} VND`;
  } catch {
    return `${value} VND`;
  }
};

const formatListingStatus = (status) => {
  if (!status) return "Khong ro";
  const mapping = {
    New: "Moi",
    Used: "Da su dung",
  };
  return mapping[status] || status;
};

const ListingDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const locationListing = location.state?.listing;
  const { toggleFavorite, isFavorite } = useFavorites();

  const [listing, setListing] = useState(locationListing ?? null);
  const [loading, setLoading] = useState(!locationListing);
  const [error, setError] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

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
        const response = await listingService.getListingDetail(id);

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
            setError("Khong tim thay thong tin tin dang");
          }
        } else {
          setListing(null);
          setError(response.error || "Khong the tai chi tiet tin dang");
        }
      } catch (fetchError) {
        if (!active) {
          return;
        }
        setListing(null);
        setError(fetchError.message || "Khong the tai chi tiet tin dang");
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
      { label: "Danh muc", value: listing?.category },
      { label: "Thuong hieu", value: listing?.brand?.name },
      { label: "Model", value: listing?.model },
      {
        label: "Nam san xuat",
        value: listing?.yearOfManufacture
          ? String(listing.yearOfManufacture)
          : null,
      },
      {
        label: "Trang thai",
        value: formatListingStatus(listing?.listingStatus),
      },
      { label: "Mau sac", value: listing?.color },
      {
        label: "Odo",
        value: listing?.odo ? `${listing.odo} km` : null,
      },
      {
        label: "Dung luong pin",
        value: listing?.batteryCapacity
          ? `${listing.batteryCapacity} kWh`
          : null,
      },
      {
        label: "Thoi gian sac",
        value: listing?.chargingTime ? `${listing.chargingTime} gio` : null,
      },
      {
        label: "Tam hoat dong",
        value: listing?.actualOperatingRange
          ? `${listing.actualOperatingRange} km`
          : null,
      },
      {
        label: "Kich thuoc",
        value: listing?.size ? String(listing.size) : null,
      },
      {
        label: "Khoi luong",
        value: listing?.mass ? `${listing.mass} kg` : null,
      },
      {
        label: "Khu vuc",
        value: listing?.area,
      },
    ],
    [listing]
  ).filter((item) => item.value);

  const seller = listing?.user;
  const packageInfo = listing?.package;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md border text-center">
          <p className="text-gray-600">Dang tai thong tin tin dang...</p>
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
            Quay lai trang chu
          </Link>
        </div>
      );
    }

    if (!listing) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md border text-center space-y-4">
          <p className="text-lg font-semibold text-gray-700">
            Khong tim thay tin dang
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md"
          >
            Quay lai trang chu
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
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800/60 text-white p-2 rounded-full hover:bg-gray-800"
                aria-label="Anh truoc"
              >
                {"<"}
              </button>

              <img
                src={images[currentImage]}
                alt={listing.title}
                className="w-full h-96 object-cover rounded-lg"
              />

              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800/60 text-white p-2 rounded-full hover:bg-gray-800"
                aria-label="Anh tiep theo"
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
                    className={`h-20 w-28 flex-shrink-0 border rounded-md overflow-hidden ${
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
              Thong tin chi tiet
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
            <h2 className="text-lg font-bold text-gray-800 mb-4">Mo ta</h2>
            {listing.description ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Nguoi ban chua cap nhat mo ta chi tiet.
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
                aria-label="Luu tin yeu thich"
              >
                <FiHeart
                  className={`w-5 h-5 ${favActive ? "fill-current" : ""}`}
                />
              </button>
            </div>

            <p className="text-red-600 font-bold text-2xl mb-2">
              {formatCurrency(listing.price)}
            </p>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Khu vuc</span>
                <span className="font-medium">
                  {listing.area || "Chua cap nhat"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Danh muc</span>
                <span className="font-medium">
                  {listing.category || "Chua cap nhat"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Thuong hieu</span>
                <span className="font-medium">
                  {listing.brand?.name || "Chua cap nhat"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Model</span>
                <span className="font-medium">
                  {listing.model || "Chua cap nhat"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg text-gray-700"
              >
                Chat
              </button>
              <a
                href={
                  listing.user?.phoneNumber
                    ? `tel:${listing.user.phoneNumber}`
                    : "#"
                }
                className="flex-1 px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500 text-center"
              >
                Goi ngay
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Thong tin nguoi ban
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={seller?.thumbnail || FALLBACK_AVATAR}
                alt={seller?.userName || "Nguoi ban"}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div>
                <p className="font-semibold text-gray-800">
                  {seller?.userName || "Nguoi ban"}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Email</span>
                <span className="font-medium">
                  {seller?.email || "Chua cap nhat"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>So dien thoai</span>
                <span className="font-medium">
                  {seller?.phoneNumber || "Chua cap nhat"}
                </span>
              </div>
              {seller?.provider && (
                <div className="flex justify-between">
                  <span>Nguon</span>
                  <span className="font-medium">{seller.provider}</span>
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
      <div className="container mx-auto px-4 py-6">{renderContent()}</div>
    </MainLayout>
  );
};

export default ListingDetail;

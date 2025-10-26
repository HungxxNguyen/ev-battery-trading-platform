// src/pages/Home/Home.jsx
import React, { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { useFavorites } from "../../contexts/FavoritesContext";
import listingService from "../../services/apis/listingApi";

const DEFAULT_LISTING_PARAMS = {
  pageIndex: 1,
  pageSize: 10,
  from: 0,
  to: 1000000000,
};

const FALLBACK_LISTING_IMAGE = "https://placehold.co/400x300?text=Listing";
const SKELETON_COUNT = 5;

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
    New: "Mới",
    Used: "Đã sử dụng",
  };
  return mapping[status] || status;
};

const Home = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mainCategories = [
    {
      id: "car",
      title: "Xe ô tô điện",
      image: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
    },
    {
      id: "bike",
      title: "Xe máy điện",
      image:
        "https://tse2.mm.bing.net/th/id/OIP.IY8TgrPvqIlkJaQZ9OqAUwHaFx?w=860&h=670&rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    {
      id: "battery",
      title: "Pin xe điện",
      image:
        "https://img.freepik.com/premium-vector/battery-icon_1076610-15185.jpg",
    },
  ];

  useEffect(() => {
    let active = true;

    const fetchListings = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await listingService.getListings(
          DEFAULT_LISTING_PARAMS
        );

        if (!active) return;

        if (response.success) {
          const payload = response.data;
          const items = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
            ? payload
            : [];
          setListings(items);
        } else {
          setListings([]);
          setError(response.error || "Khong the tai danh sach tin dang");
        }
      } catch (fetchError) {
        if (!active) return;
        setListings([]);
        setError(fetchError.message || "Khong the tai danh sach tin dang");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchListings();

    return () => {
      active = false;
    };
  }, []);

  const renderSkeletonCards = () =>
    Array.from({ length: SKELETON_COUNT }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="bg-white rounded-lg overflow-hidden border border-gray-200 p-3 animate-pulse"
      >
        <div className="h-40 bg-gray-200 rounded mb-3" />
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-100 rounded mb-1" />
        <div className="h-3 bg-gray-100 rounded mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    ));

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Danh muc san pham */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Danh mục sản phẩm
          </h2>
          <div className="flex gap-4">
            {mainCategories.map((cat) => (
              <Link
                to={`/category/${cat.id}`}
                key={cat.id}
                className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-14 h-14 mb-2"
                />
                <span className="text-sm font-medium text-center">
                  {cat.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Tin dang moi nhat */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Tin đăng mới nhất
          </h2>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {loading
              ? renderSkeletonCards()
              : listings.length > 0
              ? listings.map((listing) => {
                  const coverImage =
                    listing.listingImages?.[0]?.imageUrl ||
                    FALLBACK_LISTING_IMAGE;
                  const favActive = isFavorite(listing.id);
                  const statusLabel = formatListingStatus(
                    listing.listingStatus
                  );
                  const metaParts = [listing.brand?.name, listing.model].filter(
                    Boolean
                  );
                  const secondaryParts = [
                    listing.yearOfManufacture
                      ? `Năm ${listing.yearOfManufacture}`
                      : null,
                    listing.odo ? `Odo ${listing.odo} km` : null,
                  ].filter(Boolean);

                  return (
                    <Link
                      to={`/listing/${listing.id}`}
                      state={{ listing }}
                      key={listing.id}
                      className="bg-white rounded-lg overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="h-40 bg-gray-200 overflow-hidden relative">
                        <img
                          src={coverImage}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-blue-500 text-white">
                          {statusLabel}
                        </span>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleFavorite({
                              id: listing.id,
                              title: listing.title,
                              price: listing.price,
                              location: listing.area,
                              image: coverImage,
                            });
                          }}
                          className={`absolute top-2 right-2 flex items-center justify-center w-9 h-9 rounded-full shadow-sm transition ${
                            favActive
                              ? "bg-white text-red-500"
                              : "bg-white/90 text-gray-500 hover:text-red-400"
                          }`}
                          aria-label="Luu tin yeu thich"
                        >
                          <FiHeart
                            className={`w-5 h-5 ${
                              favActive ? "fill-current" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <div className="p-3">
                        <h3 className="font-semibold text-base mb-1 line-clamp-2 h-12">
                          {listing.title}
                        </h3>

                        {metaParts.length > 0 && (
                          <p className="text-gray-500 text-xs mb-1">
                            {metaParts.join(" / ")}
                          </p>
                        )}

                        {secondaryParts.length > 0 && (
                          <p className="text-gray-500 text-xs mb-1">
                            {secondaryParts.join(" - ")}
                          </p>
                        )}

                        <p className="text-red-600 font-bold text-lg mb-1">
                          {formatCurrency(listing.price)}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-gray-500 text-xs">
                            {listing.area || "Chua cap nhat"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              : !loading && (
                  <div className="col-span-full text-sm text-gray-500">
                    Chua co tin dang nao duoc hien thi.
                  </div>
                )}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/category"
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors duration-200 inline-block"
            >
              Xem thêm tin đăng
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;

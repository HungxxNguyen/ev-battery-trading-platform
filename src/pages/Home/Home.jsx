// src/pages/Home/Home.jsx
import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { useFavorites } from "../../contexts/FavoritesContext";

const Home = () => {
  const { toggleFavorite, isFavorite } = useFavorites();

  // Danh mục hãng xe điện
  const electricCarBrands = [
    { id: 1, name: "VinFast", icon: "⚡" },
    { id: 2, name: "Tesla", icon: "🔌" },
    { id: 3, name: "Porsche", icon: "⚡" },
    { id: 4, name: "BMW", icon: "🔋" },
    { id: 5, name: "Audi", icon: "⚡" },
    { id: 6, name: "BYD", icon: "⚡" },
    { id: 7, name: "KIA", icon: "🔌" },
    { id: 8, name: "Hyundai", icon: "⚡" },
  ];

  // Danh mục hãng pin xe điện
  const batteryBrands = [
    { id: 101, name: "LG Energy", icon: "🔋" },
    { id: 102, name: "Panasonic", icon: "🔌" },
    { id: 103, name: "CATL", icon: "🔋" },
    { id: 104, name: "Samsung SDI", icon: "🔋" },
    { id: 105, name: "SK Innovation", icon: "🔌" },
    { id: 106, name: "BYD Battery", icon: "🔋" },
  ];

  // Tin đăng demo (5 card)
  const regularPosts = [
    {
      id: 1,
      title: "VINFAST VF3 SẴN XE - TRẢ TRƯỚC 0-45TR NHẬN XE",
      price: "279.000.000 đ",
      location: "Phường 22, Quận Bình Thạnh, Tp Hồ Chí Minh",
      image:
        "https://vinfastoto3s.com/wp-content/uploads/2024/04/vinfast-vf-3-03042024.png",
      status: "Mới",
    },
    {
      id: 2,
      title: "VF7 GIÁ SIÊU ƯU ĐÃI - HỖ TRỢ VAY 90%",
      price: "767.000.000 đ",
      location: "Huyện Long Thành",
      image:
        "https://tse4.mm.bing.net/th/id/OIP.7PNuD1w87IyBBEvmkJqYAQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      year: "2025 • Điện • Tự động",
      status: "Mới",
      promotion: "SỞ HỮU VF7 CHỈ 15% CÒN LẠI DỄ NGÂN HÀNG LO!",
    },
    {
      id: 3,
      title: "Yamaha Exciter 135 2014",
      price: "15.500.000 đ",
      location: "Quận Tân Bình",
      image:
        "https://tse4.mm.bing.net/th/id/OIP.7PNuD1w87IyBBEvmkJqYAQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      year: "2014 • Tay côn",
      status: "Đã sử dụng",
    },
    {
      id: 4,
      title: "Thanh lý xe tải Jac N200 MB",
      price: "179.000.000 đ",
      location: "Quận 12",
      image:
        "https://tse4.mm.bing.net/th/id/OIP.7PNuD1w87IyBBEvmkJqYAQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description: "Thùng dài 4.4m",
      status: "Đã sử dụng",
    },
    {
      id: 5,
      title: "VF5 Plus ưu đãi đặc biệt",
      price: "495.000.000 đ",
      location: "Thành Phố Thủ Đức",
      image:
        "https://tse4.mm.bing.net/th/id/OIP.7PNuD1w87IyBBEvmkJqYAQHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      year: "2025 • Điện • Tự động",
      status: "Mới",
    },
  ];

  // nếu file là .jsx (JS):
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Danh mục hãng xe điện & pin */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Danh mục hãng xe điện & pin
          </h2>

          {/* Hãng xe điện */}
          <h3 className="text-lg font-semibold mb-3 text-blue-600">
            Hãng xe điện
          </h3>
          <div className="flex justify-center mb-6">
            <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar max-w-full">
              {electricCarBrands.map((brand) => (
                <button
                  key={brand.id}
                  className={`flex flex-col items-center justify-center w-24 h-24 flex-shrink-0 rounded-lg transition-all duration-300 ${
                    selectedCategory === brand.id
                      ? "bg-blue-100 border-2 border-blue-400"
                      : "bg-green-50 border border-green-200 hover:bg-green-100"
                  }`}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === brand.id ? null : brand.id
                    )
                  }
                >
                  <span className="text-2xl mb-1">{brand.icon}</span>
                  <span className="text-xs text-center px-1 font-medium">
                    {brand.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Hãng pin xe điện */}
          <h3 className="text-lg font-semibold mb-3 text-blue-600">
            Hãng pin xe điện
          </h3>
          <div className="flex justify-center">
            <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar max-w-full">
              {batteryBrands.map((brand) => (
                <button
                  key={brand.id}
                  className={`flex flex-col items-center justify-center w-24 h-24 flex-shrink-0 rounded-lg transition-all duration-300 ${
                    selectedCategory === brand.id
                      ? "bg-blue-100 border-2 border-blue-400"
                      : "bg-yellow-50 border border-yellow-200 hover:bg-yellow-100"
                  }`}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === brand.id ? null : brand.id
                    )
                  }
                >
                  <span className="text-2xl mb-1">{brand.icon}</span>
                  <span className="text-xs text-center px-1 font-medium">
                    {brand.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tin đăng mới nhất */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Tin đăng mới nhất
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {regularPosts.map((post) => {
              const favActive = isFavorite(post.id);
              const isNew = post.status === "Mới";
              return (
                <Link
                  to={`/listing/${post.id}`}
                  key={post.id}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-md"
                >
                  <div className="h-40 bg-gray-200 overflow-hidden relative">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-2 left-2 text-xs px-2 py-1 rounded ${
                        isNew
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {post.status}
                    </span>

                    {/* Nút lưu tin */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite({
                          id: post.id,
                          title: post.title,
                          price: post.price,
                          location: post.location,
                          image: post.image,
                        });
                      }}
                      className={`absolute top-2 right-2 flex items-center justify-center w-9 h-9 rounded-full shadow-sm transition ${
                        favActive
                          ? "bg-white text-red-500"
                          : "bg-white/90 text-gray-500 hover:text-red-400"
                      }`}
                      aria-label="Lưu tin yêu thích"
                    >
                      <FiHeart
                        className={`w-5 h-5 ${favActive ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-base mb-1 line-clamp-2 h-12">
                      {post.title}
                    </h3>

                    {post.year && (
                      <p className="text-gray-500 text-xs mb-1">{post.year}</p>
                    )}
                    {post.description && (
                      <p className="text-gray-500 text-xs mb-1">
                        {post.description}
                      </p>
                    )}
                    {post.promotion && (
                      <div className="bg-red-100 text-red-800 text-xs p-2 rounded mb-2 line-clamp-2">
                        {post.promotion}
                      </div>
                    )}

                    <p className="text-red-600 font-bold text-lg mb-1">
                      {post.price}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-500 text-xs">{post.location}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Nút xem thêm */}
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors duration-200">
              Xem thêm 79.571 tin đăng
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;

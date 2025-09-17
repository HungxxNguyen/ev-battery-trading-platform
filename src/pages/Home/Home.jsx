// src/pages/Home/Home.jsx
import React, { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";

const Home = () => {
  // Fake data cho danh mục hãng xe điện
  const electricCarBrands = [
    { id: 1, name: "VinFast", icon: "⚡" },
    { id: 2, name: "Tesla", icon: "🔌" },
    { id: 3, name: "Porsche", icon: "⚡" },
    { id: 4, name: "BMW", icon: "🔋" },
    { id: 5, name: "Audi", icon: "⚡" },
    { id: 6, name: "BYD", icon: "⚡" },
    { id: 7, name: "KIA", icon: "🔌" },
    { id: 8, name: "Hyundai", icon: "⚡" }
  ];

  // Fake data cho danh mục hãng pin xe điện
  const batteryBrands = [
    { id: 101, name: "LG Energy", icon: "🔋" },
    { id: 102, name: "Panasonic", icon: "🔌" },
    { id: 103, name: "CATL", icon: "🔋" },
    { id: 104, name: "Samsung SDI", icon: "🔋" },
    { id: 105, name: "SK Innovation", icon: "🔌" },
    { id: 106, name: "BYD Battery", icon: "🔋" }
  ];

  // Fake data cho tin đăng thường - chỉ giữ lại 5 card
  const regularPosts = [
    {
      id: 1,
      title: "Isuzu 1 tấn đời 2017",
      price: "245.000.000 đ",
      location: "Quận Bình Tân",
      image: "https://via.placeholder.com/200x150?text=Xe+Isuzu",
      status: "Đã sử dụng"
    },
    {
      id: 2,
      title: "VF7 GIÁ SIÊU ƯU ĐÃI - HỖ TRỢ VAY 90%",
      price: "767.000.000 đ",
      location: "Huyện Long Thành",
      image: "https://via.placeholder.com/200x150?text=VF7",
      year: "2025 • Điện • Tự động",
      status: "Mới",
      promotion: "SỞ HỮU VF7 CHỈ 15% CÒN LẠI DỄ NGÂN HÀNG LO!"
    },
    {
      id: 3,
      title: "Yamaha Exciter 135 2014",
      price: "15.500.000 đ",
      location: "Quận Tân Bình",
      image: "https://via.placeholder.com/200x150?text=Exciter",
      year: "2014 • Tay côn",
      status: "Đã sử dụng"
    },
    {
      id: 4,
      title: "Thanh lý xe tải Jac N200 MB",
      price: "179.000.000 đ",
      location: "Quận 12",
      image: "https://via.placeholder.com/200x150?text=Jac+N200",
      description: "Thùng dài 4.4m",
      status: "Đã sử dụng"
    },
    {
      id: 5,
      title: "VF5 Plus ưu đãi đặc biệt",
      price: "495.000.000 đ",
      location: "Thành Phố Thủ Đức",
      image: "https://via.placeholder.com/200x150?text=VF5+Plus",
      year: "2025 • Điện • Tự động",
      status: "Mới"
    }
  ];

  // State để theo dõi danh mục được chọn
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">  
             
        {/* Phần danh mục gộp - Hãng xe điện và Hãng pin */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Danh mục hãng xe điện & pin</h2>
          
          {/* Sub-title cho hãng xe điện */}
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Hãng xe điện</h3>
          <div className="flex justify-center mb-6">
            <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar max-w-full">
              {electricCarBrands.map(brand => (
                <button 
                  key={brand.id}
                  className={`flex flex-col items-center justify-center w-24 h-24 flex-shrink-0 rounded-lg transition-all duration-300 ${
                    selectedCategory === brand.id 
                      ? "bg-blue-100 border-2 border-blue-400" 
                      : "bg-green-50 border border-green-200 hover:bg-green-100"
                  }`}
                  onClick={() => setSelectedCategory(
                    selectedCategory === brand.id ? null : brand.id
                  )}
                >
                  <span className="text-2xl mb-1">{brand.icon}</span>
                  <span className="text-xs text-center px-1 font-medium">{brand.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Sub-title cho hãng pin xe điện */}
          <h3 className="text-lg font-semibold mb-3 text-blue-600">Hãng pin xe điện</h3>
          <div className="flex justify-center">
            <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar max-w-full">
              {batteryBrands.map(brand => (
                <button 
                  key={brand.id}
                  className={`flex flex-col items-center justify-center w-24 h-24 flex-shrink-0 rounded-lg transition-all duration-300 ${
                    selectedCategory === brand.id 
                      ? "bg-blue-100 border-2 border-blue-400" 
                      : "bg-yellow-50 border border-yellow-200 hover:bg-yellow-100"
                  }`}
                  onClick={() => setSelectedCategory(
                    selectedCategory === brand.id ? null : brand.id
                  )}
                >
                  <span className="text-2xl mb-1">{brand.icon}</span>
                  <span className="text-xs text-center px-1 font-medium">{brand.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Phần tin đăng với nền trắng và viền rõ rệt */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Tin đăng mới nhất</h2>
          
          {/* Lưới tin đăng chính - chỉ hiển thị 5 card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {regularPosts.map(post => (
              <div 
                key={post.id}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-md"
              >
                <div className="h-40 bg-gray-200 overflow-hidden relative">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Badge trạng thái */}
                  <span className={`absolute top-2 left-2 text-xs px-2 py-1 rounded ${
                    post.status === "Mới" ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                  }`}>
                    {post.status}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-base mb-1 line-clamp-2 h-12">{post.title}</h3>
                  {post.year && <p className="text-gray-500 text-xs mb-1">{post.year}</p>}
                  {post.description && <p className="text-gray-500 text-xs mb-1">{post.description}</p>}
                  
                  {/* Hiển thị khuyến mãi đặc biệt cho VF7 */}
                  {post.promotion && (
                    <div className="bg-red-100 text-red-800 text-xs p-2 rounded mb-2 line-clamp-2">
                      {post.promotion}
                    </div>
                  )}
                  
                  <p className="text-red-600 font-bold text-lg mb-1">{post.price}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500 text-xs">{post.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Quảng cáo đặt xe online */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg text-blue-800 mb-2"></h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Giao xe miễn phí</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Hàng chính hãng 100%</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Hỗ trợ mua trả góp</span>
              </div>
            </div>
          </div>
          
          {/* Nút xem thêm */}
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors duration-200">
              Xem thêm 79.571 tin đăng
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </MainLayout>
  );
};

export default Home;
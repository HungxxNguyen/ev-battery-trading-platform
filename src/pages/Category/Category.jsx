import React from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

// Dữ liệu giả từ Home.jsx
const regularPosts = [
  {
    id: 1,
    title: "VINFAST VF3 SẴN XE - TRẢ TRƯỚC 0-45TR NHẬN XE",
    price: "279.000.000 đ",
    location: "Phường 22, Quận Bình Thạnh, Tp Hồ Chí Minh",
    image:
      "https://vinfastoto3s.com/wp-content/uploads/2024/04/vinfast-vf-3-03042024.png",
    status: "Mới",
    category: "car",
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
    category: "car",
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
    category: "bike",
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
    category: "other",
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
    category: "car",
  },
];

// Danh mục chính
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
  {
    id: "other",
    title: "Các phương tiện khác",
    image: "https://cdn-icons-png.flaticon.com/512/743/743922.png",
  },
];

const Category = () => {
  const { categoryId } = useParams();

  // Tìm danh mục được chọn
  const selectedCategory = mainCategories.find((cat) => cat.id === categoryId);

  // Lọc bài đăng theo danh mục
  const filteredPosts = regularPosts.filter(
    (post) => post.category === categoryId
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:underline">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">
            {selectedCategory ? selectedCategory.title : "Danh mục"}
          </span>
        </div>

        {/* Tiêu đề danh mục */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {selectedCategory ? selectedCategory.title : "Danh mục sản phẩm"}
          </h2>
        </div>

        {/* Danh sách bài đăng */}
        {filteredPosts.length > 0 ? (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {filteredPosts.map((post) => (
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
                        post.status === "Mới"
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {post.status}
                    </span>
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
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md border text-center">
            <h2 className="text-xl font-bold mb-4">
              Không tìm thấy bài đăng trong danh mục này
            </h2>
            <Link
              to="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors duration-200 inline-block"
            >
              Quay lại Trang Chủ
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Category;
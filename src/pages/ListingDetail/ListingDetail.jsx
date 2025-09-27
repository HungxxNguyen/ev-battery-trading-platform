import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { useFavorites } from "../../contexts/FavoritesContext";
import MainLayout from "../../components/layout/MainLayout";

// Giữ lại toàn bộ fake data nhưng đổi thumbnails -> images
const regularPosts = [
  {
    id: 1,
    title: "VINFAST VF3 SẴN XE - TRẢ TRƯỚC 0-45TR NHẬN XE",
    price: "279.000.000 đ",
    subPrice: "Trả góp từ 2,92 triệu/tháng",
    location: "Phường 22, Quận Bình Thạnh, Tp Hồ Chí Minh",
    images: [
      "https://vinfastoto3s.com/wp-content/uploads/2024/04/vinfast-vf-3-03042024.png",
      "https://vinfast-tiengiang.vn/wp-content/uploads/2025/03/vinfast-vf3-240510-c8.jpg",
      "https://bonbanhmientrung.com/uploads/post/1172941951320.png" ,
      "https://vinfastvietnam.com.vn/wp-content/uploads/2023/09/Hong-Phan-min.png",

    ],
    status: "Mới",
    description: [
      "Giảm ngay 4% giá bán – tiết kiệm 11.960.000 VND",
      "Tặng 2 năm bảo hiểm thân xe (hoặc quy đổi 6.500.000 VND tiền mặt)",
      "Đổi xe xăng sang xe điện – giảm thêm 5.000.000 VND",
      "Tặng 6.000.000 điểm Vinclub khi đăng kí ở Sài Gòn",
      "Hỗ trợ lãi suất ưu đãi 3 năm 6.5%/năm",
    ],
    year: "2025 • Điện • Tự động",
    seller: "09844****",
    sellerName: "VinFast Miền Nam",
    sellerRating: "5 đã bán • 4 đang bán",
    sellerResponse: "78%",
    postedAt: "Đăng 7 ngày trước",
    active: "Hoạt động 11 giờ trước",
  },
  {
    id: 2,
    title: "Isuzu 1 tấn đời 2017",
    price: "245.000.000 đ",
    location: "Quận Bình Tân",
    images: [
      "https://via.placeholder.com/600x400.png?text=Isuzu+Main",
      "https://via.placeholder.com/600x400.png?text=Isuzu+1",
      "https://via.placeholder.com/600x400.png?text=Isuzu+2",
    ],
    status: "Đã sử dụng",
    description: ["Xe tải Isuzu 1 tấn, đời 2017, tình trạng tốt, phù hợp cho vận chuyển hàng hóa nội thành."],
    year: "2017",
    seller: "01234****",
    sellerName: "Nguyen Van A",
    sellerRating: "4.5 (25 Đánh giá) • 2 đang bán",
    sellerResponse: "90%",
    postedAt: "Đăng 20 ngày trước",
    active: "Hoạt động 2 ngày trước",
  },
  // Các post còn lại giữ nguyên, chỉ thay thumbnails thành images
];

const ListingDetail = () => {
  const { id } = useParams();
  const { toggleFavorite, isFavorite } = useFavorites();
  const post = regularPosts.find((post) => post.id === parseInt(id));
  const [currentImage, setCurrentImage] = useState(0);

  if (!post) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white p-6 rounded-lg shadow-md border text-center">
            <h2 className="text-xl font-bold">Không tìm thấy bài đăng</h2>
            <Link
              to="/"
              className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-md"
            >
              Quay lại Trang Chủ
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const favoriteItem = {
    id: post.id,
    title: post.title,
    price: post.price,
    location: post.location,
    image:
      Array.isArray(post.images) && post.images.length > 0
        ? post.images[0]
        : "https://placehold.co/200x140?text=Listing",
  };
  const favActive = isFavorite(post.id);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 grid grid-cols-3 gap-6">
        {/* LEFT CONTENT */}
        <div className="col-span-2">
          {/* Image Gallery */}
          <div className="bg-white p-5 rounded-lg shadow-md border mb-6 relative">
            {/* Nút mũi tên trái */}
            <button
              onClick={() =>
                setCurrentImage((prev) =>
                  prev === 0 ? post.images.length - 1 : prev - 1
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              ❮
            </button>

            {/* Ảnh chính */}
            <img
              src={post.images[currentImage]}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-4"
            />

            {/* Nút mũi tên phải */}
            <button
              onClick={() =>
                setCurrentImage((prev) =>
                  prev === post.images.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              ❯
            </button>

            {/* Thumbnail */}
            <div className="flex gap-2 overflow-x-auto">
              {post.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  onClick={() => setCurrentImage(idx)}
                  className={`w-24 h-20 object-cover rounded-md border cursor-pointer ${
                    currentImage === idx ? "border-2 border-blue-500" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-5 rounded-lg shadow-md border">
            <h2 className="text-lg font-bold mb-4">Mô tả chi tiết</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {post.description.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="col-span-1 space-y-6">
          {/* Info */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-lg font-bold text-gray-800 flex-1">
                {post.title}
              </h1>
              <button
                type="button"
                onClick={() => toggleFavorite(favoriteItem)}
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
            <p className="text-red-600 font-bold text-2xl mb-1">{post.price}</p>
            {post.subPrice && <p className="text-gray-500 mb-3">{post.subPrice}</p>}

            <div className="flex space-x-3 mb-3">
              <button className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Chat
              </button>
              <a
                href={`tel:${post.seller}`}
                className="flex-1 px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-500"
              >
                Hiện số {post.seller}
              </a>
            </div>
            <p className="text-sm text-gray-600 mb-1">{post.location}</p>
            <p className="text-sm text-gray-500">{post.postedAt}</p>
          </div>

          {/* Seller Info */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/VinFast_Logo.svg/1200px-VinFast_Logo.svg.png"
                alt="VinFast"
                className="w-12 h-12 object-contain"
              />
              <div>
                <p className="font-bold">{post.sellerName}</p>
                <p className="text-sm text-gray-600">{post.sellerRating}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {post.active} • Phản hồi: {post.sellerResponse}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              <button className="px-3 py-1 border rounded-full text-sm text-gray-700 hover:bg-gray-100">
                Xe này còn không ạ?
              </button>
              <button className="px-3 py-1 border rounded-full text-sm text-gray-700 hover:bg-gray-100">
                Xe chính chủ hay đã qua sử dụng?
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ListingDetail;


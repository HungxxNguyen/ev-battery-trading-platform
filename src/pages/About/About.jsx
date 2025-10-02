import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import background2 from "./../../assets/background2.png";
import NgocBao from "./../../assets/NgocBao.jpg";
import NguyenHung from "./../../assets/NguyenHung.jpg";
import GiaHao from "./../../assets/GiaHao.jpg";
import PhucBinh from "./../../assets/PhucBinh.jpg";

const About = () => {
  return (
    <MainLayout>
      {/* Phần Hero với Banner */}
      <div className="relative w-full h-[500px]">
        <img
          src={background2}
          alt="VoltX Exchange Banner Giới thiệu"
          className="w-full h-full object-cover object-center"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-blue-900/60 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              Về VoltX Exchange
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Nền tảng giao dịch xe điện & pin cũ hàng đầu
            </p>
          </div>
        </div>
      </div>

      {/* Phần Nội dung Giới thiệu */}
      <div className="w-full px-4 sm:px-6 lg:px-20 py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-10">
            Câu Chuyện Của Chúng Tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Phần văn bản */}
            <div className="space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                VoltX Exchange ra đời từ tầm nhìn về một tương lai giao thông
                bền vững. Chúng tôi nhận thấy nhu cầu ngày càng tăng về việc mua
                bán xe điện và pin cũ một cách minh bạch, an toàn và hiệu quả.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Từ những ngày đầu với một nhóm nhỏ các chuyên gia trong lĩnh vực
                xe điện, chúng tôi đã phát triển thành nền tảng kết nối hàng
                nghìn người mua và người bán trên khắp Việt Nam. Mỗi giao dịch
                tại VoltX không chỉ là mua bán mà còn là đóng góp vào cộng đồng
                sử dụng xe điện thông minh và tiết kiệm.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Chúng tôi tin rằng mỗi chiếc xe điện và bộ pin cũ đều có giá trị
                tái sử dụng, góp phần bảo vệ môi trường và thúc đẩy công nghệ
                xanh phát triển.
              </p>
            </div>

            {/* Phần hình ảnh và văn bản nổi */}
            <div className="relative h-64 md:h-[400px] lg:h-[500px]">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-lg p-6 h-full flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Hình ảnh nền với kích thước nhỏ hơn một chút */}
                  <img
                    src={background2}
                    alt="About VoltX Exchange"
                    className="absolute inset-0 w-[80%] h-[80%] object-cover opacity-50 rounded-lg mx-auto my-auto transition-transform duration-300 hover:scale-105"
                    crossOrigin="anonymous"
                  />
                  {/* Văn bản trên hình ảnh */}
                  <p className="text-gray-900 text-center text-xl md:text-2xl font-semibold relative z-10 px-4 py-2 bg-white/80 rounded-md shadow-lg">
                    "Nơi Công Nghệ Gặp Gỡ Bền Vững"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phần Sứ Mệnh & Tầm Nhìn */}
      <div className="w-full px-4 sm:px-6 lg:px-20 py-16 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <h2 className="text-4xl md:text-5xl font-bold text-cyan-300 text-center mb-12">
          Sứ Mệnh & Tầm Nhìn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Card Sứ Mệnh */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 transition-all duration-300 border border-cyan-500/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-cyan-300 text-xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-cyan-300 mb-0">Sứ Mệnh</h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Tạo ra một thị trường minh bạch và đáng tin cậy cho việc mua bán
              xe điện và pin cũ, thúc đẩy việc sử dụng phương tiện điện tử và
              góp phần xây dựng môi trường bền vững.
            </p>
          </div>

          {/* Card Tầm Nhìn */}
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-300 border border-blue-500/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-300 text-xl">🌍</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-300 mb-0">
                Tầm Nhìn
              </h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Trở thành nền tảng giao dịch xe điện và năng lượng tái tạo hàng
              đầu Đông Nam Á, tiên phong trong việc xây dựng cộng đồng sử dụng
              công nghệ xanh.
            </p>
          </div>
        </div>
      </div>

      {/* Phần Đội Ngũ */}
      <div className="w-full px-4 sm:px-6 lg:px-20 py-16 bg-gradient-to-br from-gray-50 to-cyan-50">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-12">
          Đội Ngũ Phát Triển
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Nguyễn Ngọc Bảo */}
          <div className="text-center group">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-cyan-500/30 overflow-hidden">
              <img
                src={NgocBao}
                alt="Nguyễn Ngọc Bảo"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-4 group-hover:text-cyan-600 transition-colors duration-300">
              Nguyễn Ngọc Bảo
            </h3>
            <p className="text-gray-600 bg-cyan-100 px-3 py-1 rounded-full inline-block mt-2">
              Backend Developer
            </p>
          </div>

          {/* Nguyễn Hùng */}
          <div className="text-center group">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-cyan-500/30 overflow-hidden">
              <img
                src={NguyenHung}
                alt="Nguyễn Hùng"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-4 group-hover:text-cyan-600 transition-colors duration-300">
              Nguyễn Hùng
            </h3>
            <p className="text-gray-600 bg-cyan-100 px-3 py-1 rounded-full inline-block mt-2">
              Frontend Developer
            </p>
          </div>

          {/* Nguyễn Gia Hào */}
          <div className="text-center group">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-cyan-500/30 overflow-hidden">
              <img
                src={GiaHao}
                alt="Nguyễn Gia Hào"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-4 group-hover:text-cyan-600 transition-colors duration-300">
              Nguyễn Gia Hào
            </h3>
            <p className="text-gray-600 bg-cyan-100 px-3 py-1 rounded-full inline-block mt-2">
              Frontend Developer
            </p>
          </div>

          {/* Đào Phúc Bình */}
          <div className="text-center group">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-cyan-500/30 overflow-hidden">
              <img
                src={PhucBinh}
                alt="Đào Phúc Bình"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-4 group-hover:text-cyan-600 transition-colors duration-300">
              Đào Phúc Bình
            </h3>
            <p className="text-gray-600 bg-cyan-100 px-3 py-1 rounded-full inline-block mt-2">
              Frontend Developer
            </p>
          </div>
        </div>

        {/* Thông tin thêm về đội ngũ */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-cyan-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Đội Ngũ Của Chúng Tôi
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Với sự kết hợp giữa chuyên môn backend vững chắc và kỹ năng
              frontend sáng tạo, đội ngũ VoltX cam kết mang đến trải nghiệm
              người dùng tốt nhất cho cộng đồng yêu thích xe điện và công nghệ
              xanh.
            </p>
          </div>
        </div>
      </div>

      {/* Phần Call-to-Action */}
      <div className="w-full px-4 sm:px-6 lg:px-20 py-16 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sẵn Sàng Tham Gia Cộng Đồng VoltX?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Khám phá thế giới xe điện và pin cũ với sự đảm bảo về chất lượng và
            minh bạch trong giao dịch.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;

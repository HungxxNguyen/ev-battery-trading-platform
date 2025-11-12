import React from "react";
import { Link } from "react-router-dom";
import logo3 from "./../../assets/logo3.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-blue-900 text-gray-100 py-12 shadow-lg shadow-cyan-500/20">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Brand & About */}
          <div className="text-center md:text-left">
            <Link
              to="/"
              className="flex items-center gap-3 justify-center md:justify-start group mb-3"
            >
              <img
                src={logo3}
                alt="Logo VoltX Exchange"
                className="h-12 w-auto group-hover:scale-105 transition-transform duration-300 shadow-md shadow-cyan-500/50 animate-pulse"
              />
              <div className="text-2xl font-bold tracking-wide text-cyan-300 group-hover:text-cyan-100 transition-colors duration-300">
                VoltX Exchange
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-blue-200">
              VoltX Exchange kết nối người mua và người bán xe điện, pin đã qua
              sử dụng.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-xl font-semibold mb-3 text-cyan-300">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/listings"
                  className="relative text-blue-200 hover:text-cyan-300 transition-all duration-300 group"
                >
                  Xem danh mục
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link
                  to="/sell"
                  className="relative text-blue-200 hover:text-cyan-300 transition-all duration-300 group"
                >
                  Đăng bán xe/pin
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="relative text-blue-200 hover:text-cyan-300 transition-all duration-300 group"
                >
                  Giá & phí
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="relative text-blue-200 hover:text-cyan-300 transition-all duration-300 group"
                >
                  Hỗ trợ & Câu hỏi thường gặp
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Social */}
          <div className="text-center md:text-left">
            <h4 className="text-xl font-semibold mb-3 text-cyan-300">
              Liên hệ
            </h4>
            <p className="text-sm mb-1 text-blue-200">
              Email: support@voltx.exchange
            </p>
            <p className="text-sm mb-1 text-blue-200">
              Hotline: (+84) 123 456 789
            </p>
            <p className="text-sm text-blue-200">
              Địa chỉ: 123 Green Road, TP. Hồ Chí Minh, Việt Nam
            </p>

            <div className="flex justify-center md:justify-start items-center space-x-4 mt-4">
              <a
                href="#"
                aria-label="Trang Facebook"
                className="p-2 rounded-full bg-gray-800/80 hover:bg-cyan-600/80 transition-all duration-300 transform hover:scale-110 hover:shadow-glow-cyan"
              >
                <svg
                  className="w-5 h-5 text-cyan-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.91 8-4.94 8-9.95z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Trang Twitter"
                className="p-2 rounded-full bg-gray-800/80 hover:bg-cyan-600/80 transition-all duration-300 transform hover:scale-110 hover:shadow-glow-cyan"
              >
                <svg
                  className="w-5 h-5 text-cyan-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.38 8.59 8.59 0 0 1-2.72 1.04 4.28 4.28 0 0 0-7.3 3.9A12.14 12.14 0 0 1 3.16 4.6a4.28 4.28 0 0 0 1.33 5.7 4.25 4.25 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.19c-.47.13-.96.2-1.47.2-.36 0-.71-.03-1.05-.1a4.29 4.29 0 0 0 4 2.97A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2v-.56A8.7 8.7 0 0 0 22.46 6z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Trang LinkedIn"
                className="p-2 rounded-full bg-gray-800/80 hover:bg-cyan-600/80 transition-all duration-300 transform hover:scale-110 hover:shadow-glow-cyan"
              >
                <svg
                  className="w-5 h-5 text-cyan-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.98h4V24h-4V8.98zM8.5 8.98h3.84v2.05h.05c.54-1.02 1.86-2.1 3.83-2.1 4.09 0 4.84 2.69 4.84 6.18V24h-4v-7.4c0-1.76-.03-4.03-2.46-4.03-2.46 0-2.84 1.92-2.84 3.9V24h-4V8.98z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-8 pt-8 border-t border-cyan-500/30 text-center text-sm">
          <p className="text-blue-200">
            © {new Date().getFullYear()} VoltX Exchange. All rights reserved.
          </p>
          <div className="mt-2 space-x-4">
            <Link
              to="/terms"
              className="relative text-blue-200 hover:text-cyan-300 transition-all duration-300 group"
            >
              Điều khoản
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/privacy"
              className="relative text-blue-200 hover:text-cyan-300 transition-all duration-300 group"
            >
              Chính sách bảo mật
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/safety"
              className="relative text-blue-200 hover:text-cyan-300 transition-all duration-300 group"
            >
              An toàn giao dịch
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Futuristic Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .hover\\:shadow-glow-cyan {
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3);
        }
      `}</style>
    </footer>
  );
}

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBell, FiHeart, FiMessageCircle } from "react-icons/fi";
import { useFavorites } from "../../contexts/FavoritesContext";
import logo3 from "./../../assets/logo3.png";
import { AuthContext } from "../../contexts/AuthContext";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [keyword, setKeyword] = useState("");
  const { user, isAuthenticated, logout, loading } = useContext(AuthContext);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileRef = useRef(null);
  const sellDropdownRef = useRef(null);
  const shopDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const { favorites } = useFavorites();
  const favoritesCount = favorites.length;
  const chatUnread = 3;
  const notificationsUnread = 3;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatCount = (count) => (count > 9 ? "9+" : `${count}`);
  const iconButtonClass =
    "relative p-2.5 rounded-full bg-gray-800/70 hover:bg-gray-700 text-cyan-100 transition-all duration-300";
  const badgeClass =
    "absolute -top-1 -right-1 min-w-[18px] px-1 text-[10px] leading-4 font-semibold text-white bg-red-500 rounded-full text-center";

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };
  const closeAllDropdowns = () => setActiveDropdown(null);
  const closeMobileMenu = () => {
    setMobileOpen(false);
    closeAllDropdowns();
  };

  const handleClickOutside = useCallback(
    (event) => {
      const isOutside = (ref) =>
        ref.current && !ref.current.contains(event.target);

      if (activeDropdown) {
        if (activeDropdown === "sell" && isOutside(sellDropdownRef))
          closeAllDropdowns();
        if (activeDropdown === "shop" && isOutside(shopDropdownRef))
          closeAllDropdowns();
        if (activeDropdown === "user" && isOutside(userDropdownRef))
          closeAllDropdowns();
      }

      if (
        mobileOpen &&
        mobileRef.current &&
        !mobileRef.current.contains(event.target) &&
        !event.target.closest('button[aria-label="Toggle menu"]')
      ) {
        setMobileOpen(false);
        closeAllDropdowns();
      }
    },
    [activeDropdown, mobileOpen]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/search/${keyword}`);
    else navigate("/");
  };

  // Hiển thị loading hoặc không render gì khi đang loading
  if (loading) {
    return (
      <header className="bg-gradient-to-r from-gray-900 to-blue-900 text-white shadow-lg shadow-blue-500/30 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-cyan-300">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-gray-900 to-blue-900 text-white shadow-lg shadow-blue-500/30 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-4 group flex-shrink-0">
            <img
              src={logo3}
              alt="VoltX Exchange Logo"
              className="h-12 w-auto group-hover:scale-105 transition-transform duration-300 shadow-md shadow-cyan-500/50"
            />
            <div>
              <div className="text-xl font-bold tracking-wide text-cyan-300 group-hover:text-cyan-100 transition-colors duration-300">
                VoltX Exchange
              </div>
              <div className="text-xs text-blue-300">
                Second-hand EV & Battery
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center space-x-8 ml-12"
            ref={dropdownRef}
          >
            <Link
              to="/"
              className="text-sm font-medium hover:text-cyan-300 transition-all duration-300 py-2 relative group whitespace-nowrap"
            >
              Trang chủ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>

            {/* Sell */}
            <div className="relative" ref={sellDropdownRef}>
              <button
                onClick={() => toggleDropdown("sell")}
                className="text-sm font-medium hover:text-cyan-300 transition-all duration-300 flex items-center py-2 relative group whitespace-nowrap"
              >
                Bán
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
              </button>
              {activeDropdown === "sell" && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg shadow-cyan-500/20 py-2 border border-cyan-500/30 z-50">
                  <Link
                    to="/add-listing"
                    className="block px-4 py-2.5 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                    onClick={closeAllDropdowns}
                  >
                    Đăng tin
                  </Link>
                  <Link
                    to="/manage-listing"
                    className="block px-4 py-2.5 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                    onClick={closeAllDropdowns}
                  >
                    Quản lý tin đăng
                  </Link>
                </div>
              )}
            </div>

            {/* Shop */}
            <div className="relative" ref={shopDropdownRef}>
              <button
                onClick={() => toggleDropdown("shop")}
                className="text-sm font-medium hover:text-cyan-300 transition-all duration-300 flex items-center py-2 relative group whitespace-nowrap"
              >
                Sản phẩm
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
              </button>
              {activeDropdown === "shop" && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg shadow-cyan-500/20 py-2 border border-cyan-500/30 z-50">
                  <Link
                    to="/listings"
                    className="block px-4 py-2.5 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                    onClick={closeAllDropdowns}
                  >
                    Tất cả sản phẩm
                  </Link>
                  <Link
                    to="/category/car"
                    className="block px-4 py-2.5 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                    onClick={closeAllDropdowns}
                  >
                    Ô tô điện
                  </Link>
                  <Link
                    to="/category/bike"
                    className="block px-4 py-2.5 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                    onClick={closeAllDropdowns}
                  >
                    Xe máy điện
                  </Link>
                  <Link
                    to="/category/battery"
                    className="block px-4 py-2.5 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                    onClick={closeAllDropdowns}
                  >
                    Pin điện
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/about"
              className="text-sm font-medium hover:text-cyan-300 transition-all duration-300 py-2 relative group whitespace-nowrap"
            >
              Giới thiệu
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center mx-8 flex-1 max-w-md"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm xe điện, pin..."
                className="pl-10 pr-4 py-2.5 w-full bg-gray-800/50 border border-cyan-500/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-blue-300 transition-all duration-300"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-3 text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Right actions (no admin) */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Link to="/chat" className={iconButtonClass} aria-label="Mo chat">
                <FiMessageCircle className="w-5 h-5" />
                {chatUnread > 0 && (
                  <span className={badgeClass}>{formatCount(chatUnread)}</span>
                )}
              </Link>
              <Link
                to="/favorites"
                className={`${iconButtonClass} ${
                  favoritesCount > 0 ? "text-red-200" : ""
                }`}
                aria-label="Tin yeu thich"
              >
                <FiHeart
                  className={`w-5 h-5 ${
                    favoritesCount > 0 ? "text-red-400" : ""
                  }`}
                />
                {favoritesCount > 0 && (
                  <span className={badgeClass}>
                    {formatCount(favoritesCount)}
                  </span>
                )}
              </Link>
              <Link
                to="/notifications"
                className={iconButtonClass}
                aria-label="Thong bao"
              >
                <FiBell className="w-5 h-5" />
                {notificationsUnread > 0 && (
                  <span className={badgeClass}>
                    {formatCount(notificationsUnread)}
                  </span>
                )}
              </Link>
            </div>

            <div className="h-8 w-px bg-cyan-500/20" />

            {/* User dropdown - hiển thị cho cả đã đăng nhập và chưa đăng nhập */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => toggleDropdown("user")}
                className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-lg transition-all duration-300"
              >
                {isAuthenticated && user ? (
                  <>
                    {user.thumbnail ? (
                      <img
                        src={user.thumbnail}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full object-cover border border-cyan-500/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        {user.userName?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium">{user.userName}</span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-600 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Tài khoản</span>
                  </>
                )}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {activeDropdown === "user" && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg shadow-cyan-500/20 py-2 border border-cyan-500/30 z-50">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-4 py-2.5 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                        onClick={closeAllDropdowns}
                      >
                        Hồ sơ
                      </Link>
                      <Link
                        to="/transactions"
                        className="block px-4 py-2.5 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                        onClick={closeAllDropdowns}
                      >
                        Lịch sử giao dịch
                      </Link>
                      <hr className="my-2 border-cyan-500/20" />
                      <button
                        onClick={() => {
                          handleLogout();
                          closeAllDropdowns();
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2.5 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                        onClick={closeAllDropdowns}
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2.5 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                        onClick={closeAllDropdowns}
                      >
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tablet compact icons + burger */}
          <div className="hidden md:flex lg:hidden items-center gap-4">
            <div className="flex items-center gap-2">
              <Link
                to="/chat"
                className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-700 text-cyan-100"
              >
                <FiMessageCircle className="w-5 h-5" />
              </Link>
              <Link
                to="/favorites"
                className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-700 text-cyan-100"
              >
                <FiHeart className="w-5 h-5" />
              </Link>
              <Link
                to="/notifications"
                className="p-2 rounded-full bg-gray-800/70 hover:bg-gray-700 text-cyan-100"
              >
                <FiBell className="w-5 h-5" />
              </Link>
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile burger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Panel */}
      {mobileOpen && (
        <div
          ref={mobileRef}
          className="md:hidden bg-gradient-to-b from-gray-900 to-blue-900 border-t border-cyan-500/30"
        >
          <div className="px-4 pt-4 pb-4 space-y-3">
            <Link
              to="/"
              className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/chat"
              className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2"
              onClick={closeMobileMenu}
            >
              Chat
            </Link>
            <Link
              to="/favorites"
              className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2"
              onClick={closeMobileMenu}
            >
              Tin yeu thich
            </Link>
            <Link
              to="/notifications"
              className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2"
              onClick={closeMobileMenu}
            >
              Thong bao
            </Link>
            <Link
              to="/manage-listing"
              className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2"
              onClick={closeMobileMenu}
            >
              Quản lý tin đăng
            </Link>
            <Link
              to="/listings"
              className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2"
              onClick={closeMobileMenu}
            >
              Mua/Bán
            </Link>
            <Link
              to="/about"
              className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2"
              onClick={closeMobileMenu}
            >
              Giới thiệu
            </Link>

            <div className="pt-2 space-y-2 border-t border-cyan-500/30">
              {user ? (
                <>
                  <div className="text-sm text-cyan-300 py-2">
                    Xin chào, <strong>{user.name}</strong>
                  </div>
                  <Link
                    to="/profile"
                    className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2"
                    onClick={closeMobileMenu}
                  >
                    Hồ sơ
                  </Link>
                  <Link
                    to="/transactions"
                    className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2"
                    onClick={closeMobileMenu}
                  >
                    Lịch sử giao dịch
                  </Link>
                  <button
                    onClick={() => {
                      onLogout();
                      closeMobileMenu();
                    }}
                    className="w-full text-left text-sm hover:text-cyan-300 transition-all duration-200 py-2"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2"
                    onClick={closeMobileMenu}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2"
                    onClick={closeMobileMenu}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm xe điện, pin..."
                  className="w-full pl-10 pr-3 py-2 bg-gray-800/50 border border-cyan-500/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-blue-300 transition-all duration-300"
                />
                <svg
                  className="w-5 h-5 absolute left-3 top-2.5 text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                type="submit"
                className="w-full mt-2 px-3 py-2 bg-cyan-600 rounded-md text-sm hover:bg-cyan-500 transition-all duration-300"
              >
                Tìm kiếm
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo3 from './../../assets/logo3.png';

export default function Header({ user = null, onLogout = () => {} }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [keyword, setKeyword] = useState('');

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const mobileRef = useRef(null);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    closeAllDropdowns();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeAllDropdowns();
      }
      if (mobileOpen && mobileRef.current && !mobileRef.current.contains(event.target)) {
        closeMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 to-blue-900 text-white shadow-lg shadow-blue-500/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand - Sử dụng logo3.png */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo3}
              alt="VoltX Exchange Logo"
              className="h-10 w-auto group-hover:scale-105 transition-transform duration-300 shadow-md shadow-cyan-500/50"
            />
            <div>
              <div className="text-lg font-bold tracking-wide text-cyan-300 group-hover:text-cyan-100 transition-colors duration-300">VoltX Exchange</div>
              <div className="text-xs text-blue-300">Second-hand EV & Battery</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" ref={dropdownRef}>
            <Link to="/" className="text-sm font-medium hover:text-cyan-300 transition-all duration-300 py-2 relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {/* Sell Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('sell')}
                className="text-sm font-medium hover:text-cyan-300 transition-all duration-300 flex items-center py-2 relative group"
              >
                Sell
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </button>
              {activeDropdown === 'sell' && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg shadow-cyan-500/20 py-2 border border-cyan-500/30 z-50">
                  <Link to="/sell" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Đăng tin</Link>
                  <Link to="/manage-sales" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Quản lý tin đăng</Link>
                </div>
              )}
            </div>
            
            {/* Shop Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('shop')}
                className="text-sm font-medium hover:text-cyan-300 transition-all duration-300 flex items-center py-2 relative group"
              >
                Shop
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </button>
              {activeDropdown === 'shop' && (
                <div className="absolute left-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg shadow-cyan-500/20 py-2 border border-cyan-500/30 z-50">
                  <Link to="/listings" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Tất cả sản phẩm</Link>
                  <Link to="/categories/cars" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Xe điện</Link>
                  <Link to="/categories/batteries" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Pin</Link>
                  <Link to="/categories/accessories" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Phụ kiện</Link>
                </div>
              )}
            </div>
            
            <Link to="/about" className="text-sm font-medium hover:text-cyan-300 transition-all duration-300 py-2 relative group">
              Giới thiệu
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {user?.role === 'admin' && (
              <Link to="/reports" className="text-sm font-medium hover:text-cyan-300 transition-all duration-300 py-2 relative group">
                Thống kê
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
          </nav>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center mx-4 flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm xe điện, pin..."
                className="pl-10 pr-3 py-2 w-full bg-gray-800/50 border border-cyan-500/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-blue-300 transition-all duration-300"
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Right Actions: User & Admin */}
          <div className="hidden md:flex items-center gap-4" ref={dropdownRef}>
            {user ? (
              <>
                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('user')}
                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === 'user' && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg shadow-cyan-500/20 py-2 border border-cyan-500/30 z-50">
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Hồ sơ</Link>
                      <Link to="/transactions" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Lịch sử giao dịch</Link>
                      <button
                        onClick={() => { onLogout(); closeAllDropdowns(); }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>

                {/* Admin Dropdown if applicable */}
                {user.role === 'admin' && (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('admin')}
                      className="bg-cyan-700 hover:bg-cyan-600 px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center"
                    >
                      Admin
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {activeDropdown === 'admin' && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg shadow-cyan-500/20 py-2 border border-cyan-500/30 z-50">
                        <Link to="/admin/users" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Quản lý người dùng</Link>
                        <Link to="/admin/listings" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Quản lý tin đăng</Link>
                        <Link to="/admin/transactions" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Quản lý giao dịch</Link>
                        <Link to="/admin/reports" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Báo cáo & Thống kê</Link>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Guest Dropdown
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('guest')}
                  className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm">Tài khoản</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'guest' && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg shadow-cyan-500/20 py-2 border border-cyan-500/30 z-50">
                    <Link to="/login" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Đăng nhập</Link>
                    <Link to="/register" className="block px-4 py-2 text-sm hover:bg-blue-900/50 hover:text-cyan-200 transition-all duration-200" onClick={closeAllDropdowns}>Đăng ký</Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Panel */}
      {mobileOpen && (
        <div ref={mobileRef} className="md:hidden bg-gradient-to-b from-gray-900 to-blue-900 border-t border-cyan-500/30">
          <div className="px-4 pt-4 pb-4 space-y-3">
            <Link to="/" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2" onClick={closeMobileMenu}>Home</Link>
            <Link to="/sell" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2" onClick={closeMobileMenu}>Đăng tin</Link>
            <Link to="/listings" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2" onClick={closeMobileMenu}>Mua/Bán</Link>
            <Link to="/about" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2" onClick={closeMobileMenu}>Giới thiệu</Link>
            
            {user?.role === 'admin' && (
              <Link to="/reports" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2" onClick={closeMobileMenu}>Thống kê</Link>
            )}

            <div className="pt-2 space-y-2 border-t border-cyan-500/30">
              {user ? (
                <>
                  <div className="text-sm text-cyan-300 py-2">Xin chào, <strong>{user.name}</strong></div>
                  <Link to="/profile" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2" onClick={closeMobileMenu}>Hồ sơ</Link>
                  <Link to="/transactions" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2" onClick={closeMobileMenu}>Lịch sử giao dịch</Link>
                  {user.role === 'admin' && (
                    <>
                      <div className="text-sm text-cyan-300 pt-4 pb-2">Quản trị</div>
                      <Link to="/admin/users" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2 pl-4" onClick={closeMobileMenu}>Quản lý người dùng</Link>
                      <Link to="/admin/listings" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2 pl-4" onClick={closeMobileMenu}>Quản lý tin đăng</Link>
                      <Link to="/admin/transactions" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2 pl-4" onClick={closeMobileMenu}>Quản lý giao dịch</Link>
                    </>
                  )}
                  <button onClick={() => { onLogout(); closeMobileMenu(); }} className="w-full text-left text-sm hover:text-cyan-300 transition-all duration-200 py-2">Đăng xuất</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2" onClick={closeMobileMenu}>Đăng nhập</Link>
                  <Link to="/register" className="block text-sm hover:text-cyan-300 transition-all duration-200 py-2" onClick={closeMobileMenu}>Đăng ký</Link>
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
                <svg className="w-5 h-5 absolute left-3 top-2.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button type="submit" className="w-full mt-2 px-3 py-2 bg-cyan-600 rounded-md text-sm hover:bg-cyan-500 transition-all duration-300">
                Tìm kiếm
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
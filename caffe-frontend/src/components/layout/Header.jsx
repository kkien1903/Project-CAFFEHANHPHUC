import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import api from '../../api';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth(); // Lấy trạng thái và hàm từ context
  const navigate = useNavigate();

  // State cho dropdown
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [cartCount, setCartCount] = useState(0); // State lưu số lượng trong giỏ hàng
  const [searchQuery, setSearchQuery] = useState('');

  // Lấy dữ liệu menu khi component mount
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);
        setCategories(catRes.data?.data || catRes.data || []);
        setProducts(prodRes.data?.data || prodRes.data || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Header:", error);
      }
    };
    fetchMenuData();
  }, []);

  // Lấy tổng số lượng sản phẩm trong giỏ hàng
  useEffect(() => {
    const fetchCartCount = () => {
      if (isAuthenticated) {
        api.get('/carts').then(res => {
          const cart = res.data;
          if (cart && cart.items) {
            const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(count);
          } else {
            setCartCount(0);
          }
        }).catch(err => console.error("Lỗi lấy giỏ hàng Header:", err));
      } else {
        setCartCount(0); // Reset số lượng nếu chưa đăng nhập
      }
    };
    fetchCartCount();
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => window.removeEventListener('cartUpdated', fetchCartCount);
  }, [isAuthenticated]);

  // Hàm xử lý màu sắc khi link đang được active
  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? '#006a31' : '#333',
    textDecoration: 'none',
    transition: 'color 0.3s'
  });

  return (
    <header style={{ backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' }}>
      {/* Phần Top: Logo, Tìm kiếm, User/Cart Actions */}
      <div style={{ padding: '15px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ display: 'block', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#006a31', textTransform: 'uppercase', letterSpacing: '1px' }}>Cà Phê Hạnh Phúc</span>
        </Link>

        <div style={{ flex: 1, margin: '0 50px', position: 'relative', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f9f9f9', borderRadius: '25px', border: '1px solid #ddd', padding: '5px 15px' }}>
            <input 
              type="text" 
              placeholder="Bạn muốn mua gì..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/products?title=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery(''); // Xóa nội dung thanh tìm kiếm sau khi gửi
                }
              }}
              style={{ width: '100%', padding: '5px 5px', border: 'none', backgroundColor: 'transparent', outline: 'none', color: '#000' }}
            />
            <span style={{ cursor: 'pointer', color: '#888' }} onClick={() => { if(searchQuery.trim()) { navigate(`/products?title=${encodeURIComponent(searchQuery.trim())}`); setSearchQuery(''); } }}>🔍</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <span style={{ fontWeight: 'bold', color: '#006a31', fontSize: '14px' }}>👋 {user?.username}</span>
                <NavLink to="/orders" style={{ textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>Đơn hàng</NavLink>
                <NavLink to="/reservations" style={{ textDecoration: 'none', color: '#ffb703', fontSize: '14px', fontWeight: 'bold' }}>Giữ chỗ</NavLink>
                <button onClick={logout} style={{ border: 'none', background: 'none', color: '#d62828', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Đăng xuất</button>
              </>
            ) : (
              <>
                <NavLink to="/login" style={{ textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>Đăng nhập</NavLink>
                <NavLink to="/register" style={{ textDecoration: 'none', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>Đăng ký</NavLink>
              </>
            )}

            {isAuthenticated && (
              <NavLink title="Giỏ hàng" to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#006a31' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                {cartCount > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-12px', backgroundColor: '#e63946', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '12px' }}>
                    {cartCount}
                  </span>
                )}
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* Phần Điều hướng: Trang chủ, Menu... */}
      <nav style={{ display: 'flex', justifyContent: 'center', gap: '50px', padding: '15px 0', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px', backgroundColor: '#fdfdfd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <style>
          {`
            .dropdown-item {
              display: block;
              padding: 12px 20px;
              color: #333;
              text-decoration: none;
              font-size: 14px;
              border-bottom: 1px solid #eee;
              text-transform: none;
              font-weight: normal;
              transition: all 0.2s;
            }
            .dropdown-item:hover {
              background-color: #f0f7f3;
              color: #006a31 !important;
              padding-left: 25px;
            }
          `}
        </style>
        <NavLink to="/" style={navLinkStyle}>Trang chủ</NavLink>
        
        {/* Dropdown Menu Sản phẩm */}
        <div 
          style={{ position: 'relative' }}
          onMouseEnter={() => setShowProducts(true)}
          onMouseLeave={() => setShowProducts(false)}
        >
          <NavLink to="/products" style={navLinkStyle}>Menu</NavLink>
          {showProducts && products.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', paddingTop: '15px', zIndex: 1000, width: '220px' }}>
              <div style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                {products.slice(0, 5).map(p => (
                  <Link key={p._id} to={`/products/${p._id}`} className="dropdown-item">{p.title}</Link>
                ))}
                <Link to="/products" className="dropdown-item" style={{ fontWeight: 'bold', textAlign: 'center', color: '#006a31' }}>Xem tất cả menu &gt;</Link>
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Menu Danh mục */}
        <div 
          style={{ position: 'relative' }}
          onMouseEnter={() => setShowCategories(true)}
          onMouseLeave={() => setShowCategories(false)}
        >
          <span style={{ ...navLinkStyle({ isActive: false }), cursor: 'pointer' }}>Danh mục</span>
          {showCategories && categories.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', paddingTop: '15px', zIndex: 1000, width: '220px' }}>
              <div style={{ backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                {categories.map(c => (
                  <Link key={c._id} to={`/products?category=${c._id}`} className="dropdown-item">{c.name}</Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <NavLink to="/promotion" style={navLinkStyle}>Khám Phá</NavLink>
      </nav>
    </header>
  );
};

export default Header;

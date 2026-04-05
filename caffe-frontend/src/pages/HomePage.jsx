import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0); // State lưu số lượng giỏ hàng
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products?limit=6');
        const productsData = response.data?.data || response.data || [];
        setFeaturedProducts(productsData);
      } catch (error) {
        console.error("Không thể tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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
        }).catch(err => console.error(err));
      }
    };
    fetchCartCount();
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => window.removeEventListener('cartUpdated', fetchCartCount);
  }, [isAuthenticated]);

  return (
    <div className="homepage" style={{ fontFamily: 'Arial, sans-serif', color: '#333' }}>
      
      {/* Hero Banner - Giao diện mới */}
      <section className="hero-section" style={{ 
        height: 'calc(100vh - 82px)', 
        backgroundImage: 'url("https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2000&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        textAlign: 'center'
      }}>
        {/* Lớp phủ đen mờ để làm nổi bật chữ */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)' }}></div>
        
        <div style={{ zIndex: 2, padding: '0 20px', color: '#fff' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '15px', textShadow: '2px 2px 8px rgba(0,0,0,0.6)', letterSpacing: '2px' }}>CÀ PHÊ HẠNH PHÚC</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 30px', textShadow: '1px 1px 5px rgba(0,0,0,0.5)', lineHeight: '1.6' }}>Thưởng thức hương vị đậm đà, đánh thức mọi giác quan và mang lại niềm vui cho ngày mới của bạn.</p>
          <Link to="/products" style={{ display: 'inline-block', padding: '14px 35px', backgroundColor: '#ffb703', color: '#023047', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(255, 183, 3, 0.4)', transition: 'transform 0.3s' }}>Khám Phá Menu</Link>
        </div>
      </section>

      {/* Featured Products - Mẫu thẻ xịn xò */}
      <section className="featured-products-section" style={{ padding: '20px 5% 60px', backgroundColor: '#fdfdfd' }}>
        <h2 style={{ 
          textAlign: 'center', 
          color: '#006a31', 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '40px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          ✨ SẢN PHẨM NỔI BẬT ✨
        </h2>

        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
            gap: '30px',
            width: '100%',
            padding: '0 10px'
          }}>
            {featuredProducts.map((product) => (
              <Link to={`/products/${product._id}`} key={product._id} className="product-card" style={{ textDecoration: 'none', color: 'inherit', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s' }}>
                  <img
                    src={product.images?.length > 0 ? `${BACKEND_URL}/uploads/${product.images[0]}` : "https://via.placeholder.com/200"}
                    alt={product.title}
                    style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '10px', color: '#333' }}>{product.title}</h3>
                    <p style={{ fontWeight: 'bold', color: '#e63946', fontSize: '1.2rem', marginBottom: '15px' }}>
                      {product.price?.toLocaleString()} đ
                    </p>
                    <span style={{ display: 'inline-block', backgroundColor: '#e6f4ea', color: '#006a31', padding: '10px 0', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', border: '1px solid #006a31' }}>Xem chi tiết</span>
                  </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Nút Giỏ hàng nổi (Floating) */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
          <Link to="/cart" title="Đến giỏ hàng" style={{ position: 'relative', width: '60px', height: '60px', backgroundColor: '#e63946', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(230, 57, 70, 0.4)', textDecoration: 'none', fontSize: '1.8rem', transition: 'transform 0.3s' }}>
            🛒
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ffb703', color: '#023047', fontSize: '14px', fontWeight: 'bold', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                {cartCount}
              </span>
            )}
          </Link>
      </div>
    </div>
  );
};

export default HomePage;
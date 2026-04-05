import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products');
        // Lấy 4 sản phẩm đầu tiên để làm sản phẩm nổi bật
        setFeaturedProducts(response.data.data.slice(0, 4));
      } catch (error) {
        console.error("Không thể tải sản phẩm nổi bật:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Hương Vị Của Hạnh Phúc</h1>
          <p className="hero-subtitle">Mỗi tách cà phê là một câu chuyện, mỗi khoảnh khắc là một niềm vui. Chào mừng bạn đến với ngôi nhà của chúng tôi.</p>
          <Link to="/products" className="button hero-cta">Khám Phá Thực Đơn</Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products-section">
        <h2 className="section-title">Sản Phẩm Nổi Bật</h2>
        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : featuredProducts.length > 0 ? (
          <div className="product-list">
            {featuredProducts.map((product) => (
              <Link to={`/products/${product._id}`} key={product._id} className="product-card">
                <img
                  src={
                    product.images && product.images.length > 0
                      ? `${BACKEND_URL}/uploads/${product.images[0]}`
                      : "https://via.placeholder.com/150"
                  }
                  alt={product.title}
                  className="product-image"
                />
                <div className="product-info">
                  <h3>{product.title}</h3>
                  <p>Giá: {product.price.toLocaleString()} VNĐ</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
            <p style={{ textAlign: 'center' }}>Chưa có sản phẩm nào để hiển thị.</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;
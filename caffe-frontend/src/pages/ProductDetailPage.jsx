import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [notification, setNotification] = useState('');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        const productData = response.data.data;
        setProduct(productData);
        // Tự động chọn size đầu tiên nếu có
        if (productData.sizeOptions && productData.sizeOptions.length > 0) {
          setSelectedSize(productData.sizeOptions[0]);
        }
      } catch (err) {
        setError('Không thể tải thông tin sản phẩm.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login'); // Chuyển hướng đến trang đăng nhập nếu chưa xác thực
      return;
    }

    // Kiểm tra nếu sản phẩm yêu cầu chọn size
    if (product.sizeOptions && product.sizeOptions.length > 0 && !selectedSize) {
      setNotification('Vui lòng chọn size.');
      return;
    }

    try {
      // Giả định API backend có endpoint /carts/add để thêm sản phẩm
      await api.post('/carts/add', {
        productId: product._id,
        quantity: quantity,
        size: selectedSize,
      });

      setNotification(`Đã thêm ${quantity} sản phẩm "${product.title}" vào giỏ hàng!`);
      setTimeout(() => setNotification(''), 3000); // Xóa thông báo sau 3 giây
    } catch (err) {
      setNotification('Thêm vào giỏ hàng thất bại. Vui lòng thử lại.');
      console.error('Lỗi thêm vào giỏ hàng:', err);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Không tìm thấy sản phẩm.</p>;

  return (
    <div className="product-detail-container">
      <div className="product-detail">
        <div className="product-detail-image">
          <img
            src={
              product.images && product.images.length > 0
                ? `${BACKEND_URL}/uploads/${product.images[0]}`
                : "https://via.placeholder.com/300"
            }
            alt={product.title}
          />
        </div>
        <div className="product-detail-info">
          <h1>{product.title}</h1>
          <p className="price">{product.price.toLocaleString()} VNĐ</p>
          <p className="description">{product.description}</p>

          {/* Lựa chọn Size */}
          {product.sizeOptions && product.sizeOptions.length > 0 && (
            <div className="size-selector">
              <p className="selector-label">Chọn size:</p>
              <div className="size-options">
                {product.sizeOptions.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lựa chọn Số lượng */}
          <div className="quantity-selector">
            <p className="selector-label">Số lượng:</p>
            <div className="quantity-controls">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <input type="text" value={quantity} readOnly />
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
          </div>

          <button className="add-to-cart-btn" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>

          {notification && <p className="cart-notification">{notification}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
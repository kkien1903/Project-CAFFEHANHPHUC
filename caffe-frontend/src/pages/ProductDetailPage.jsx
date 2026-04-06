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
  const [stock, setStock] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Hàm tính giá theo size linh hoạt
  const getPriceBySize = (basePrice, size, sizeOptions = []) => {
    let price = basePrice || 0;
    const hasS = sizeOptions?.includes('S');
    const hasM = sizeOptions?.includes('M');

    if (hasS) {
      if (size === 'M') price += 5000;
      if (size === 'L') price += 7000;
    } else if (hasM) {
      if (size === 'L') price += 7000;
    }
    return price;
  };

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchProductAndInventory = async () => {
      try {
        setLoading(true);
        // Tải song song thông tin sản phẩm và tồn kho
        const [productRes, inventoryRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/inventories/${id}`).catch(() => ({ data: { stock: 0 } })) // Nếu lỗi, mặc định tồn kho là 0
        ]);

        const productData = productRes.data?.data || productRes.data;
        setProduct(productData);
        setStock(inventoryRes.data.stock ?? 0);

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

    const fetchReviews = async () => {
      try {
        const response = await api.get(`/reviews?product=${id}`);
        setReviews(response.data || []);
      } catch (err) {
        console.error('Lỗi tải đánh giá:', err);
      }
    };

    fetchProductAndInventory();
    fetchReviews();
  }, [id]);

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;

    if (newQuantity < 1) {
      return; // Không cho số lượng nhỏ hơn 1
    }

    if (stock !== null && newQuantity > stock) {
      setNotification(`Chỉ còn lại ${stock} sản phẩm trong kho.`);
      setTimeout(() => setNotification(''), 3000);
      return; // Không cho vượt quá tồn kho
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login'); // Chuyển hướng đến trang đăng nhập nếu chưa xác thực
      return;
    }

    if (quantity > stock) {
      setNotification(`Số lượng bạn chọn (${quantity}) vượt quá số lượng tồn kho (${stock}).`);
      return;
    }

    // Kiểm tra nếu sản phẩm yêu cầu chọn size
    if (product.sizeOptions && product.sizeOptions.length > 0 && !selectedSize) {
      setNotification('Vui lòng chọn size.');
      return;
    }

    try {
      // Gọi đúng API endpoint /carts/add-items của backend
      await api.post('/carts/add-items', {
        product: product._id, // Backend nhận key là 'product'
        quantity: quantity,
        size: selectedSize,
      });

      setNotification(`Đã thêm ${quantity} sản phẩm "${product.title}" vào giỏ hàng!`);
      setTimeout(() => setNotification(''), 3000); // Xóa thông báo sau 3 giây
      window.dispatchEvent(new Event('cartUpdated')); // Báo hiệu thay đổi giỏ hàng
    } catch (err) {
      setNotification(err.response?.data?.message || 'Thêm vào giỏ hàng thất bại. Vui lòng thử lại.');
      console.error('Lỗi thêm vào giỏ hàng:', err);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để gửi đánh giá!');
      navigate('/login');
      return;
    }
    if (!comment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }
    try {
      setSubmittingReview(true);
      await api.post('/reviews', { product: id, rating, comment });
      setComment('');
      setRating(5);
      // Cập nhật lại danh sách đánh giá ngay lập tức
      const res = await api.get(`/reviews?product=${id}`);
      setReviews(res.data || []);
      alert('Cảm ơn bạn đã đánh giá sản phẩm!');
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Không tìm thấy sản phẩm.</p>;

  return (
    <div className="product-detail-container" style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="product-detail" style={{ display: 'flex', flexWrap: 'wrap', gap: '50px', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 25px rgba(0,0,0,0.06)' }}>
        
        {/* Cột Hình ảnh */}
        <div className="product-detail-image" style={{ flex: '1 1 400px' }}>
          <img
            src={
              product.images && product.images.length > 0
                ? `${BACKEND_URL}/uploads/${product.images[0]}`
                : "https://via.placeholder.com/500"
            }
            alt={product.title}
            style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
          />
        </div>

        {/* Cột Thông tin */}
        <div className="product-detail-info" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#006a31', marginBottom: '15px', marginTop: 0 }}>{product.title}</h1>
          <p className="price" style={{ fontSize: '2rem', color: '#e63946', fontWeight: 'bold', margin: '0 0 20px 0' }}>{getPriceBySize(product.price, selectedSize, product.sizeOptions).toLocaleString()} VNĐ</p>
          
          <p className="description" style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.7', marginBottom: '30px' }}>{product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>

          {/* Lựa chọn Size */}
          {product.sizeOptions && product.sizeOptions.length > 0 && (
            <div className="size-selector" style={{ marginBottom: '25px' }}>
              <p className="selector-label" style={{ fontWeight: 'bold', marginBottom: '12px', color: '#333', fontSize: '1.1rem' }}>Chọn size:</p>
              <div className="size-options" style={{ display: 'flex', gap: '15px' }}>
                {product.sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '10px 25px',
                      borderRadius: '8px',
                      border: selectedSize === size ? '2px solid #006a31' : '1px solid #ddd',
                      background: selectedSize === size ? '#e6f4ea' : '#fff',
                      color: selectedSize === size ? '#006a31' : '#555',
                      fontWeight: selectedSize === size ? 'bold' : 'normal',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '1rem'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lựa chọn Số lượng (chỉ hiển thị nếu còn hàng) */}
          {stock > 0 && (
            <div className="quantity-selector" style={{ marginBottom: '35px' }}>
              <p className="selector-label" style={{ 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                color: '#333', 
                fontSize: '1.1rem' 
              }}>Số lượng:</p>
              
              <div className="quantity-controls" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0', // Để sát nhau tạo thành một khối
                border: '1px solid #ddd',
                borderRadius: '30px',
                width: 'fit-content',
                overflow: 'hidden',
                background: '#fff'
              }}>
                <button 
                  onClick={() => handleQuantityChange(-1)} 
                  style={{ 
                    width: '45px', 
                    height: '45px', 
                    border: 'none',
                    background: '#f8f9fa', 
                    fontSize: '1.5rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    transition: 'all 0.2s',
                    color: '#555',
                    borderRight: '1px solid #ddd'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#e9ecef'}
                  onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
                >
                  −
                </button>
                
                <input 
                  type="text" 
                  value={quantity} 
                  readOnly 
                  style={{ 
                    width: '50px', 
                    textAlign: 'center', 
                    border: 'none', 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    color: '#006a31', 
                    background: 'transparent',
                    outline: 'none'
                  }} 
                />
                
                <button 
                  onClick={() => handleQuantityChange(1)} 
                  style={{ 
                    width: '45px', 
                    height: '45px', 
                    border: 'none',
                    background: '#f8f9fa', 
                    fontSize: '1.5rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    transition: 'all 0.2s',
                    color: '#555',
                    borderLeft: '1px solid #ddd'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#e9ecef'}
                  onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={stock === 0} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: stock === 0 ? '#ccc' : '#e63946', color: '#fff', border: 'none', padding: '16px 35px', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', cursor: stock === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: stock === 0 ? 'none' : '0 4px 15px rgba(230, 57, 70, 0.3)', width: '100%', maxWidth: '350px' }}>
            {stock > 0 ? (
              <><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
              Thêm vào giỏ hàng</>
            ) : 'Hết hàng'}
          </button>

          {notification && <p className="cart-notification" style={{ marginTop: '20px', color: '#006a31', fontWeight: 'bold', background: '#e6f4ea', padding: '12px 20px', borderRadius: '8px', display: 'inline-block' }}>✅ {notification}</p>}
        </div>
      </div>

      {/* Phần Đánh Giá Sản Phẩm */}
      <div style={{ marginTop: '50px', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 25px rgba(0,0,0,0.06)' }}>
        <h3 style={{ color: '#006a31', marginBottom: '30px', fontSize: '1.8rem', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>Đánh giá sản phẩm ({reviews.length})</h3>
        
        {/* Form gửi đánh giá */}
        <div style={{ marginBottom: '40px', padding: '25px', background: '#f0f7f3', borderRadius: '12px' }}>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>Gửi đánh giá của bạn</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                        key={star} 
                        onClick={() => setRating(star)} 
                        style={{ cursor: 'pointer', fontSize: '2.5rem', color: star <= rating ? '#ffb703' : '#ddd', transition: 'color 0.2s', lineHeight: 1 }}
                    >
                        ★
                    </span>
                ))}
            </div>
            <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về hương vị sản phẩm này..."
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px', marginBottom: '15px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <button onClick={handleReviewSubmit} disabled={submittingReview} style={{ background: '#006a31', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: submittingReview ? 'not-allowed' : 'pointer', opacity: submittingReview ? 0.7 : 1, transition: 'background 0.2s' }}>
                {submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
        </div>

        {/* Danh sách đánh giá */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.length > 0 ? reviews.map((review) => (
                <div key={review._id} style={{ borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#ffb703', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>{review.user?.username?.charAt(0).toUpperCase() || 'U'}</div>
                        <div>
                            <strong style={{ display: 'block', color: '#333', fontSize: '1.1rem' }}>{review.user?.username || 'Khách hàng'}</strong>
                            <div style={{ color: '#ffb703', fontSize: '1.1rem', letterSpacing: '2px' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', color: '#888', fontSize: '0.9rem' }}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p style={{ color: '#555', lineHeight: '1.6', margin: 0, paddingLeft: '60px' }}>{review.comment}</p>
                </div>
            )) : (
                <p style={{ color: '#777', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm nhé!</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
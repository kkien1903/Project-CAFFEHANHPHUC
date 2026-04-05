import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get('/carts');
        setCart(response.data);
      } catch (error) {
        console.error('Lỗi tải giỏ hàng:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, []);

  // Hàm cập nhật số lượng
  const updateQuantity = async (item, change) => {
    try {
      const payload = {
        product: item.product._id,
        quantity: 1, // Mỗi lần tăng/giảm 1 đơn vị
        size: item.size
      };
      
      let response;
      if (change > 0) {
        response = await api.post('/carts/add-items', payload);
      } else {
        response = await api.post('/carts/decrease-items', payload);
      }
      setCart(response.data); // Cập nhật lại giỏ hàng sau khi thành công
      window.dispatchEvent(new Event('cartUpdated')); // Báo hiệu thay đổi giỏ hàng
    } catch (error) {
      console.error('Lỗi cập nhật số lượng:', error);
    }
  };

  // Hàm xóa sản phẩm khỏi giỏ
  const removeItem = async (item) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    try {
      const response = await api.post('/carts/remove-item', { product: item.product._id, size: item.size });
      setCart(response.data);
      window.dispatchEvent(new Event('cartUpdated')); // Báo hiệu thay đổi giỏ hàng
    } catch (error) {
      console.error('Lỗi xóa sản phẩm:', error);
    }
  };

  // Hàm xử lý giữ chỗ
  const handleReserve = async () => {
    try {
      const payload = {
        items: cart.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }))
      };
      await api.post('/reservations', payload);
      await api.post('/carts/clear'); // Làm rỗng giỏ hàng
      window.dispatchEvent(new Event('cartUpdated'));
      alert('Đã giữ chỗ thành công! Hàng của bạn sẽ được giữ trong 30 phút.');
      navigate('/reservations');
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi giữ chỗ.');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="cart-page container" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#d62828', marginBottom: '30px' }}>🛒 Giỏ hàng của bạn</h2>
      {cart && cart.items && cart.items.length > 0 ? (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <ul className="cart-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {cart.items.map((item, index) => (
              <li key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: index !== cart.items.length - 1 ? '1px solid #eee' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img 
                    src={item.product?.images && item.product.images.length > 0 ? `${BACKEND_URL}/uploads/${item.product.images[0]}` : "https://via.placeholder.com/60"} 
                    alt={item.product?.title || 'Sản phẩm'} 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }} 
                  />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#023047', fontSize: '1.1rem' }}>{item.product?.title || 'Sản phẩm không xác định'}</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.95rem', marginBottom: '10px' }}>
                      {item.size ? `Size: ${item.size} | ` : ''} Đơn giá: {getPriceBySize(item.product?.price, item.size, item.product?.sizeOptions).toLocaleString()} đ
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                        <button onClick={() => updateQuantity(item, -1)} style={{ width: '30px', height: '30px', background: '#f9f9f9', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#555', transition: 'background 0.2s' }}>-</button>
                        <span style={{ width: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item, 1)} style={{ width: '30px', height: '30px', background: '#f9f9f9', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: '#555', transition: 'background 0.2s' }}>+</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                   <span style={{ fontWeight: 'bold', color: '#e63946', fontSize: '1.1rem' }}>{(getPriceBySize(item.product?.price, item.size, item.product?.sizeOptions) * item.quantity).toLocaleString()} đ</span>
                   <button onClick={() => removeItem(item)} style={{ background: '#fff', border: '1px solid #ffcccc', color: '#e63946', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                     Xóa
                   </button>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '2px dashed #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.2rem', color: '#333' }}>
              Tổng tiền: <strong style={{ color: '#e63946', fontSize: '1.5rem' }}>{cart.items.reduce((total, item) => total + getPriceBySize(item.product?.price, item.size, item.product?.sizeOptions) * item.quantity, 0).toLocaleString()} đ</strong>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={handleReserve} style={{ background: '#ffb703', color: '#023047', border: 'none', padding: '12px 20px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(255, 183, 3, 0.3)' }}>
                ⏳ Giữ chỗ (30p)
              </button>
              <button onClick={() => navigate('/checkout')} style={{ background: '#e63946', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(230, 57, 70, 0.3)' }}>
                Thanh toán ngay
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🛍️</div>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '25px' }}>Giỏ hàng của bạn đang trống.</p>
          <Link to="/products" style={{ display: 'inline-block', background: '#ffb703', color: '#023047', padding: '12px 30px', borderRadius: '30px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 4px 10px rgba(255, 183, 3, 0.3)' }}>Khám phá thực đơn</Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
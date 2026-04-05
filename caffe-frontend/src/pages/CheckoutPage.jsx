import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    shippingAddress: '',
    note: '',
    paymentMethod: 'COD'
  });
  const navigate = useNavigate();

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
        if (!response.data || !response.data.items || response.data.items.length === 0) {
          navigate('/cart'); // Nếu giỏ hàng trống thì quay về trang giỏ hàng
        } else {
          setCart(response.data);
        }
      } catch (error) {
        console.error('Lỗi tải giỏ hàng:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      // 1. Tạo đơn hàng
      await api.post('/orders', {
        items: cart.items.map(item => ({
          product: item.product._id, // Chỉ gửi ID sản phẩm lên backend
          quantity: item.quantity,
          size: item.size,
          price: getPriceBySize(item.product?.price, item.size, item.product?.sizeOptions) // Gửi kèm mức giá tại thời điểm đặt
        })),
        totalAmount: cart.items.reduce((total, item) => total + getPriceBySize(item.product?.price, item.size, item.product?.sizeOptions) * item.quantity, 0),
        ...formData
      });

      // 2. Làm rỗng giỏ hàng sau khi đặt thành công
      await api.post('/carts/clear');
      window.dispatchEvent(new Event('cartUpdated')); // Đồng bộ số lượng về 0 trên Header

      // 3. Thông báo và chuyển hướng
      alert('🎉 Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại Cà Phê Hạnh Phúc.');
      navigate('/');
    } catch (error) {
      console.error('Lỗi đặt hàng:', error.response?.data || error);
      alert(`Có lỗi xảy ra khi đặt hàng: ${error.response?.data?.message || 'Vui lòng kiểm tra lại thông tin!'}`);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!cart || !cart.items || cart.items.length === 0) return null; // Tránh lỗi crash giao diện khi đang chuyển hướng

  const totalAmount = cart.items.reduce((total, item) => total + getPriceBySize(item.product?.price, item.size, item.product?.sizeOptions) * item.quantity, 0) || 0;

  return (
    <div className="checkout-page container" style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#006a31', marginBottom: '40px' }}>📦 Thanh Toán Đơn Hàng</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        {/* Cột Trái: Form Thông tin Giao hàng */}
        <div style={{ flex: '1 1 500px', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px', color: '#333' }}>Thông tin giao hàng</h3>
          <form onSubmit={handleCheckout} id="checkout-form">
            <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Họ và tên *</label><input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} placeholder="Nhập họ tên người nhận" /></div>
            <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Số điện thoại *</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} placeholder="Nhập số điện thoại liên hệ" /></div>
            <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Địa chỉ giao hàng *</label><input type="text" name="shippingAddress" value={formData.shippingAddress} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." /></div>
            <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Ghi chú đơn hàng</label><textarea name="note" value={formData.note} onChange={handleChange} rows="3" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', resize: 'vertical' }} placeholder="Ví dụ: Giao giờ hành chính, ít đá, nhiều đường..."></textarea></div>
            <div style={{ marginBottom: '25px' }}><label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Phương thức thanh toán</label><select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', backgroundColor: '#000', color: '#fff' }}><option value="COD">Thanh toán khi nhận hàng (COD)</option><option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option></select></div>
          </form>
        </div>

        {/* Cột Phải: Tóm tắt đơn hàng */}
        <div style={{ flex: '1 1 400px' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', position: 'sticky', top: '100px' }}>
            <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px', color: '#333' }}>Tóm tắt đơn hàng</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
              {cart?.items.map((item, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', lineHeight: '1.4' }}>
                  <div style={{ flex: 1, paddingRight: '15px' }}><strong style={{ color: '#006a31' }}>{item.quantity}x</strong> {item.product?.title || 'Sản phẩm không xác định'}{item.size && <div style={{ fontSize: '0.85rem', color: '#888' }}>Size: {item.size}</div>}</div>
                  <div style={{ fontWeight: 'bold', color: '#555' }}>{(getPriceBySize(item.product?.price, item.size, item.product?.sizeOptions) * item.quantity).toLocaleString()} đ</div>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginBottom: '10px' }}><span>Tạm tính:</span><strong>{totalAmount.toLocaleString()} đ</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginBottom: '20px', color: '#28a745' }}><span>Phí giao hàng:</span><strong>Miễn phí</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', borderTop: '2px dashed #ddd', paddingTop: '20px', marginBottom: '30px' }}>
              <strong>Tổng cộng:</strong>
              <strong style={{ color: '#e63946' }}>{totalAmount.toLocaleString()} đ</strong>
            </div>
            
            <button form="checkout-form" type="submit" style={{ width: '100%', background: '#e63946', color: '#fff', border: 'none', padding: '16px', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(230, 57, 70, 0.3)' }}>
              Hoàn tất đặt hàng
            </button>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <Link to="/cart" style={{ color: '#666', textDecoration: 'none', fontSize: '0.95rem' }}>&larr; Quay lại giỏ hàng</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
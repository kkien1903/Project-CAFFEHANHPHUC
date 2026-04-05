import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Giả sử backend có API GET /orders để lấy danh sách đơn hàng của user đang đăng nhập
        const response = await api.get('/orders');
        setOrders(response.data.data || response.data || []);
      } catch (err) {
        console.error('Lỗi lấy lịch sử đơn hàng:', err);
        setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Hàm xử lý khi user bấm hủy đơn
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`);
      // Gọi lại API để tải danh sách mới sau khi hủy thành công
      const response = await api.get('/orders');
      setOrders(response.data.data || response.data || []);
    } catch (err) {
      console.error('Lỗi hủy đơn hàng:', err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng.');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
      <h2 style={{ textAlign: 'center', color: '#006a31', marginBottom: '30px' }}>📦 Lịch Sử Đơn Hàng</h2>
      
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {!loading && orders.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📭</div>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>Bạn chưa có đơn hàng nào.</p>
          <Link to="/products" style={{ display: 'inline-block', padding: '10px 25px', background: '#ffb703', color: '#023047', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold' }}>Khám phá menu ngay</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #006a31' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong style={{ color: '#555' }}>Mã ĐH:</strong> <span style={{ color: '#006a31', fontWeight: 'bold' }}>#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                  <span style={{ margin: '0 10px', color: '#ccc' }}>|</span>
                  <span style={{ color: '#777' }}>{new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div>
                  <span style={{ background: order.status === 'COMPLETED' ? '#e6f4ea' : order.status === 'CANCELLED' ? '#fdeaea' : order.status === 'SHIPPING' ? '#cce5ff' : '#fff3cd', color: order.status === 'COMPLETED' ? '#006a31' : order.status === 'CANCELLED' ? '#d62828' : order.status === 'SHIPPING' ? '#0056b3' : '#856404', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {order.status === 'COMPLETED' ? 'Đã hoàn thành' : order.status === 'CANCELLED' ? 'Đã hủy' : order.status === 'SHIPPING' ? 'Đang giao hàng' : 'Đang xử lý'}
                  </span>
                </div>
              </div>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 15px 0' }}>
                {order.items && order.items.map((item, index) => (
                  <li key={index} style={{ marginBottom: '8px', color: '#444' }}>
                    <strong style={{ color: '#023047' }}>{item.quantity}x</strong> {item.product?.title || 'Sản phẩm'} {item.size ? `(Size ${item.size})` : ''}
                  </li>
                ))}
              </ul>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px dashed #ddd', paddingTop: '15px', alignItems: 'center', gap: '15px' }}>
                {order.status === 'PENDING' && (
                  <button onClick={() => handleCancelOrder(order._id)} style={{ background: '#fff', border: '1px solid #d62828', color: '#d62828', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                    Hủy đơn hàng
                  </button>
                )}
                <span style={{ fontSize: '1.1rem' }}>Tổng tiền: <strong style={{ color: '#e63946', fontSize: '1.3rem' }}>{order.totalAmount?.toLocaleString()} đ</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Giả sử API lấy tất cả đơn hàng cho admin là /orders/all (bạn có thể điều chỉnh lại nếu backend dùng endpoint khác)
      const response = await api.get('/orders/all'); 
      setOrders(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Lỗi lấy danh sách đơn hàng:', error);
      setMessage('Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Giả sử API cập nhật trạng thái là PUT /orders/:id/status
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setMessage('Cập nhật trạng thái thành công!');
      fetchOrders(); // Tải lại dữ liệu sau khi cập nhật
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      setMessage('Có lỗi xảy ra khi cập nhật trạng thái.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div>
      <h2>Quản lý Đơn hàng</h2>
      {message && <div className="admin-message" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e6f4ea', color: '#006a31', borderRadius: '5px', fontWeight: 'bold' }}>{message}</div>}

      {loading ? <p>Đang tải...</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Chi tiết đơn hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? orders.map(order => (
              <tr key={order._id}>
                <td><strong style={{ color: '#006a31' }}>#{order._id.substring(order._id.length - 6).toUpperCase()}</strong></td>
                <td>
                  <div><strong>{order.fullName || order.user?.username || 'Khách hàng'}</strong></div>
                  <div style={{ fontSize: '0.9rem', color: '#555' }}>{order.phone || order.user?.email || ''}</div>
                  <div style={{ fontSize: '0.85rem', color: '#777' }}>{order.shippingAddress}</div>
                  {order.note && <div style={{ fontSize: '0.85rem', color: '#d62828', fontStyle: 'italic', marginTop: '4px' }}>*Ghi chú: {order.note}</div>}
                </td>
                <td>
                  <ul style={{ margin: 0, padding: '0 0 0 15px', listStyle: 'square' }}>
                    {order.items && order.items.map((item, index) => (
                      <li key={index} style={{ fontSize: '0.9rem', color: '#333' }}>
                        {item.quantity} x {item.product?.title || 'Sản phẩm đã bị xóa'} {item.size ? `(Size: ${item.size})` : ''}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ fontWeight: 'bold', color: '#e63946' }}>{order.totalAmount?.toLocaleString()} đ</td>
                <td>
                  <select 
                    value={order.status || 'PENDING'} 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    style={{
                      padding: '8px',
                      borderRadius: '20px',
                      border: '1px solid #ddd',
                      backgroundColor: order.status === 'COMPLETED' ? '#e6f4ea' : order.status === 'CANCELLED' ? '#fdeaea' : '#fff3cd',
                      color: order.status === 'COMPLETED' ? '#006a31' : order.status === 'CANCELLED' ? '#d62828' : '#856404',
                      fontWeight: 'bold',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="PENDING">Đang xử lý</option>
                    <option value="SHIPPING">Đang giao hàng</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Chưa có đơn hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;
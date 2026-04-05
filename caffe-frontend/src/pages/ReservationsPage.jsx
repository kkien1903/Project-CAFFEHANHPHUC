import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReservations = async () => {
    try {
      const response = await api.get('/reservations');
      setReservations(response.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách giữ chỗ:', err);
      setError('Không thể tải danh sách giữ chỗ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy giữ chỗ này không?')) return;
    try {
      await api.put(`/reservations/${id}/cancel`);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy.');
    }
  };

  const handlePayment = async (id) => {
    try {
      // Gọi API tạo Payment cho Reservation này
      await api.post('/payments', { reservation: id, method: 'cod' });
      alert('🎉 Đã xác nhận thanh toán/đặt hàng thành công cho đơn giữ chỗ này!');
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán.');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', minHeight: '60vh' }}>
      <h2 style={{ textAlign: 'center', color: '#ffb703', marginBottom: '30px' }}>⏱️ Đơn Hàng Đang Giữ Chỗ</h2>
      
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {!loading && reservations.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>Bạn chưa có đơn giữ chỗ nào.</p>
          <Link to="/products" style={{ display: 'inline-block', padding: '10px 25px', background: '#ffb703', color: '#023047', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold' }}>Khám phá menu</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reservations.map((res) => (
            <div key={res._id} style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: `5px solid ${res.status === 'actived' ? '#ffb703' : res.status === 'paid' ? '#006a31' : '#d62828'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <strong style={{ color: '#555' }}>Mã Giữ Chỗ:</strong> <span style={{ color: '#023047', fontWeight: 'bold' }}>#{res._id.substring(res._id.length - 6).toUpperCase()}</span>
                  {res.status === 'actived' && <div style={{ color: '#d62828', fontSize: '0.9rem', marginTop: '5px' }}>Hết hạn lúc: {new Date(res.expiredAt).toLocaleTimeString('vi-VN')}</div>}
                </div>
                <div>
                  <span style={{ background: res.status === 'actived' ? '#fff3cd' : res.status === 'paid' ? '#e6f4ea' : '#fdeaea', color: res.status === 'actived' ? '#856404' : res.status === 'paid' ? '#006a31' : '#d62828', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {res.status === 'actived' ? 'Đang giữ chỗ' : res.status === 'paid' ? 'Đã thanh toán' : res.status === 'expired' ? 'Đã hết hạn' : 'Đã hủy'}
                  </span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 15px 0' }}>
                {res.items && res.items.map((item, index) => (
                  <li key={index} style={{ marginBottom: '8px', color: '#444' }}><strong style={{ color: '#023047' }}>{item.quantity}x</strong> {item.product?.title || 'Sản phẩm'}</li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #ddd', paddingTop: '15px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem' }}>Tổng tiền: <strong style={{ color: '#e63946', fontSize: '1.3rem' }}>{res.totalAmount?.toLocaleString()} đ</strong></span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {res.status === 'actived' && <button onClick={() => handleCancel(res._id)} style={{ background: '#fff', border: '1px solid #d62828', color: '#d62828', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy giữ chỗ</button>}
                  {res.status === 'actived' && <button onClick={() => handlePayment(res._id)} style={{ background: '#006a31', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Thanh toán</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ReservationsPage;
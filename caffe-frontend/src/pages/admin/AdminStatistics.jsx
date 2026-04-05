import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminStatistics = () => {
  const [inventories, setInventories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Lấy dữ liệu kho hàng và đơn hàng
        const [invRes, orderRes] = await Promise.all([
          api.get('/inventories'),
          api.get('/orders/all')
        ]);
        setInventories(invRes.data || []);
        setOrders(orderRes.data?.data || orderRes.data || []);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu thống kê:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, []);

  if (loading) return <p>Đang tải dữ liệu thống kê...</p>;

  // Tính toán các con số thống kê
  // Lọc ra các inventory có product hợp lệ (chưa bị xóa)
  const validInventories = inventories.filter(item => item.product);
  const totalProducts = validInventories.length;
  const totalStock = validInventories.reduce((sum, item) => sum + (item.stock || 0), 0);

  // Tính tổng lượt bán dựa trên đơn hàng thực tế (Bỏ qua đơn đã hủy)
  const validOrders = orders.filter(o => o.status !== 'CANCELLED');
  
  let totalSold = 0;
  const productSales = {};

  validOrders.forEach(order => {
    order.items?.forEach(item => {
      totalSold += item.quantity;
      const title = item.product?.title || 'Sản phẩm đã xóa';
      if (!productSales[title]) {
        productSales[title] = { title, soldCount: 0 };
      }
      productSales[title].soldCount += item.quantity;
    });
  });

  // Lọc Top 5 sản phẩm bán chạy nhất
  const topSelling = Object.values(productSales)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);

  // Lọc sản phẩm sắp hết hàng (tồn kho < 10)
  const lowStock = validInventories.filter(item => item.stock < 10);

  return (
    <div>
      <h2>📊 Thống Kê & Báo Cáo Sản Phẩm</h2>

      {/* 1. Các thẻ tổng quan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #006a31' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#555', fontSize: '1rem' }}>Tổng Loại Sản Phẩm</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#006a31', margin: 0 }}>{totalProducts}</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #ffb703' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#555', fontSize: '1rem' }}>Tổng Tồn Kho</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffb703', margin: 0 }}>{totalStock}</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #d62828' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#555', fontSize: '1rem' }}>Tổng Lượt Đã Bán</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d62828', margin: 0 }}>{totalSold}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        {/* 2. Top Bán Chạy */}
        <div style={{ flex: '1 1 400px', background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', color: '#006a31' }}>🔥 Top Bán Chạy Nhất</h3>
          {topSelling.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {topSelling.map((item, index) => (
                <li key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: index !== topSelling.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                  <span><strong style={{ color: '#ffb703', marginRight: '10px' }}>#{index + 1}</strong> {item.title}</span>
                  <strong style={{ color: '#d62828' }}>Đã bán: {item.soldCount}</strong>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: '#777', fontStyle: 'italic' }}>Chưa có dữ liệu bán hàng.</p>}
        </div>

        {/* 3. Cảnh báo sắp hết hàng */}
        <div style={{ flex: '1 1 400px', background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', color: '#d62828' }}>⚠️ Cảnh Báo Sắp Hết Hàng</h3>
          {lowStock.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {lowStock.map((item, index) => (
                <li key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: index !== lowStock.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                  <span>{item.product?.title || 'Sản phẩm đã xóa'}</span>
                  <span style={{ background: '#fdeaea', color: '#d62828', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>Còn: {item.stock}</span>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: '#006a31', fontWeight: 'bold' }}>Tất cả sản phẩm đều đủ hàng trong kho! ✅</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
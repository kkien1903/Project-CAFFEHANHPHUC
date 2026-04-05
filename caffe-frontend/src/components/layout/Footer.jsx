import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#006a31', color: '#fff', padding: '50px 0 20px', marginTop: '60px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
        
        {/* Cột 1: Thông tin thương hiệu */}
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px' }}>Cà Phê Hạnh Phúc</h3>
          <p style={{ lineHeight: '1.6', fontSize: '0.95rem', color: '#e0e0e0' }}>
            Hương vị của sự bình yên và hạnh phúc. Chúng tôi mang đến những hạt cà phê Arabica thượng hạng, được rang xay tỉ mỉ để trao gửi trọn vẹn yêu thương trong từng tách cà phê.
          </p>
        </div>

        {/* Cột 2: Liên kết nhanh */}
        <div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '2px solid #ffb703', display: 'inline-block', paddingBottom: '5px' }}>Liên kết nhanh</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
            <li><Link to="/" style={{ color: '#e0e0e0', textDecoration: 'none' }}>Trang chủ</Link></li>
            <li><Link to="/products" style={{ color: '#e0e0e0', textDecoration: 'none' }}>Menu</Link></li>
            <li><Link to="/categories" style={{ color: '#e0e0e0', textDecoration: 'none' }}>Danh mục</Link></li>
            <li><Link to="/promotion" style={{ color: '#e0e0e0', textDecoration: 'none' }}>Khuyến mãi</Link></li>
          </ul>
        </div>

        {/* Cột 3: Thông tin liên hệ */}
        <div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '2px solid #ffb703', display: 'inline-block', paddingBottom: '5px' }}>Liên hệ</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2', color: '#e0e0e0', fontSize: '0.95rem' }}>
            <li>📍 Địa chỉ: 123 Đường Hạnh Phúc, Quận 1, TP. HCM</li>
            <li>📞 Điện thoại: 0123 456 789</li>
            <li>✉️ Email: contact@caffehanhphuc.com</li>
            <li>⏰ Giờ mở cửa: 07:00 - 22:30 hàng ngày</li>
          </ul>
        </div>

      </div>

      {/* Dòng bản quyền */}
      <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.9rem', color: '#ccc' }}>
        <p>&copy; {new Date().getFullYear()} Cà Phê Hạnh Phúc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

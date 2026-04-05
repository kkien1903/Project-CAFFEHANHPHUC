import React from 'react';
import { Link } from 'react-router-dom';

const PromotionPage = () => {
  // Dữ liệu các điểm nổi bật của quán
  const highlights = [
    {
      id: 1,
      title: '100% Cà Phê Arabica',
      desc: 'Chúng tôi tự hào sử dụng 100% hạt cà phê Arabica thượng hạng, được thu hoạch thủ công từ những vùng trồng danh tiếng, mang lại hương vị đậm đà và hương thơm quyến rũ khó quên.',
      icon: '☕',
      color: '#d62828'
    },
    {
      id: 2,
      title: 'Không Gian Ấm Cúng',
      desc: 'Thiết kế tinh tế kết hợp cùng ánh đèn vàng êm dịu, Cà Phê Hạnh Phúc là chốn bình yên lý tưởng để bạn thư giãn, làm việc hay trò chuyện cùng những người thân yêu.',
      icon: '🏡',
      color: '#006a31'
    },
    {
      id: 3,
      title: 'Nghệ Thuật Pha Chế',
      desc: 'Mỗi thức uống tại quán đều là một tác phẩm nghệ thuật. Đội ngũ Barista chuyên nghiệp của chúng tôi luôn dồn trọn tâm huyết và sự tỉ mỉ vào từng giọt cà phê.',
      icon: '✨',
      color: '#ffb703'
    }
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{ 
        height: '400px', 
        backgroundImage: 'url("https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2000&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        textAlign: 'center'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}></div>
        <div style={{ zIndex: 2, padding: '0 20px', color: '#fff' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '15px', textShadow: '2px 2px 8px rgba(0,0,0,0.6)', letterSpacing: '1px' }}>KHÁM PHÁ ĐIỂM NỔI BẬT</h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto', textShadow: '1px 1px 5px rgba(0,0,0,0.5)', lineHeight: '1.6' }}>Hành trình mang đến những tách cà phê trọn vẹn và không gian tuyệt vời nhất dành riêng cho bạn.</p>
        </div>
      </section>

      {/* Danh sách Điểm nổi bật */}
      <section className="container" style={{ marginTop: '60px', padding: '0 20px', maxWidth: '1200px', margin: '60px auto 0' }}>
        <h2 style={{ textAlign: 'center', color: '#006a31', fontSize: '2.2rem', marginBottom: '40px' }}>🌟 Điều Gì Làm Nên Sự Khác Biệt? 🌟</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {highlights.map((highlight) => (
            <div key={highlight.id} style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', borderTop: `5px solid ${highlight.color}`, transition: 'transform 0.3s' }} className="highlight-card">
              <div style={{ padding: '30px 25px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '15px' }}>{highlight.icon}</div>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.5rem', color: highlight.color }}>{highlight.title}</h3>
                <p style={{ color: '#555', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>{highlight.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kêu gọi hành động */}
      <section style={{ textAlign: 'center', marginTop: '80px', padding: '60px 20px', backgroundColor: '#f0f7f3' }}>
        <h2 style={{ color: '#006a31', fontSize: '2rem', marginBottom: '20px' }}>Sẵn Sàng Trải Nghiệm?</h2>
        <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>Hãy đến và tự mình cảm nhận những thức uống tuyệt vời nhất được tạo ra từ đam mê tại Cà Phê Hạnh Phúc.</p>
        <Link to="/products" style={{ display: 'inline-block', padding: '14px 40px', backgroundColor: '#e63946', color: '#fff', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(230, 57, 70, 0.4)', transition: 'transform 0.3s' }}>
          Đặt Hàng Ngay
        </Link>
      </section>
    </div>
  );
};

export default PromotionPage;
import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link, useLocation } from 'react-router-dom';

const ProductsPage = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 8; // Số chẵn (8) rất tốt để chia thành hàng 2 hoặc 4 cột

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryId = searchParams.get('category');
  const searchTitle = searchParams.get('title');

  useEffect(() => {
    setPage(1);
  }, [categoryId, searchTitle]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `/products?page=${page}&limit=${limit}`;
        if (categoryId) url += `&category=${categoryId}`;
        if (searchTitle) url += `&title=${encodeURIComponent(searchTitle)}`;
        
        const response = await api.get(url);
        const fetchedProducts = response.data?.data || response.data || [];
        setProducts(fetchedProducts);
        setHasMore(fetchedProducts.length === limit);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, searchTitle, page]);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="products-page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 15px' }}>
      
      {/* Inject CSS để xử lý Grid đều cho mọi thiết bị */}
      <style>{`
        .product-grid-main {
          display: grid;
          gap: 25px;
          /* Mặc định máy tính: Luôn 4 cột (8 sản phẩm = 2 hàng đều) */
          grid-template-columns: repeat(4, 1fr); 
        }

        @media (max-width: 1100px) {
          .product-grid-main {
            grid-template-columns: repeat(3, 1fr); /* Màn hình vừa: 3 cột */
          }
        }

        @media (max-width: 850px) {
          .product-grid-main {
            grid-template-columns: repeat(2, 1fr); /* Tablet: 2 cột */
          }
        }

        @media (max-width: 480px) {
          .product-grid-main {
            grid-template-columns: repeat(1, 1fr); /* Mobile: 1 cột */
          }
        }

        .product-card-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
        }
      `}</style>

      <div className="page-header">
        <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#d62828', fontSize: '2rem', fontWeight: 'bold' }}>
          {searchTitle ? `🔎 Kết quả cho: "${searchTitle}"` : '🥤 Tất cả sản phẩm 🍰'}
        </h2>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666' }}>
          <p style={{ fontSize: '1.2rem' }}>Không tìm thấy sản phẩm nào. 🥺</p>
        </div>
      ) : (
        <>
          <div className="product-grid-main">
            {products.map((product) => (
              <Link 
                to={`/products/${product._id}`} 
                key={product._id} 
                className="product-card-item" 
                style={{ 
                  textDecoration: 'none', color: 'inherit', borderRadius: '15px', 
                  overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', 
                  transition: 'all 0.3s', backgroundColor: '#fff', 
                  display: 'flex', flexDirection: 'column', height: '100%' 
                }}
              >
                <div style={{ width: '100%', height: '220px', overflow: 'hidden' }}>
                  <img
                    src={product.images?.length > 0 ? `${BACKEND_URL}/uploads/${product.images[0]}` : "https://via.placeholder.com/250"}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                <div style={{ padding: '20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 12px 0', color: '#023047', height: '2.4em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {product.title}
                  </h3>
                  
                  <p style={{ fontWeight: 'bold', color: '#e63946', fontSize: '1.2rem', marginBottom: '20px' }}>
                    {product.price?.toLocaleString()} đ
                  </p>
                  
                  <div style={{ marginTop: 'auto', background: '#ffb703', color: '#023047', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102z"/></svg>
                    Mua Ngay
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Phân trang */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px', marginTop: '60px' }}>
            <button 
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0,0); }} 
              disabled={page === 1}
              style={{ 
                padding: '12px 25px', borderRadius: '30px', border: '1px solid #006a31', 
                background: page === 1 ? '#eee' : '#fff', color: '#006a31',
                cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: '0.2s'
              }}
            >
              &laquo; Trang trước
            </button>
            
            <span style={{ fontWeight: 'bold', color: '#333' }}>Trang {page}</span>
            
            <button 
              onClick={() => { setPage(p => p + 1); window.scrollTo(0,0); }} 
              disabled={!hasMore}
              style={{ 
                padding: '12px 25px', borderRadius: '30px', border: 'none', 
                background: !hasMore ? '#eee' : '#006a31', color: !hasMore ? '#999' : '#fff',
                cursor: !hasMore ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: '0.2s',
                boxShadow: !hasMore ? 'none' : '0 4px 12px rgba(0, 106, 49, 0.2)'
              }}
            >
              Trang sau &raquo;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsPage;
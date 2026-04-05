import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link, useLocation } from 'react-router-dom';

const ProductsPage = () => {
  // Lấy URL của backend từ biến môi trường, với giá trị mặc định
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 8; // Số lượng hiển thị mỗi trang

  // Lấy query parameter "category" từ URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryId = searchParams.get('category');
  const searchTitle = searchParams.get('title');

  useEffect(() => {
    setPage(1); // Reset trang về 1 khi đổi danh mục
  }, [categoryId, searchTitle]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true); // Hiển thị loading khi đổi danh mục
        let url = `/products?page=${page}&limit=${limit}`;
        if (categoryId) url += `&category=${categoryId}`;
        if (searchTitle) url += `&title=${encodeURIComponent(searchTitle)}`;
        
        const response = await api.get(url);
        
        const fetchedProducts = response.data?.data || response.data || [];
        setProducts(fetchedProducts);
        setHasMore(fetchedProducts.length === limit); // Nếu trả về đủ 8 cái thì mới có trang tiếp theo
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, searchTitle, page]); // Gọi lại API mỗi khi categoryId, title hoặc page thay đổi

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="products-page-container">
      <div className="page-header">
        <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#d62828' }}>
          {searchTitle ? `🔎 Kết quả tìm kiếm cho: "${searchTitle}"` : '🥤 Tất cả sản phẩm 🍰'}
        </h2>
      </div>
      {products.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#666', fontSize: '1.2rem' }}>
          <p>Không có sản phẩm nào để hiển thị. 🥺</p>
        </div>
      ) : (
        <>
          <div className="product-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px', padding: '0 15px' }}>
          {products.map((product) => (
            <Link to={`/products/${product._id}`} key={product._id} className="product-card" style={{ textDecoration: 'none', color: 'inherit', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.3s', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
              <img
                src={
                  product.images && product.images.length > 0
                    ? `${BACKEND_URL}/uploads/${product.images[0]}`
                    : "https://via.placeholder.com/150" // Ảnh placeholder
                }
                alt={product.title}
                className="product-image" style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div className="product-info" style={{ padding: '20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 10px 0', color: '#023047' }}>{product.title}</h3>
                  <p style={{ fontWeight: 'bold', color: '#e63946', fontSize: '1.1rem', margin: '0 0 15px 0' }}>{product.price?.toLocaleString()} VNĐ</p>
                  <span className="btn-buy-now" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#ffb703', color: '#023047', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>
                    Mua Ngay
                  </span>
              </div>
            </Link>
          ))}
          </div>

          {/* Nút phân trang */}
          {(page > 1 || hasMore) && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '50px', paddingBottom: '20px' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                style={{ padding: '10px 25px', borderRadius: '30px', border: '1px solid #006a31', background: page === 1 ? '#f9f9f9' : '#fff', color: page === 1 ? '#aaa' : '#006a31', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
              >
                &laquo; Trang trước
              </button>
              <span style={{ fontWeight: 'bold', color: '#555', fontSize: '1.1rem' }}>Trang {page}</span>
              <button 
                onClick={() => setPage(p => p + 1)} 
                disabled={!hasMore}
                style={{ padding: '10px 25px', borderRadius: '30px', border: 'none', background: !hasMore ? '#f9f9f9' : '#006a31', color: !hasMore ? '#aaa' : '#fff', cursor: !hasMore ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.2s', boxShadow: !hasMore ? 'none' : '0 4px 10px rgba(0, 106, 49, 0.3)' }}
              >
                Trang sau &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;
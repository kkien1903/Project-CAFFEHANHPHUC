import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const ProductsPage = () => {
  // Lấy URL của backend từ biến môi trường, với giá trị mặc định
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        // Giả sử API trả về một object có key là 'data' chứa mảng sản phẩm
        setProducts(response.data.data);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="products-page-container">
      <div className="page-header">
        <h2>Tất cả sản phẩm</h2>
      </div>
      <div className="product-list">
        {products.map((product) => (
          <Link to={`/products/${product._id}`} key={product._id} className="product-card">
            <img
              src={
                product.images && product.images.length > 0
                  ? `${BACKEND_URL}/uploads/${product.images[0]}`
                  : "https://via.placeholder.com/150" // Ảnh placeholder
              }
              alt={product.title}
              className="product-image"
            />
            <div className="product-info">
                <h3>{product.title}</h3>
                <p>Giá: {product.price.toLocaleString()} VNĐ</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
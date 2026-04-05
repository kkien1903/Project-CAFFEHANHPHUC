import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const initialForm = {
    title: '',
    sku: '', // Thêm trường SKU
    price: '',
    description: '',
    category: '',
    origin: '',
    ingredients: '', // Sẽ được xử lý thành mảng
    sizeOptions: '', // Sẽ được xử lý thành mảng
    images: [], // Thêm mảng chứa tên hình ảnh
    stock: 0, // Thêm trường tồn kho
  };
  const [formData, setFormData] = useState(initialForm);
  const [selectedFiles, setSelectedFiles] = useState(null); // State lưu trữ file được chọn

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, invRes] = await Promise.all([
        api.get(`/products?page=${page}&limit=${limit}`),
        api.get('/categories'),
        api.get('/inventories')
      ]);
      const fetchedProducts = prodRes.data.data || prodRes.data || [];
      const inventories = invRes.data || [];
      
      const productsWithStock = fetchedProducts.map(p => {
        const inv = inventories.find(i => i.product?._id === p._id || i.product === p._id);
        return { ...p, stock: inv ? inv.stock : 0 };
      });

      setProducts(productsWithStock);
      setHasMore(fetchedProducts.length === limit);
      setCategories(catRes.data.data || catRes.data || []);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error);
      setMessage('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let uploadedImages = formData.images || [];

      // Nếu admin có chọn file ảnh mới, tiến hành upload trước
      if (selectedFiles && selectedFiles.length > 0) {
        const uploadData = new FormData();
        Array.from(selectedFiles).forEach(file => {
          uploadData.append('files', file);
        });
        const uploadRes = await api.post('/upload/multiple', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImages = uploadRes.data.map(f => f.filename);
      }

      // Xử lý dữ liệu form trước khi gửi
      const payload = {
        title: formData.title,
        sku: formData.sku, // Đính kèm SKU vào dữ liệu gửi lên API
        price: Number(String(formData.price).replace(/[,.]/g, '')), // Loại bỏ dấu phẩy và chấm trước khi lưu
        description: formData.description,
        category: formData.category,
        origin: formData.origin,
        // Chuyển chuỗi thành mảng, loại bỏ khoảng trắng và phần tử rỗng
        ingredients: formData.ingredients.split(',').map(item => item.trim()).filter(Boolean),
        sizeOptions: formData.sizeOptions.split(',').map(item => item.trim()).filter(Boolean),
        stock: Number(formData.stock), // Gửi số lượng tồn kho lên backend
        images: uploadedImages, // Đính kèm mảng hình ảnh vào payload
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage('Cập nhật sản phẩm thành công!');
      } else {
        await api.post('/products', payload);
        setMessage('Thêm sản phẩm thành công!');
      }
      setFormData(initialForm);
      setEditingId(null);
      setSelectedFiles(null);
      fetchData();
      setIsFormVisible(false); // Hide form on success
    } catch (error) {
      console.error('Lỗi lưu sản phẩm:', error);
      setMessage('Có lỗi xảy ra khi lưu sản phẩm.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (product) => {
    setFormData({
      title: product.title,
      sku: product.sku || '',
      price: product.price,
      description: product.description || '',
      category: product.category?._id || product.category || '',
      origin: product.origin || '',
      ingredients: (product.ingredients || []).join(', '),
      sizeOptions: (product.sizeOptions || []).join(', '),
      images: product.images || [],
      stock: product.stock || 0, // Hiển thị số lượng tồn kho khi sửa
    });
    setEditingId(product._id);
    setSelectedFiles(null); // Reset file input khi bấm Sửa
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage('Xóa sản phẩm thành công!');
      fetchData();
    } catch (error) {
      console.error('Lỗi xóa sản phẩm:', error);
      setMessage('Có lỗi xảy ra khi xóa sản phẩm.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(initialForm);
    setSelectedFiles(null);
    setIsFormVisible(true);
  };

  return (
    <div>
      <h2>Quản lý Sản phẩm</h2>
      {message && <div className="admin-message">{message}</div>}

      {!isFormVisible && (
        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleAddNew} className="btn-submit">Thêm Sản phẩm mới</button>
        </div>
      )}

      {isFormVisible && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}</h3>
          <input
            type="text" name="title" placeholder="Tên sản phẩm"
            value={formData.title} onChange={handleChange} required
          />
          <input
            type="text" name="sku" placeholder="Mã SKU (VD: CF001)"
            value={formData.sku} onChange={handleChange} required
          />
          <input
            type="text" name="price" placeholder="Giá (VNĐ, ví dụ: 29000 hoặc 29.000)"
            value={formData.price} onChange={handleChange} required
          />
          <input
            type="text" name="origin" placeholder="Xuất xứ"
            value={formData.origin} onChange={handleChange}
          />
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">-- Chọn danh mục --</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: 'bold' }}>Hình ảnh sản phẩm:</label>
        <input
          type="file"
          multiple
          onChange={(e) => setSelectedFiles(e.target.files)}
          accept="image/*"
        />
        {formData.images && formData.images.length > 0 && !selectedFiles && (
          <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '5px' }}>Đã có {formData.images.length} ảnh. Nếu tải lên ảnh mới sẽ thay thế ảnh cũ.</p>
        )}
      </div>
      <input
        type="number" name="stock" placeholder="Số lượng tồn kho"
        value={formData.stock} onChange={handleChange} required
      />

          <input
            type="text" name="ingredients" placeholder="Thành phần (cách nhau bằng dấu phẩy)"
            value={formData.ingredients} onChange={handleChange}
          />
          <input
            type="text" name="sizeOptions" placeholder="Tùy chọn size (cách nhau bằng dấu phẩy)"
            value={formData.sizeOptions} onChange={handleChange}
          />
          <textarea
            name="description" placeholder="Mô tả sản phẩm"
            value={formData.description} onChange={handleChange}
          />
          <div className="form-actions">
            <button type="submit" className="btn-submit">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
            <button type="button" className="btn-cancel" onClick={() => setIsFormVisible(false)}>Hủy</button>
          </div>
        </form>
      )}

      {loading ? <p>Đang tải...</p> : (
        <>
          <table className="admin-table">
            <thead>
              <tr><th>Tên SP</th><th>Giá</th><th>Kho</th><th>Danh mục</th><th>Hành động</th></tr>
            </thead>
            <tbody>
            {products.map(prod => (
              <tr key={prod._id}>
                <td>{prod.title}</td>
                <td>{prod.price?.toLocaleString()} đ</td>
                <td><strong style={{ color: prod.stock < 10 ? '#d62828' : '#006a31' }}>{prod.stock || 0}</strong></td>
                <td>{prod.category?.name || 'Không có'}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(prod)}>Sửa</button>
                  <button className="btn-delete" onClick={() => handleDelete(prod._id)}>Xóa</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>

          {/* Phân trang Admin */}
          {(page > 1 || hasMore) && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', paddingBottom: '20px' }}>
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: '8px 16px', border: '1px solid #006a31', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer', background: page === 1 ? '#eee' : '#fff', color: page === 1 ? '#aaa' : '#006a31', fontWeight: 'bold' }}
              >
                Trang trước
              </button>
              <span style={{ fontWeight: 'bold' }}>Trang {page}</span>
              <button 
                disabled={!hasMore} 
                onClick={() => setPage(p => p + 1)}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: !hasMore ? 'not-allowed' : 'pointer', background: !hasMore ? '#eee' : '#006a31', color: !hasMore ? '#aaa' : '#fff', fontWeight: 'bold' }}
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default AdminProducts;
import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const initialForm = {
    title: '',
    price: '',
    description: '',
    category: '',
    origin: '',
    ingredients: '', // Sẽ được xử lý thành mảng
    sizeOptions: '', // Sẽ được xử lý thành mảng
    stock: 100, // Mặc định tồn kho
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data.data || prodRes.data || []);
      setCategories(catRes.data.data || catRes.data || []);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu:', error);
      setMessage('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Xử lý dữ liệu form trước khi gửi
      const payload = {
        title: formData.title,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
        origin: formData.origin,
        // Chuyển chuỗi thành mảng, loại bỏ khoảng trắng và phần tử rỗng
        ingredients: formData.ingredients.split(',').map(item => item.trim()).filter(Boolean),
        sizeOptions: formData.sizeOptions.split(',').map(item => item.trim()).filter(Boolean),
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage('Cập nhật sản phẩm thành công!');
      } else {
        // Thêm stock vào payload khi tạo mới
        payload.stock = Number(formData.stock);

        await api.post('/products', payload);
        setMessage('Thêm sản phẩm thành công!');
      }
      setFormData(initialForm);
      setEditingId(null);
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
      price: product.price,
      description: product.description || '',
      category: product.category?._id || product.category || '',
      origin: product.origin || '',
      ingredients: (product.ingredients || []).join(', '),
      sizeOptions: (product.sizeOptions || []).join(', '),
    });
    setEditingId(product._id);
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
            type="number" name="price" placeholder="Giá (VNĐ)"
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
          <input
            type="text" name="ingredients" placeholder="Thành phần (cách nhau bằng dấu phẩy)"
            value={formData.ingredients} onChange={handleChange}
          />
          <input
            type="text" name="sizeOptions" placeholder="Tùy chọn size (cách nhau bằng dấu phẩy)"
            value={formData.sizeOptions} onChange={handleChange}
          />
          {!editingId && <input
            type="number" name="stock" placeholder="Số lượng tồn kho"
            value={formData.stock} onChange={handleChange} required
          />}
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
        <table className="admin-table">
          <thead>
            <tr><th>Tên SP</th><th>Giá</th><th>Danh mục</th><th>Hành động</th></tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod._id}>
                <td>{prod.title}</td>
                <td>{prod.price?.toLocaleString()} đ</td>
                <td>{prod.category?.name || 'Không có'}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(prod)}>Sửa</button>
                  <button className="btn-delete" onClick={() => handleDelete(prod._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default AdminProducts;
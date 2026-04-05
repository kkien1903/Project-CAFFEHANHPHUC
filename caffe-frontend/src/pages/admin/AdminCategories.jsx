import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      // Tùy theo cấu trúc trả về, có thể là response.data hoặc response.data.data
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      console.error('Lỗi lấy danh mục:', error);
      setMessage('Không thể tải danh sách danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData);
        setMessage('Cập nhật danh mục thành công!');
      } else {
        await api.post('/categories', formData);
        setMessage('Thêm danh mục thành công!');
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      fetchCategories();
      setIsFormVisible(false); // Hide form on success
    } catch (error) {
      console.error('Lỗi lưu danh mục:', error);
      setMessage('Có lỗi xảy ra khi lưu danh mục.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category._id);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setMessage('Xóa danh mục thành công!');
      fetchCategories();
    } catch (error) {
      console.error('Lỗi xóa danh mục:', error);
      setMessage('Có lỗi xảy ra khi xóa danh mục.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setIsFormVisible(true);
  };

  return (
    <div>
      <h2>Quản lý Danh mục</h2>
      {message && <div className="admin-message">{message}</div>}

      {!isFormVisible && (
        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleAddNew} className="btn-submit">Thêm Danh mục mới</button>
        </div>
      )}

      {isFormVisible && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Cập nhật Danh mục' : 'Thêm Danh mục mới'}</h3>
          <input
            type="text"
            name="name"
            placeholder="Tên danh mục"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Mô tả danh mục"
            value={formData.description}
            onChange={handleChange}
          />
          <div className="form-actions">
            <button type="submit" className="btn-submit">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
            <button type="button" className="btn-cancel" onClick={() => setIsFormVisible(false)}>Hủy</button>
          </div>
        </form>
      )}

      {loading ? <p>Đang tải...</p> : (
        <table className="admin-table">
          <thead><tr><th>Tên Danh mục</th><th>Mô tả</th><th>Hành động</th></tr></thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id}>
                <td>{cat.name}</td><td>{cat.description}</td>
                <td><button className="btn-edit" onClick={() => handleEdit(cat)}>Sửa</button><button className="btn-delete" onClick={() => handleDelete(cat._id)}>Xóa</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default AdminCategories;
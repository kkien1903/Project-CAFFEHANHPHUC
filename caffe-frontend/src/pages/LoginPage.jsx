import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userData = await login({ username, password });
      
      // Kiểm tra quyền Admin dựa trên dữ liệu user trả về từ API
      const isUserAdmin = userData && (userData.role === 'ADMIN' || userData.role?.roleName === 'ADMIN' || userData.role?.name === 'ADMIN');
      
      if (isUserAdmin) {
        navigate('/admin'); // Chuyển hướng đến Dashboard nếu là Admin
      } else {
        navigate('/'); // Chuyển hướng về trang chủ nếu là khách thường
      }
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.');
      console.error(err);
    }
  };

  return (
    <div className="auth-form">
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <div className="form-group">
          <label>Tên đăng nhập</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
      <p>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
};

export default LoginPage;
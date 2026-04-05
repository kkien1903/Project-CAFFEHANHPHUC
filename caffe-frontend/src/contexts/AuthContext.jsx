import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Tự động kiểm tra session của user thông qua cookie khi tải trang
        const response = await api.get('/auth/me');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch {
        // Nếu request lỗi, có nghĩa là user chưa đăng nhập hoặc cookie đã hết hạn
        console.log('Chưa đăng nhập hoặc session đã hết hạn.');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    // Backend sẽ tự động set httpOnly cookie sau khi login thành công
    await api.post('/auth/login', credentials);
    // Sau khi login, gọi lại /auth/me để lấy thông tin user và cập nhật state
    const { data } = await api.get('/auth/me');
    setUser(data);
    setIsAuthenticated(true);
    return data;
  };

  const logout = async () => {
    // Gọi API để backend xóa httpOnly cookie
    await api.post('/auth/logout');
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (userData) => {
    await api.post('/auth/register', userData);
    // Sau khi đăng ký thành công, tự động đăng nhập cho người dùng
    // Backend login đang dùng `username`, nên ta truyền `username` và `password`
    await login({ username: userData.username, password: userData.password });
  };

  // Kiểm tra quyền Admin (hỗ trợ cả trường hợp role là String hoặc Object chứa name/roleName)
  const isAdmin = user && (
    user.role === 'ADMIN' || user.role?.roleName === 'ADMIN' || user.role?.name === 'ADMIN'
  );

  const value = { user, isAuthenticated, isAdmin, loading, login, logout, register };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
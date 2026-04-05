import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage'; // Import trang chi tiết sản phẩm
import AdminRoute from './contexts/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import './App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} /> {/* Route cho chi tiết sản phẩm */}
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Các Route dành riêng cho Admin */}
        <Route 
          path="/admin/*" 
          element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } 
        />
      </Routes>
    </Layout>
  )
}

export default App

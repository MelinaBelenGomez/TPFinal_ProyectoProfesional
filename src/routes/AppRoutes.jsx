import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';
import ProductsTable from '../components/ProductsTable';
import ProductForm from '../components/ProductForm';
import Reports from '../pages/Reports';
import Orders from '../pages/Orders';
import Production from '../pages/Production';
import Products from "../pages/Products";

const AppRoutes = ({ user }) => {
  if (user?.role === 'admin') {
    return (
      <Routes>
        <Route path="/" element={
          <>
            <Dashboard />
            <ProductsTable />
            <ProductForm />
          </>
        } />
        <Route path="/reports" element={<Reports />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/production" element={<Production user={user} />} />
        <Route path="/products" element={<Products />} />
        <Route path="/clients" element={<div>Página de Clientes</div>} />
        <Route path="/settings" element={<div>Página de Configuración</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  } else {
    return (
      <Routes>
        <Route path="/" element={<EmployeeDashboard user={user} />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
};

export default AppRoutes;
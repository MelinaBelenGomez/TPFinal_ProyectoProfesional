import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';
import ProductsTable from '../components/ProductsTable';
import ProductForm from '../components/ProductForm';
import Reports from '../pages/Reports';
import Orders from '../pages/Orders';
import Production from '../pages/Production';
import WorkStation from '../components/WorkStation';
import Products from "../pages/Products";
import RawMaterials from '../pages/RawMaterials';
import Settings from '../pages/Settings';
import Clients from '../pages/Clients';
import TestBackend from '../pages/TestBackend';
import Infrastructure from '../pages/Infrastructure';

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
        <Route path="/raw-materials" element={<RawMaterials />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
        <Route path="/test-backend" element={<TestBackend />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  } else if (user?.role === 'employee') {
    return (
      <Routes>
        <Route path="/" element={<EmployeeDashboard user={user} />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  } else {
    // Operarios de producción
    return (
      <Routes>
        <Route path="/" element={<WorkStation user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
};

export default AppRoutes;
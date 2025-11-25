import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';
import ProductsTable from '../components/ProductsTable';
import ProductForm from '../components/ProductForm';
import Reports from '../pages/Reports';
//import Orders from '../pages/Orders';
import Production from '../pages/Production';
import WorkStation from '../components/WorkStation';
import Products from "../pages/Products";
import RawMaterials from '../pages/RawMaterials';
import Settings from '../pages/Settings';
import Traceability from '../pages/Traceability';
import TestBackend from '../pages/TestBackend';
import Infrastructure from '../pages/Infrastructure';

const AppRoutes = ({ user }) => {
  if (user?.rol === 'ADMIN') {
    return (
      <Routes><div className="sector-hover-info">
  <strong>{sector.nombre}</strong><br/>
  Tipo: {sector.tipoProducto || 'N/A'}<br/>
  Condición: {sector.condicion || 'N/A'}<br/>
  {sector.skuProducto ? (
    <>
      SKU: {sector.skuProducto}<br/>
      Stock: {sector.stockDisponible || 0}
    </>
  ) : (
    <em>Vacío</em>
  )}
</div>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/production" element={<Production user={user} />} />
        <Route path="/products" element={<Products />} />
        <Route path="/raw-materials" element={<RawMaterials />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/user-management" element={<Settings />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
        <Route path="/traceability" element={<Traceability />} />
        <Route path="/test-backend" element={<TestBackend />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  } else if (user?.rol === 'JEFE_PRODUCCION') {
    return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/production-orders" element={<Production user={user} />} />
        <Route path="/process-monitor" element={<Reports />} />
        <Route path="/staff-assignment" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  } else if (user?.rol === 'OPERARIO') {
    // Operarios - solo su estación
    return (
      <Routes>
        <Route path="/" element={<WorkStation user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  } else {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }
};

export default AppRoutes;
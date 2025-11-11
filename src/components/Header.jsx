import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import '../styles/notifications.css';

const Header = ({ onLogout, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  const getMenuItems = () => {
    if (user?.rol === 'ADMIN') {
      return [
        { icon: 'fas fa-home', text: 'Inicio', path: '/' },
        { icon: 'fas fa-building', text: 'Centros y Almacenes', path: '/infrastructure' },
        { icon: 'fas fa-box', text: 'Productos', path: '/products' },
        { icon: 'fas fa-seedling', text: 'Materia Prima', path: '/raw-materials' },
        { icon: 'fas fa-industry', text: 'Producción', path: '/production' },
        { icon: 'fas fa-chart-bar', text: 'Reportes', path: '/reports' },
        { icon: 'fas fa-users', text: 'Usuarios', path: '/user-management' },
        { icon: 'fas fa-plug', text: 'Test Backend', path: '/test-backend' }
      ];
    } else if (user?.rol === 'JEFE_PRODUCCION') {
      return [
        { icon: 'fas fa-tachometer-alt', text: 'Dashboard Producción', path: '/' },
        { icon: 'fas fa-clipboard-list', text: 'Órdenes de Producción', path: '/production-orders' },
        { icon: 'fas fa-eye', text: 'Monitor de Procesos', path: '/process-monitor' },
        { icon: 'fas fa-user-cog', text: 'Asignación Personal', path: '/staff-assignment' },
        { icon: 'fas fa-chart-line', text: 'Reportes', path: '/reports' }
      ];
    } else if (user?.rol === 'OPERARIO') {
      // Operarios - solo su estación
      return [
        { icon: 'fas fa-tasks', text: `Estación ${user.estacion_asignada}`, path: '/' }
      ];
    } else {
      return [];
    }
  };

  return (
    <>
      <header className="header">
        <div className="logo-container">
          <h1 className="logo">FROZEN</h1>
          <div className="header-actions">
            {user?.rol === 'ADMIN' && <NotificationBell />}
            <button className="logout-btn" onClick={onLogout}>
              <i className="fas fa-sign-out-alt"></i> Salir
            </button>
            <button className="menu-toggle" onClick={toggleMenu}>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
        <span className="byline">BY 5HERTZ</span>
      </header>
      
      <nav className="nav">
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          {getMenuItems().map((item, index) => (
            <li key={index}>
              <Link 
                to={item.path}
                onClick={handleLinkClick}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <i className={item.icon}></i> {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Header;
import { useState } from 'react';

const Header = ({ onLogout, user, onNavigate, currentPage }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavClick = (page, e) => {
    e.preventDefault();
    onNavigate(page);
    setMenuOpen(false);
  };

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { icon: 'fas fa-home', text: 'Inicio', page: 'dashboard' },
        { icon: 'fas fa-box', text: 'Productos', page: 'products' },
        { icon: 'fas fa-users', text: 'Clientes', page: 'clients' },
        { icon: 'fas fa-shopping-cart', text: 'Pedidos', page: 'orders' },
        { icon: 'fas fa-chart-bar', text: 'Reportes', page: 'reports' },
        { icon: 'fas fa-cog', text: 'Configuración', page: 'settings' }
      ];
    } else {
      return [
        { icon: 'fas fa-clock', text: 'Registro de Horarios', page: 'dashboard' },
        { icon: 'fas fa-chart-line', text: 'Mis Reportes', page: 'reports' }
      ];
    }
  };

  return (
    <>
      <header className="header">
        <div className="logo-container">
          <h1 className="logo">FROZEN</h1>
          <div className="header-actions">
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
              <a 
                href="#" 
                onClick={(e) => handleNavClick(item.page, e)}
                className={currentPage === item.page ? 'active' : ''}
              >
                <i className={item.icon}></i> {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Header;
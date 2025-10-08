import { useState } from 'react';

const Header = ({ onLogout, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { icon: 'fas fa-home', text: 'Inicio', href: '#' },
        { icon: 'fas fa-box', text: 'Productos', href: '#' },
        { icon: 'fas fa-users', text: 'Clientes', href: '#' },
        { icon: 'fas fa-shopping-cart', text: 'Pedidos', href: '#' },
        { icon: 'fas fa-chart-bar', text: 'Reportes', href: '#' },
        { icon: 'fas fa-cog', text: 'Configuración', href: '#' }
      ];
    } else {
      return [
        { icon: 'fas fa-clock', text: 'Registro de Horarios', href: '#' },
        { icon: 'fas fa-chart-line', text: 'Mis Reportes', href: '#' }
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
              <a href={item.href}>
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
import { useState } from 'react';

const Header = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
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
          <li><a href="#"><i className="fas fa-home"></i> Inicio</a></li>
          <li><a href="#"><i className="fas fa-box"></i> Productos</a></li>
          <li><a href="#"><i className="fas fa-users"></i> Clientes</a></li>
          <li><a href="#"><i className="fas fa-shopping-cart"></i> Pedidos</a></li>
          <li><a href="#"><i className="fas fa-chart-bar"></i> Reportes</a></li>
          <li><a href="#"><i className="fas fa-cog"></i> Configuración</a></li>
        </ul>
      </nav>
    </>
  );
};

export default Header;
import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import EmployeeDashboard from './components/EmployeeDashboard'
import ProductsTable from './components/ProductsTable'
import ProductForm from './components/ProductForm'
import Footer from './components/Footer'
import Login from './pages/Login'
import Reports from './pages/Reports'
import Orders from './pages/Orders'
import Products from './pages/Products'
import './styles/global.css'

function App() {
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')

  const handleLogin = (userData) => {
    setUser(userData)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentPage('dashboard')
  }

  const handleNavigation = (page) => {
    setCurrentPage(page)
  }

  if (!user?.isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  const renderContent = () => {
    if (currentPage === 'reports') {
      return <Reports />;
    }
    
    if (currentPage === 'orders') {
      return <Orders />;
    }
    
    if (currentPage === 'products') {
      return <Products />;
    }
    
    if (user.role === 'admin') {
      return (
        <>
          <Dashboard />
          <ProductsTable />
          <ProductForm />
        </>
      );
    } else {
      return <EmployeeDashboard user={user} />;
    }
  };

  return (
    <>
      <Header onLogout={handleLogout} user={user} onNavigate={handleNavigation} currentPage={currentPage} />
      <div className="container">
        {renderContent()}
      </div>
      <Footer />
    </>
  )
}

export default App

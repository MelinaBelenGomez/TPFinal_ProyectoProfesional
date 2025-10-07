import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ProductsTable from './components/ProductsTable'
import ProductForm from './components/ProductForm'
import Footer from './components/Footer'
import Login from './pages/Login'
import './styles/global.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = (success) => {
    setIsAuthenticated(success)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <>
      <Header onLogout={handleLogout} />
      <div className="container">
        <Dashboard />
        <ProductsTable />
        <ProductForm />
      </div>
      <Footer />
    </>
  )
}

export default App

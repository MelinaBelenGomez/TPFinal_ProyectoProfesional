import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import EmployeeDashboard from './components/EmployeeDashboard'
import ProductsTable from './components/ProductsTable'
import ProductForm from './components/ProductForm'
import Footer from './components/Footer'
import Login from './pages/Login'
import './styles/global.css'

function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user?.isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <>
      <Header onLogout={handleLogout} user={user} />
      <div className="container">
        {user.role === 'admin' ? (
          <>
            <Dashboard />
            <ProductsTable />
            <ProductForm />
          </>
        ) : (
          <EmployeeDashboard user={user} />
        )}
      </div>
      <Footer />
    </>
  )
}

export default App

import { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import AuthService from './services/authService'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import AppRoutes from './routes/AppRoutes'
import './styles/global.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar si hay sesión activa al cargar la app
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const response = await AuthService.validateToken()
        if (response.success) {
          const userData = {
            isAuthenticated: true,
            ...response.data.user
          }
          setUser(userData)
        } else {
          // Token inválido, limpiar datos
          await AuthService.logout()
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      setUser(null)
    } catch (error) {
      console.error('Error en logout:', error)
      setUser(null) // Forzar logout en caso de error
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1 className="logo">FROZEN</h1>
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user?.isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <Header onLogout={handleLogout} user={user} />
      <div className="container">
        <AppRoutes user={user} />
      </div>
      <Footer />
    </BrowserRouter>
  )
}

export default App

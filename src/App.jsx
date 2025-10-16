import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import AppRoutes from './routes/AppRoutes'
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

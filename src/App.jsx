import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ProductsTable from './components/ProductsTable'
import ProductForm from './components/ProductForm'
import Footer from './components/Footer'
import './styles/global.css'

function App() {
  return (
    <>
      <Header />
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

import { useState, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import './styles/home.css'
import './styles/shopcards.css'
import './styles/productcards.css'
import './styles/content.css'
import './styles/features.css'
import './styles/footer.css'
import './styles/login.css'
import './styles/breadcrumbs.css'
import './styles/productdetail.css'
import './styles/products.css'
import './styles/productlist.css'
import './styles/filters.css'
import './styles/cart.css'
import './styles/checkout.css'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Index from './pages/Index'
import Login from './pages/Login'
import Products from './pages/Products'
import ProductList from './pages/ProductList'
import Cart from './components/Cart'

import { useAuthContext } from './hooks/useAuthContext';
import PaymentPage from './pages/PaymentPage'
import CheckoutForm from './pages/CheckoutForm'
import Loading from './components/Loading'


function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate a network request or page load delay
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after 3 seconds
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);
  
  const { user } = useAuthContext()
  user && console.log('logged user', user.email)

  return (
    <>
      {
        loading ? (
          <Loading />
        ) : (
            <div>
              <Navbar />
              <Routes>
                <Route index element={<Index />}/>
                <Route path='login' element={!user ? <Login /> : <Navigate to='/' />}/>
                <Route path='products/:id' element={<Products />}/>
                <Route path='productlist' element={<ProductList />}/>
                <Route path='cart' element={<Cart />}/>
                <Route path='checkout' element={<CheckoutForm />}/>
                <Route path='payment/:orderId' element={<PaymentPage />}/>
              </Routes>
              <Footer />
            </div>
        )
      }
    </>
  )
}

export default App

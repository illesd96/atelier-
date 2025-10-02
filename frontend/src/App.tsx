import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './styles/inputs.css';
import './i18n';
import { CartProvider } from './contexts/CartContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { BookingPage } from './pages/BookingPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentResultPage } from './pages/PaymentResultPage';

function App() {
  return (
    <PrimeReactProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="booking" element={<BookingPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="payment/result" element={<PaymentResultPage />} />
                <Route path="about" element={<div className="p-4"><h1>About Us</h1><p>Coming soon...</p></div>} />
                <Route path="contact" element={<div className="p-4"><h1>Contact</h1><p>Coming soon...</p></div>} />
              </Route>
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </PrimeReactProvider>
  );
}

export default App;



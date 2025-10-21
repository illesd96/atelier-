import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './styles/inputs.css';
import './i18n';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { BookingPage } from './pages/BookingPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentResultPage } from './pages/PaymentResultPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminBookingsPage } from './pages/AdminBookingsPage';
import { AdminSchedulePage } from './pages/AdminSchedulePage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { CookieConsent } from './components/CookieConsent';

function App() {
  return (
    <PrimeReactProvider>
      <ConfigProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="rooms/:roomId" element={<RoomDetailPage />} />
                    <Route path="booking" element={<BookingPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="payment/result" element={<PaymentResultPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="verify-email" element={<EmailVerificationPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="admin/bookings" element={<AdminBookingsPage />} />
                    <Route path="admin/schedule" element={<AdminSchedulePage />} />
                    <Route path="terms" element={<TermsPage />} />
                    <Route path="privacy" element={<PrivacyPage />} />
                    <Route path="faq" element={<FAQPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="blog/:slug" element={<BlogPostPage />} />
                    {/* <Route path="about" element={<div className="p-4"><h1>About Us</h1><p>Coming soon...</p></div>} /> */}
                  </Route>
                </Routes>
                <CookieConsent />
              </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ConfigProvider>
    </PrimeReactProvider>
  );
}

export default App;



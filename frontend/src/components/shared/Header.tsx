import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  const menuItems = [
    { label: t('navigation.home'), href: '/' },
    // { label: t('navigation.blog'), href: '/blog' },
    { label: t('navigation.faq'), href: '/faq' },
    { label: t('navigation.contact'), href: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleBooking = () => {
    navigate('/booking');
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <Link to="/" className="header-logo">
            <span className="logo-text">ATELIER ARCHILLES</span>
          </Link>

          <div className="header-actions">
            <Button
              label={t('navigation.booking')}
              onClick={handleBooking}
              className="booking-button"
              size="small"
            />
            
            {user?.is_admin && (
              <Button
                icon="pi pi-chart-bar"
                onClick={() => navigate('/admin/bookings')}
                className="admin-icon-button"
                size="small"
                text
                tooltip="Admin Dashboard"
                tooltipOptions={{ position: 'bottom' }}
              />
            )}
            
            {isAuthenticated ? (
              <Button
                icon="pi pi-user"
                onClick={() => navigate('/profile')}
                className="profile-icon-button"
                size="small"
                text
              />
            ) : (
              <Button
                icon="pi pi-user"
                onClick={() => navigate('/login')}
                className="login-icon-button"
                size="small"
                text
              />
            )}
            
            <button
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="menu-line"></span>
              <span className="menu-line"></span>
              <span className="menu-line"></span>
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={location.pathname === item.href ? 'active' : ''}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              className="menu-booking-button"
              onClick={handleBooking}
            >
              {t('navigation.booking')}
            </button>
          </li>
          <li className="menu-language-item">
            <LanguageSwitcher />
          </li>
        </ul>
      </div>
    </>
  );
};

export default Header;


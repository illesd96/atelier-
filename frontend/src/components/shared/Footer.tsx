import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            ATELIER ARCHILLES
          </div>
          
          <div className="footer-right">
            <div className="footer-links">
              <Link to="/blog" className="footer-link">
                {t('navigation.blog')}
              </Link>
              <Link to="/faq" className="footer-link">
                {t('navigation.faq')}
              </Link>
              <Link to="/contact" className="footer-link">
                {t('navigation.contact')}
              </Link>
              <Link to="/terms" className="footer-link">
                {t('navigation.terms')}
              </Link>
              <Link to="/privacy" className="footer-link">
                {t('navigation.privacy')}
              </Link>
            </div>
            
            <div className="footer-copyright">
              © {new Date().getFullYear()} Atelier Archilles
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


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
            <img src="/fav/favicon.svg" alt="Logo" className="footer-logo-icon" />
            ATELIER ARCHILLES
          </div>
          
          <div className="footer-right">
            <div className="footer-links">
              {/* <Link to="/blog" className="footer-link">
                {t('navigation.blog')}
              </Link> */}
              <Link to="/faq" className="footer-link">
                {t('navigation.faq')}
              </Link>
              <Link to="/contact" className="footer-link">
                {t('navigation.contact')}
              </Link>
              <a href="/documents/Atelier-Archilles_Terms_and_Conditions_v251028.pdf" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="footer-link">
                {t('navigation.terms')}
              </a>
              <a href="/documents/Atelier-Archilles_Privacy_Policy_v251020.pdf" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="footer-link">
                {t('navigation.privacy')}
              </a>
              <a href="/documents/Atelier-Archilles_Cookie_Policy_v251020.pdf" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="footer-link">
                {t('navigation.cookies')}
              </a>
              <a href="/documents/Atelier-Archilles_Impressum_v251020.pdf" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="footer-link">
                {t('navigation.impressum')}
              </a>
            </div>
            
            <div className="footer-payment">
              <p className="footer-payment-text">{t('footer.securePayment')}</p>
              <img 
                src="/images/barion/barion-smart-payment-banner-EU/barion-banner-lightmode.svg" 
                alt="Barion - Accepted Payment Methods" 
                className="footer-barion-logo" 
              />
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


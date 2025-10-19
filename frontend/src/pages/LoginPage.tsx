import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  
  // Check for return path in sessionStorage or location state
  const returnPath = sessionStorage.getItem('returnPath') || (location.state as any)?.from?.pathname || '/booking';

  useEffect(() => {
    if (isAuthenticated) {
      // Clear return path and navigate
      sessionStorage.removeItem('returnPath');
      navigate(returnPath, { replace: true });
    }
  }, [isAuthenticated, navigate, returnPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowVerificationWarning(false);
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Show verification warning if email is not verified
        if (!result.emailVerified) {
          setShowVerificationWarning(true);
          setLoading(false);
          // Don't navigate immediately, let user see the warning
          setTimeout(() => {
            sessionStorage.removeItem('returnPath');
            navigate(returnPath, { replace: true });
          }, 3000);
        } else {
          // Clear return path and navigate immediately
          sessionStorage.removeItem('returnPath');
          navigate(returnPath, { replace: true });
        }
      } else {
        setError(result.message || t('login.error'));
        setLoading(false);
      }
    } catch (err) {
      setError(t('login.error'));
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    try {
      await api.resendVerification(email, i18n.language);
      alert(t('login.verificationEmailSent'));
    } catch (error) {
      alert(t('login.verificationEmailError'));
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">{t('login.title')}</h1>
          <p className="login-subtitle">{t('login.subtitle')}</p>

          {error && (
            <Message severity="error" text={error} className="w-full mb-4" />
          )}

          {showVerificationWarning && (
            <div className="mb-4">
              <Message 
                severity="warn" 
                text={t('login.emailNotVerified')} 
                className="w-full mb-2" 
              />
              <Button
                type="button"
                label={t('login.resendVerification')}
                onClick={handleResendVerification}
                loading={resendingEmail}
                severity="secondary"
                outlined
                size="small"
                className="w-full"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="email">{t('login.email')}</label>
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
                className="w-full"
                autoFocus
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">{t('login.password')}</label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                required
                feedback={false}
                toggleMask
                className="w-full"
                inputClassName="w-full"
              />
            </div>

            <Button
              type="submit"
              label={loading ? t('login.loggingIn') : t('login.submit')}
              loading={loading}
              className="w-full"
              size="large"
            />
          </form>

          <div className="login-footer">
            <p>
              {t('login.noAccount')}{' '}
              <Link to="/register" className="login-link">
                {t('login.registerLink')}
              </Link>
            </p>
            <p>
              <Link to="/booking" className="login-link">
                {t('login.continueAsGuest')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const from = (location.state as any)?.from?.pathname || '/booking';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || t('login.error'));
      }
    } catch (err) {
      setError(t('login.error'));
    } finally {
      setLoading(false);
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


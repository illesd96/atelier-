import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check for return path in sessionStorage or location state
  const returnPath = sessionStorage.getItem('returnPath') || (location.state as any)?.from?.pathname || '/booking';

  useEffect(() => {
    if (isAuthenticated) {
      // Clear return path and navigate
      sessionStorage.removeItem('returnPath');
      navigate(returnPath, { replace: true });
    }
  }, [isAuthenticated, navigate, returnPath]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('register.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.phone || undefined
      );
      
      if (result.success) {
        if (result.requiresVerification) {
          // Show success message and redirect to login after delay
          alert(result.message || t('register.verificationRequired'));
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 1000);
        } else {
          // Old behavior: auto-login (backward compatibility)
          sessionStorage.removeItem('returnPath');
          navigate(returnPath, { replace: true });
        }
      } else {
        setError(result.message || t('register.error'));
      }
    } catch (err) {
      setError(t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container" style={{ maxWidth: '500px' }}>
        <div className="login-card">
          <h1 className="login-title">{t('register.title')}</h1>
          <p className="login-subtitle">{t('register.subtitle')}</p>

          {error && (
            <Message severity="error" text={error} className="w-full mb-4" />
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="name">{t('register.name')}</label>
              <InputText
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('register.namePlaceholder')}
                required
                className="w-full"
                autoFocus
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">{t('register.email')}</label>
              <InputText
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder={t('register.emailPlaceholder')}
                required
                className="w-full"
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">
                {t('register.phone')} <span style={{ color: '#999' }}>({t('register.optional')})</span>
              </label>
              <InputText
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder={t('register.phonePlaceholder')}
                className="w-full"
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">{t('register.password')}</label>
              <Password
                id="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={t('register.passwordPlaceholder')}
                required
                toggleMask
                className="w-full"
                inputClassName="w-full"
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
              <Password
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder={t('register.confirmPasswordPlaceholder')}
                required
                feedback={false}
                toggleMask
                className="w-full"
                inputClassName="w-full"
              />
            </div>

            <Button
              type="submit"
              label={loading ? t('register.registering') : t('register.submit')}
              loading={loading}
              className="w-full"
              size="large"
            />
          </form>

          <div className="login-footer">
            <p>
              {t('register.hasAccount')}{' '}
              <Link to="/login" className="login-link">
                {t('register.loginLink')}
              </Link>
            </p>
            <p>
              <Link to="/booking" className="login-link">
                {t('register.continueAsGuest')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


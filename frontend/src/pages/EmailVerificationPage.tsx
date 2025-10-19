import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { authAPI } from '../services/api';
import './LoginPage.css';

export const EmailVerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage(t('verification.noToken'));
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        
        if (response.success) {
          setStatus('success');
          setMessage(t('verification.success'));
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(t('verification.invalidToken'));
        }
      } catch (error) {
        setStatus('error');
        setMessage(t('verification.error'));
      }
    };

    verifyEmail();
  }, [token, t, navigate]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="text-center mb-4">
            {status === 'verifying' && (
              <>
                <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                <h1 className="login-title mt-3">{t('verification.title')}</h1>
                <p className="login-subtitle">{t('verification.verifying')}</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <i className="pi pi-check-circle text-6xl text-green-500 mb-3"></i>
                <h1 className="login-title">{t('verification.successTitle')}</h1>
                <Message
                  severity="success"
                  text={message}
                  className="w-full mb-4"
                />
                <p className="text-sm text-gray-600">{t('verification.redirecting')}</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <i className="pi pi-times-circle text-6xl text-red-500 mb-3"></i>
                <h1 className="login-title">{t('verification.errorTitle')}</h1>
                <Message
                  severity="error"
                  text={message}
                  className="w-full mb-4"
                />
                <Button
                  label={t('verification.goToLogin')}
                  onClick={handleGoToLogin}
                  className="w-full mt-3"
                  size="large"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const { t } = useTranslation();

  return (
    <Card className="studio-grid-container">
      <div className="text-center p-4">
        <i className="pi pi-exclamation-triangle text-6xl text-red-500 mb-3"></i>
        <h3 className="text-red-500 mb-3">{t('common.error')}</h3>
        <p className="mb-4">{error}</p>
        <Button 
          label={t('common.tryAgain')} 
          onClick={onRetry}
          severity="secondary"
        />
      </div>
    </Card>
  );
};









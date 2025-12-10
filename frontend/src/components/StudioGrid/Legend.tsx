import React from 'react';
import { useTranslation } from 'react-i18next';

export const Legend: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 border-round">
      <div className="flex align-items-center gap-1">
        <div className="slot-legend slot-available"></div>
        <span className="text-sm">{t('booking.available')}</span>
      </div>
      <div className="flex align-items-center gap-1">
        <div className="slot-legend slot-booked"></div>
        <span className="text-sm">{t('booking.booked')}</span>
      </div>
      <div className="flex align-items-center gap-1">
        <div className="slot-legend slot-selected"></div>
        <span className="text-sm">{t('booking.selected')}</span>
      </div>
      <div className="flex align-items-center gap-1">
        <div className="slot-legend slot-unavailable"></div>
        <span className="text-sm">{t('booking.unavailable')}</span>
      </div>
    </div>
  );
};












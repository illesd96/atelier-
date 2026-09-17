import React from 'react';
import { useTranslation } from 'react-i18next';
import { Studio } from './types';

interface GridHeaderProps {
  studios: Studio[];
  hourlyRate: number;
}

export const GridHeader: React.FC<GridHeaderProps> = ({ studios, hourlyRate }) => {
  const { t } = useTranslation();

  return (
    <div className="grid-header">
      <div className="time-column-header">{t('common.time')}</div>
      {studios.map(studio => {
        // The makeup rooms are sold per half hour, the studios per hour
        const unit = (studio.slotMinutes ?? 60) < 60
          ? t('booking.slotUnitHalfHour')
          : t('booking.slotUnitHour');
        return (
          <div key={studio.id} className="studio-header">
            <h4>{t(`booking.studios.${studio.id}`, studio.name)}</h4>
            <small>
              {(studio.price ?? hourlyRate).toLocaleString()} {t('common.currency')}/{unit}
            </small>
          </div>
        );
      })}
    </div>
  );
};

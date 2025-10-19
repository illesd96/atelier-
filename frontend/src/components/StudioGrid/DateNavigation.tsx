import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { format, isToday, isTomorrow } from 'date-fns';
import { hu, enUS } from 'date-fns/locale';
import { getMinSelectableDate, getMaxSelectableDate } from './../../utils/timezone';

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  onDateChange,
  onPreviousDay,
  onNextDay,
  onToday,
}) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'hu' ? hu : enUS;

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) {
      return t('booking.today');
    }
    if (isTomorrow(date)) {
      return t('booking.tomorrow');
    }
    return format(date, 'EEEE, MMMM d', { locale: dateLocale });
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      onDateChange(date);
    }
  };

  return (
    <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4">
      <div className="flex align-items-center gap-2 mb-3 md:mb-0">
        <Button 
          icon="pi pi-chevron-left" 
          onClick={onPreviousDay}
          severity="secondary"
          outlined
          size="small"
        />
        <h2 className="text-xl font-semibold mx-3">
          {formatDateHeader(selectedDate)}
        </h2>
        <Button 
          icon="pi pi-chevron-right" 
          onClick={onNextDay}
          severity="secondary"
          outlined
          size="small"
        />
      </div>
      
      <div className="flex align-items-center gap-2">
        <Button 
          label={t('booking.today')}
          onClick={onToday}
          severity="secondary"
          outlined
          size="small"
          disabled={isToday(selectedDate)}
        />
        <Calendar
          value={selectedDate}
          onChange={(e) => handleDateChange(e.value as Date)}
          showIcon
          icon="pi pi-calendar"
          dateFormat="yy-mm-dd"
          minDate={getMinSelectableDate()}
          maxDate={getMaxSelectableDate()}
          className="date-picker-with-icon"
        />
      </div>
    </div>
  );
};






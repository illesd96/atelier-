import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'primereact/dropdown';
import './LanguageSwitcher.css';

const languages = [
  { label: 'EN', value: 'en' },
  { label: 'HU', value: 'hu' },
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: { value: string }) => {
    i18n.changeLanguage(e.value);
  };

  return (
    <Dropdown
      value={i18n.language}
      options={languages}
      onChange={handleLanguageChange}
      className="language-switcher-compact"
    />
  );
};

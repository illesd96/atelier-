import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LegalPages.css';

interface FAQItemProps {
  question: string;
  answer: string | string[];
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  const renderAnswer = () => {
    if (Array.isArray(answer)) {
      return (
        <ul>
          {answer.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    return <p>{answer}</p>;
  };

  return (
    <div className="faq-item">
      <button 
        className={`faq-question ${isOpen ? 'active' : ''}`}
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <span className="faq-icon">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="faq-answer">
          {renderAnswer()}
        </div>
      )}
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = [
    {
      question: t('faq.questions.booking.question'),
      answer: t('faq.questions.booking.answer', { returnObjects: true }) as string[],
    },
    {
      question: t('faq.questions.modify.question'),
      answer: t('faq.questions.modify.answer'),
    },
    {
      question: t('faq.questions.refund.question'),
      answer: t('faq.questions.refund.answer'),
    },
    {
      question: t('faq.questions.arrival.question'),
      answer: t('faq.questions.arrival.answer', { returnObjects: true }) as string[],
    },
    {
      question: t('faq.questions.duration.question'),
      answer: t('faq.questions.duration.answer'),
    },
    {
      question: t('faq.questions.equipment.question'),
      answer: t('faq.questions.equipment.answer', { returnObjects: true }) as string[],
    },
    {
      question: t('faq.questions.leaving.question'),
      answer: t('faq.questions.leaving.answer', { returnObjects: true }) as string[],
    },
    {
      question: t('faq.questions.usage.question'),
      answer: t('faq.questions.usage.answer', { returnObjects: true }) as string[],
    },
    // {
    //   question: t('faq.questions.pets.question'),
    //   answer: t('faq.questions.pets.answer', { returnObjects: true }) as string[],
    // },
    {
      question: t('faq.questions.steamer.question'),
      answer: t('faq.questions.steamer.answer'),
    },
    // {
    //   question: t('faq.questions.changing.question'),
    //   answer: t('faq.questions.changing.answer'),
    // },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>{t('faq.title')}</h1>
        <p className="faq-subtitle">{t('faq.subtitle')}</p>

        <div className="faq-list">
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


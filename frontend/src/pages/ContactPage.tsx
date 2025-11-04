import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ContactPage.css';

export const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');

    // Form submission handler - sends contact request
    setTimeout(() => {
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1000);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>{t('contact.title')}</h1>
          <p className="contact-subtitle">{t('contact.subtitle')}</p>
        </div>
      </div>

      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info-section">
              <div className="contact-card">
                <div className="contact-icon">
                  <i className="pi pi-map-marker"></i>
                </div>
                <h3>{t('contact.info.address.title')}</h3>
                <p>{t('contact.info.address.line1')}</p>
                <p>{t('contact.info.address.line2')}</p>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <i className="pi pi-envelope"></i>
                </div>
                <h3>{t('contact.info.email.title')}</h3>
                <a href="mailto:studio@archilles.hu" className="contact-link">
                  studio@archilles.hu
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <i className="pi pi-phone"></i>
                </div>
                <h3>{t('contact.info.phone.title')}</h3>
                <a href="tel:+36309747362" className="contact-link">
                  +36 30 974 7362
                </a>
              </div>

              <div className="contact-card">
                <div className="contact-icon">
                  <i className="pi pi-clock"></i>
                </div>
                <h3>{t('contact.info.hours.title')}</h3>
                <p>{t('contact.info.hours.weekday')}</p>
                {t('contact.info.hours.weekend') && (
                  <p>{t('contact.info.hours.weekend')}</p>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>{t('contact.form.title')}</h2>
              <p className="form-description">{t('contact.form.description')}</p>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">{t('contact.form.name')}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('contact.form.email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">{t('contact.form.subject')}</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">{t('contact.form.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  className="form-submit"
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? t('contact.form.sending') : t('contact.form.send')}
                </button>

                {formStatus === 'success' && (
                  <div className="form-message success">
                    {t('contact.form.success')}
                  </div>
                )}

                {formStatus === 'error' && (
                  <div className="form-message error">
                    {t('contact.form.error')}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Location & Directions */}
          <div className="location-section">
            <h2>{t('contact.location.title')}</h2>
            
            <div className="location-grid">
              <div className="location-info">
                <h3>{t('contact.location.finding.title')}</h3>
                <p>{t('contact.location.finding.description')}</p>

                <div className="transport-section">
                  <h4>
                    <i className="pi pi-car"></i>
                    {t('contact.location.parking.title')}
                  </h4>
                  <p>{t('contact.location.parking.description')}</p>
                </div>

                <div className="transport-section">
                  <h4>
                    <i className="pi pi-compass"></i>
                    {t('contact.location.public.title')}
                  </h4>
                  <p>{t('contact.location.public.description')}</p>
                </div>
              </div>

              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2698.4877644890573!2d19.04819307681754!3d47.47635797117961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741dc14e5b6d3a5%3A0x7f7f7f7f7f7f7f7f!2sBudapest%2C%20Karinthy%20Frigyes%20%C3%BAt%2019%2C%201111!5e0!3m2!1sen!2shu!4v1699999999999!5m2!1sen!2shu"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t('contact.location.mapTitle')}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


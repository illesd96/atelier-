import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { blogPosts } from '../data/blogPosts';
import './BlogPage.css';

export const BlogPage: React.FC = () => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="blog-page">
      <div className="blog-hero">
        <div className="container">
          <h1>{t('blog.title')}</h1>
          <p className="blog-subtitle">{t('blog.subtitle')}</p>
        </div>
      </div>

      <div className="blog-content">
        <div className="container">
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <Link 
                to={`/blog/${post.slug}`} 
                key={post.id} 
                className="blog-card"
              >
                <div className="blog-card-image">
                  <img src={post.image} alt={t(post.titleKey)} />
                  <div className="blog-card-category">{post.category}</div>
                </div>
                <div className="blog-card-content">
                  <div className="blog-card-date">{formatDate(post.date)}</div>
                  <h2 className="blog-card-title">{t(post.titleKey)}</h2>
                  <p className="blog-card-excerpt">{t(post.excerptKey)}</p>
                  <span className="blog-card-link">
                    {t('blog.readMore')} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { blogPosts } from '../data/blogPosts';
import './BlogPostPage.css';

export const BlogPostPage: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const currentIndex = blogPosts.findIndex(p => p.slug === slug);
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;

  // Split content into paragraphs for better rendering
  const contentParts = t(post.contentKey, { returnObjects: true }) as string[];

  return (
    <div className="blog-post-page">
      <div className="blog-post-header">
        <div className="container-narrow">
          <Link to="/blog" className="blog-post-back">
            ← {t('blog.backToBlog')}
          </Link>
          <div className="blog-post-meta">
            <span className="blog-post-category">{post.category}</span>
            <span className="blog-post-date">{formatDate(post.date)}</span>
          </div>
          <h1 className="blog-post-title">{t(post.titleKey)}</h1>
        </div>
      </div>

      <div className="blog-post-image">
        <img src={post.image} alt={t(post.titleKey)} />
      </div>

      <div className="blog-post-content">
        <div className="container-narrow">
          <div className="blog-post-body">
            {Array.isArray(contentParts) ? (
              contentParts.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p>{contentParts}</p>
            )}
          </div>
        </div>
      </div>

      <div className="blog-post-navigation">
        <div className="container-narrow">
          <div className="post-nav-grid">
            {prevPost ? (
              <Link to={`/blog/${prevPost.slug}`} className="post-nav-card prev">
                <span className="post-nav-label">← {t('blog.previousPost')}</span>
                <span className="post-nav-title">{t(prevPost.titleKey)}</span>
              </Link>
            ) : (
              <div></div>
            )}
            
            {nextPost && (
              <Link to={`/blog/${nextPost.slug}`} className="post-nav-card next">
                <span className="post-nav-label">{t('blog.nextPost')} →</span>
                <span className="post-nav-title">{t(nextPost.titleKey)}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


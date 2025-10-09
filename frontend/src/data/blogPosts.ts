export interface BlogPost {
  id: string;
  slug: string;
  titleKey: string;
  excerptKey: string;
  contentKey: string;
  date: string;
  image: string;
  category: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'how-to-prepare-for-photoshoot',
    titleKey: 'blog.posts.prepare.title',
    excerptKey: 'blog.posts.prepare.excerpt',
    contentKey: 'blog.posts.prepare.content',
    date: '2025-01-15',
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=600&fit=crop',
    category: 'Tips'
  },
  {
    id: '2',
    slug: 'posing-guide-for-portraits',
    titleKey: 'blog.posts.posing.title',
    excerptKey: 'blog.posts.posing.excerpt',
    contentKey: 'blog.posts.posing.content',
    date: '2025-01-08',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=600&fit=crop',
    category: 'Guides'
  },
  {
    id: '3',
    slug: 'what-to-wear-photoshoot',
    titleKey: 'blog.posts.outfit.title',
    excerptKey: 'blog.posts.outfit.excerpt',
    contentKey: 'blog.posts.outfit.content',
    date: '2024-12-20',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop',
    category: 'Style'
  },
  {
    id: '4',
    slug: 'studio-lighting-basics',
    titleKey: 'blog.posts.lighting.title',
    excerptKey: 'blog.posts.lighting.excerpt',
    contentKey: 'blog.posts.lighting.content',
    date: '2024-12-10',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
    category: 'Technical'
  },
  {
    id: '5',
    slug: 'choosing-right-photographer',
    titleKey: 'blog.posts.choosing.title',
    excerptKey: 'blog.posts.choosing.excerpt',
    contentKey: 'blog.posts.choosing.content',
    date: '2024-11-25',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop',
    category: 'Guides'
  },
  {
    id: '6',
    slug: 'brand-photography-tips',
    titleKey: 'blog.posts.branding.title',
    excerptKey: 'blog.posts.branding.excerpt',
    contentKey: 'blog.posts.branding.content',
    date: '2024-11-15',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
    category: 'Business'
  }
];


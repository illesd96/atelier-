// Meta (Facebook) Pixel Tracking Utility

declare global {
  interface Window {
    fbq: any;
  }
}

interface ContentItem {
  id: string;
  quantity: number;
}

interface ProductItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

class MetaPixel {
  /**
   * Check if pixel is ready
   * Note: Pixel is initialized in index.html
   */
  private isReady(): boolean {
    const ready = typeof window !== 'undefined' && typeof window.fbq === 'function';
    
    if (!ready && process.env.NODE_ENV === 'development') {
      console.warn('[Meta Pixel] Not ready - fbq function not found');
    }
    
    return ready;
  }

  /**
   * Track page view (automatically called in index.html, but can be called manually for SPA navigation)
   */
  trackPageView() {
    if (!this.isReady()) return;

    try {
      window.fbq('track', 'PageView');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Meta Pixel] Failed to track page view:', error);
      }
    }
  }

  /**
   * Track content view (e.g., viewing a studio/room page)
   */
  trackViewContent(contentId: string, contentName: string, contentCategory: string = 'Studio', value?: number) {
    if (!this.isReady()) return;

    try {
      window.fbq('track', 'ViewContent', {
        content_ids: [contentId],
        content_name: contentName,
        content_category: contentCategory,
        content_type: 'product',
        currency: 'HUF',
        value: value || 0,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Meta Pixel] Failed to track view content:', error);
      }
    }
  }

  /**
   * Track add to cart event
   */
  trackAddToCart(items: ProductItem[]) {
    if (!this.isReady()) return;

    try {
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const contentIds = items.map(item => item.id);
      const contents: ContentItem[] = items.map(item => ({
        id: item.id,
        quantity: item.quantity,
      }));

      window.fbq('track', 'AddToCart', {
        content_ids: contentIds,
        contents: contents,
        content_type: 'product',
        currency: 'HUF',
        value: total,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Meta Pixel] Failed to track add to cart:', error);
      }
    }
  }

  /**
   * Track initiate checkout event
   */
  trackInitiateCheckout(items: ProductItem[], total: number) {
    if (!this.isReady()) return;

    try {
      const contentIds = items.map(item => item.id);
      const contents: ContentItem[] = items.map(item => ({
        id: item.id,
        quantity: item.quantity,
      }));
      const numItems = items.reduce((sum, item) => sum + item.quantity, 0);

      window.fbq('track', 'InitiateCheckout', {
        content_ids: contentIds,
        contents: contents,
        content_type: 'product',
        currency: 'HUF',
        value: total,
        num_items: numItems,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Meta Pixel] Failed to track initiate checkout:', error);
      }
    }
  }

  /**
   * Track purchase/conversion event (on successful payment)
   */
  trackPurchase(orderId: string, items: ProductItem[], total: number) {
    if (!this.isReady()) return;

    try {
      const contentIds = items.map(item => item.id);
      const contents: ContentItem[] = items.map(item => ({
        id: item.id,
        quantity: item.quantity,
      }));
      const numItems = items.reduce((sum, item) => sum + item.quantity, 0);

      window.fbq('track', 'Purchase', {
        content_ids: contentIds,
        contents: contents,
        content_type: 'product',
        currency: 'HUF',
        value: total,
        num_items: numItems,
        order_id: orderId,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Meta Pixel] Failed to track purchase:', error);
      }
    }
  }

  /**
   * Track lead event (e.g., contact form submission, registration)
   */
  trackLead(value?: number, contentName?: string) {
    if (!this.isReady()) return;

    try {
      window.fbq('track', 'Lead', {
        currency: 'HUF',
        value: value || 0,
        content_name: contentName,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Meta Pixel] Failed to track lead:', error);
      }
    }
  }

  /**
   * Track registration complete event
   */
  trackCompleteRegistration() {
    if (!this.isReady()) return;

    try {
      window.fbq('track', 'CompleteRegistration', {
        status: 'success',
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Meta Pixel] Failed to track registration:', error);
      }
    }
  }

  /**
   * Track schedule/booking event (custom event for appointment booking)
   */
  trackSchedule(contentId: string, contentName: string, value: number) {
    if (!this.isReady()) return;

    try {
      window.fbq('track', 'Schedule', {
        content_ids: [contentId],
        content_name: contentName,
        content_type: 'product',
        currency: 'HUF',
        value: value,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Meta Pixel] Failed to track schedule:', error);
      }
    }
  }

  /**
   * Track custom event
   */
  trackCustomEvent(eventName: string, data: Record<string, any> = {}) {
    if (!this.isReady()) return;

    try {
      window.fbq('trackCustom', eventName, {
        currency: 'HUF',
        ...data,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[Meta Pixel] Failed to track custom event ${eventName}:`, error);
      }
    }
  }
}

// Export singleton instance
export const metaPixel = new MetaPixel();


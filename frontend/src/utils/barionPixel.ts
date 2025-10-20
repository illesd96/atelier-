// Barion Pixel Tracking Utility

declare global {
  interface Window {
    bp: any;
  }
}

class BarionPixel {
  private pixelId: string | null = null;
  private initialized: boolean = false;

  constructor() {
    this.pixelId = import.meta.env.VITE_BARION_PIXEL_ID || null;
    this.initialize();
  }

  /**
   * Initialize Barion Pixel
   */
  private initialize() {
    if (!this.pixelId) {
      console.warn('⚠️ Barion Pixel ID not configured');
      return;
    }

    if (typeof window === 'undefined' || !window.bp) {
      console.warn('⚠️ Barion Pixel script not loaded');
      return;
    }

    try {
      window.bp('init', 'addBarionPixelId', this.pixelId);
      this.initialized = true;
      console.log('✅ Barion Pixel initialized:', this.pixelId);
    } catch (error) {
      console.error('❌ Failed to initialize Barion Pixel:', error);
    }
  }

  /**
   * Check if pixel is ready
   */
  private isReady(): boolean {
    return this.initialized && typeof window !== 'undefined' && !!window.bp;
  }

  /**
   * Track page view
   */
  trackPageView() {
    if (!this.isReady()) return;

    try {
      window.bp('track', 'contentView');
      console.log('📊 Barion Pixel: Page view tracked');
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  /**
   * Track product view (booking page)
   */
  trackProductView(productId: string, productName: string) {
    if (!this.isReady()) return;

    try {
      window.bp('track', 'contentView', {
        contentType: 'Product',
        currency: 'HUF',
        id: productId,
        name: productName,
      });
      console.log('📊 Barion Pixel: Product view tracked:', productName);
    } catch (error) {
      console.error('Failed to track product view:', error);
    }
  }

  /**
   * Track add to cart
   */
  trackAddToCart(items: Array<{ id: string; name: string; quantity: number; price: number }>) {
    if (!this.isReady()) return;

    try {
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      window.bp('track', 'addToCart', {
        currency: 'HUF',
        contentType: 'Product',
        contents: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
        value: total,
      });
      console.log('📊 Barion Pixel: Add to cart tracked');
    } catch (error) {
      console.error('Failed to track add to cart:', error);
    }
  }

  /**
   * Track checkout initiation
   */
  trackInitiateCheckout(items: Array<{ id: string; name: string; quantity: number; price: number }>, total: number) {
    if (!this.isReady()) return;

    try {
      window.bp('track', 'initiateCheckout', {
        currency: 'HUF',
        contentType: 'Product',
        contents: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
        value: total,
      });
      console.log('📊 Barion Pixel: Checkout initiated');
    } catch (error) {
      console.error('Failed to track checkout:', error);
    }
  }

  /**
   * Track purchase (payment success)
   */
  trackPurchase(orderId: string, items: Array<{ id: string; name: string; quantity: number; price: number }>, total: number) {
    if (!this.isReady()) return;

    try {
      window.bp('track', 'purchase', {
        currency: 'HUF',
        contentType: 'Product',
        contents: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
        revenue: total,
        step: 3,
        id: orderId,
      });
      console.log('📊 Barion Pixel: Purchase tracked:', orderId);
    } catch (error) {
      console.error('Failed to track purchase:', error);
    }
  }

  /**
   * Track custom event
   */
  trackCustomEvent(eventName: string, data: any = {}) {
    if (!this.isReady()) return;

    try {
      window.bp('track', 'customEvent', {
        eventCategory: 'Booking',
        eventAction: eventName,
        ...data,
      });
      console.log('📊 Barion Pixel: Custom event tracked:', eventName);
    } catch (error) {
      console.error('Failed to track custom event:', error);
    }
  }
}

// Export singleton instance
export const barionPixel = new BarionPixel();


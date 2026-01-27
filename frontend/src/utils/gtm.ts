// Google Tag Manager utilities

// Declare dataLayer on window
declare global {
  interface Window {
    dataLayer: any[];
  }
}

/**
 * Push a page view event to GTM
 */
export const pushPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'pageview',
      page: {
        url: url,
        title: title || document.title,
      },
    });
    
    console.log('GTM PageView:', { url, title: title || document.title });
  }
};

/**
 * Push a custom event to GTM
 */
export const pushEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...eventData,
    });
    
    console.log('GTM Event:', eventName, eventData);
  }
};

/**
 * Track booking started
 */
export const trackBookingStarted = (roomId: string, roomName: string) => {
  pushEvent('booking_started', {
    room_id: roomId,
    room_name: roomName,
  });
};

/**
 * Track checkout started
 */
export const trackCheckoutStarted = (value: number, items: any[]) => {
  pushEvent('begin_checkout', {
    value: value,
    currency: 'HUF',
    items: items,
  });
};

/**
 * Track purchase
 */
export const trackPurchase = (orderId: string, value: number, items: any[]) => {
  pushEvent('purchase', {
    transaction_id: orderId,
    value: value,
    currency: 'HUF',
    items: items,
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = (itemId: string, itemName: string, price: number) => {
  pushEvent('add_to_cart', {
    value: price,
    currency: 'HUF',
    items: [{
      item_id: itemId,
      item_name: itemName,
      price: price,
    }],
  });
};

// Barion Pixel Tracking
(function() {
  // Get pixel ID from meta tag
  const pixelMeta = document.querySelector('meta[name="barion-pixel-id"]');
  if (!pixelMeta) {
    console.warn('Barion Pixel ID not found');
    return;
  }

  const pixelId = pixelMeta.content;
  if (!pixelId) {
    console.warn('Barion Pixel ID is empty');
    return;
  }

  // Initialize Barion Pixel
  window.bp = window.bp || function() {
    (window.bp.q = window.bp.q || []).push(arguments);
  };
  window.bp.l = 1 * new Date();

  // Load Barion Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://pixel.barion.com/bp.js';
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(script, firstScript);

  // Initialize with pixel ID
  window.bp('init', 'addBarionPixelId', pixelId);
  
  console.log('✅ Barion Pixel initialized:', pixelId);
})();


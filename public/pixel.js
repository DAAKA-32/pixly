/**
 * ===========================================
 * PIXLY - Tracking Pixel
 * Version: 1.0.0
 * ===========================================
 *
 * Installation:
 * <script src="https://your-domain.com/pixel.js" data-pixel-id="TRK_xxxxx" async></script>
 */

(function() {
  'use strict';

  // Configuration
  var PIXEL_ID = document.currentScript?.dataset?.pixelId || '';
  var BASE_URL = document.currentScript?.dataset?.endpoint || window.location.origin;
  var ENDPOINT = BASE_URL + '/api/track';
  var SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  var COOKIE_EXPIRY = 365; // days

  // Prevent double initialization
  if (window.Pixly) {
    console.warn('[Pixly] Already initialized');
    return;
  }

  // ===========================================
  // UTILITIES
  // ===========================================

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
  }

  function getUrlParam(param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  // ===========================================
  // FIRST PARTY ID
  // ===========================================

  function getFPID() {
    var fpid = getCookie('_trk_fpid');
    if (!fpid) {
      fpid = generateUUID();
      setCookie('_trk_fpid', fpid, COOKIE_EXPIRY);
    }
    return fpid;
  }

  // ===========================================
  // SESSION MANAGEMENT
  // ===========================================

  function getSessionId() {
    var sessionId = getCookie('_trk_sid');
    var lastActivity = getCookie('_trk_last');
    var now = Date.now();

    // Check if session expired
    if (!sessionId || !lastActivity || (now - parseInt(lastActivity)) > SESSION_TIMEOUT) {
      sessionId = generateUUID();
      setCookie('_trk_sid', sessionId, 1); // 1 day max
    }

    // Update last activity
    setCookie('_trk_last', now.toString(), 1);

    return sessionId;
  }

  // ===========================================
  // CLICK ID CAPTURE
  // ===========================================

  function captureClickIds() {
    var clickIds = {
      gclid: getUrlParam('gclid'),
      fbclid: getUrlParam('fbclid'),
      ttclid: getUrlParam('ttclid'),
      li_fat_id: getUrlParam('li_fat_id'),
      msclkid: getUrlParam('msclkid'),
      utm_source: getUrlParam('utm_source'),
      utm_medium: getUrlParam('utm_medium'),
      utm_campaign: getUrlParam('utm_campaign'),
      utm_content: getUrlParam('utm_content'),
      utm_term: getUrlParam('utm_term')
    };

    // Store click IDs in cookies for attribution
    Object.keys(clickIds).forEach(function(key) {
      if (clickIds[key]) {
        setCookie('_trk_' + key, clickIds[key], 30); // 30 days
      }
    });

    return clickIds;
  }

  function getStoredClickIds() {
    return {
      gclid: getCookie('_trk_gclid'),
      fbclid: getCookie('_trk_fbclid'),
      ttclid: getCookie('_trk_ttclid'),
      li_fat_id: getCookie('_trk_li_fat_id'),
      msclkid: getCookie('_trk_msclkid'),
      utm_source: getCookie('_trk_utm_source'),
      utm_medium: getCookie('_trk_utm_medium'),
      utm_campaign: getCookie('_trk_utm_campaign'),
      utm_content: getCookie('_trk_utm_content'),
      utm_term: getCookie('_trk_utm_term')
    };
  }

  // ===========================================
  // DEVICE & CONTEXT
  // ===========================================

  function getDeviceType() {
    var ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function getBrowser() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('SamsungBrowser') > -1) return 'Samsung';
    if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
    if (ua.indexOf('Trident') > -1) return 'IE';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    return 'Unknown';
  }

  function getOS() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'MacOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('like Mac') > -1) return 'iOS';
    return 'Unknown';
  }

  function getContext() {
    return {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      ip: '', // Will be captured server-side
      country: null,
      city: null,
      device: {
        type: getDeviceType(),
        os: getOS(),
        browser: getBrowser(),
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      }
    };
  }

  // ===========================================
  // EVENT TRACKING
  // ===========================================

  function sendEvent(eventName, properties) {
    if (!PIXEL_ID) {
      console.warn('[Pixly] No pixel ID configured');
      return;
    }

    var payload = {
      pixelId: PIXEL_ID,
      event: eventName,
      properties: properties || {},
      fpid: getFPID(),
      sessionId: getSessionId(),
      clickIds: getStoredClickIds(),
      context: getContext(),
      timestamp: Date.now(),
      hashedEmail: getCookie('_trk_hem')
    };

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(ENDPOINT, blob);
    } else {
      // Fallback to fetch
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function(err) {
        console.error('[Pixly] Failed to send event:', err);
      });
    }
  }

  // ===========================================
  // PUBLIC API
  // ===========================================

  window.Pixly = {
    // Track custom event
    track: function(eventName, properties) {
      sendEvent(eventName, properties);
    },

    // Identify user by email
    identify: function(email) {
      if (!email) return;
      var normalized = email.toLowerCase().trim();
      var hashed = simpleHash(normalized);
      setCookie('_trk_hem', hashed, COOKIE_EXPIRY);
      sendEvent('identify', { hashedEmail: hashed });
    },

    // Track page view
    pageview: function(properties) {
      sendEvent('page_view', properties);
    },

    // Track lead
    lead: function(properties) {
      sendEvent('lead', properties);
    },

    // Track purchase
    purchase: function(value, currency, properties) {
      sendEvent('purchase', {
        value: value,
        currency: currency || 'USD',
        ...properties
      });
    },

    // Track add to cart
    addToCart: function(value, currency, properties) {
      sendEvent('add_to_cart', {
        value: value,
        currency: currency || 'USD',
        ...properties
      });
    },

    // Track checkout initiation
    initiateCheckout: function(value, currency, properties) {
      sendEvent('initiate_checkout', {
        value: value,
        currency: currency || 'USD',
        ...properties
      });
    },

    // Get first-party ID
    getFPID: function() {
      return getFPID();
    },

    // Get session ID
    getSessionId: function() {
      return getSessionId();
    }
  };

  // ===========================================
  // AUTO-INITIALIZATION
  // ===========================================

  // Capture click IDs on page load
  captureClickIds();

  // Auto-track page view
  if (document.readyState === 'complete') {
    sendEvent('page_view');
  } else {
    window.addEventListener('load', function() {
      sendEvent('page_view');
    });
  }

  // Track on SPA navigation
  var originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    sendEvent('page_view');
  };

  window.addEventListener('popstate', function() {
    sendEvent('page_view');
  });

  console.log('[Pixly] Initialized with pixel ID:', PIXEL_ID);

})();

/**
 * Standalone First-Party Custom Analytics Tracker SDK
 */
const STORAGE_KEYS = {
  VISITOR_ID: '_at_vid',
  SESSION_ID: '_at_sid',
  UTM_PARAMS: '_at_utm',
};

const IMMEDIATE_EVENTS = [
  'page_view',
  'add_to_cart',
  'remove_from_cart',
  'view_cart',
  'begin_checkout',
  'add_payment_info',
  'purchase',
  'search',
  'signup',
  'login',
];

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function getOS() {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent || '';
  if (ua.indexOf('Win') !== -1) return 'Windows';
  if (ua.indexOf('Mac') !== -1) return 'MacOS';
  if (ua.indexOf('Linux') !== -1) return 'Linux';
  if (ua.indexOf('Android') !== -1) return 'Android';
  if (ua.indexOf('like Mac') !== -1) return 'iOS';
  return 'Unknown';
}

function getBrowser() {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent || '';
  if (ua.indexOf('Edg') !== -1) return 'Edge';
  if (ua.indexOf('Chrome') !== -1) return 'Chrome';
  if (ua.indexOf('Safari') !== -1) return 'Safari';
  if (ua.indexOf('Firefox') !== -1) return 'Firefox';
  if (ua.indexOf('MSIE') !== -1 || !!document.documentMode) return 'IE';
  return 'Unknown';
}

function getExternalReferrer() {
  if (typeof window === 'undefined' || !document.referrer) return null;
  try {
    const refUrl = new URL(document.referrer);
    if (refUrl.hostname === window.location.hostname) {
      return null;
    }
    return document.referrer;
  } catch (e) {
    return null;
  }
}

class AhmedTrackerSDK {
  constructor() {
    this.endpoint = '';
    this.initialized = false;
    this.queue = [];
    this.timer = null;
    this.visitorId = null;
    this.sessionId = null;
    this.utmParams = {};
    this.lastPageUrl = '';
    this.pageStartTime = Date.now();
    this.trackedScrollDepths = new Set();
    this.isDev = false;
  }

  init(endpoint) {
    if (typeof window === 'undefined' || this.initialized) return;

    this.endpoint = endpoint;
    this.initialized = true;
    this.isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // 1. Visitor ID (localStorage)
    let vid = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
    if (!vid) {
      vid = generateUUID();
      localStorage.setItem(STORAGE_KEYS.VISITOR_ID, vid);
    }
    this.visitorId = vid;

    // 2. Session ID (sessionStorage)
    let sid = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
    let isNewSession = false;
    if (!sid) {
      sid = generateUUID();
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, sid);
      isNewSession = true;
    }
    this.sessionId = sid;

    // 3. UTM Params auto-capture & persistence
    this.captureUtmParams();

    // 4. Batching timer (flush every 5s)
    this.timer = setInterval(() => this.flush(), 5000);

    // 5. Global listeners
    this.attachEventListeners();

    this.initialized = true;

    if (isNewSession) {
      this.track('session_start');
    }

    // Auto-track initial page view
    this.handlePageView();
  }

  captureUtmParams() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      let foundNew = false;
      const currentUtm = {};

      utmKeys.forEach((key) => {
        const val = urlParams.get(key);
        if (val) {
          currentUtm[key] = val;
          foundNew = true;
        }
      });

      // ---- Auto-Detect Google Ads (gclid / gad_source / gad_campaignid) ----
      const gclid = urlParams.get('gclid');
      const gadSource = urlParams.get('gad_source');
      const gadCampaignId = urlParams.get('gad_campaignid');

      if (!currentUtm.utm_source && (gclid || gadSource || gadCampaignId)) {
        currentUtm.utm_source = 'google';
        foundNew = true;
      }

      if (!currentUtm.utm_medium) {
        if (gadSource === '1' || (!gadSource && gclid)) {
          currentUtm.utm_medium = 'cpc'; // Google Paid Search / Shopping Sponsored
          foundNew = true;
        } else if (gadSource === '2') {
          currentUtm.utm_medium = 'video'; // YouTube Video Ads
          foundNew = true;
        } else if (gadSource === '5') {
          currentUtm.utm_medium = 'display'; // Google Display Network Banner Ads
          foundNew = true;
        } else if (gadSource === '6') {
          currentUtm.utm_medium = 'shopping'; // Google Shopping Listings
          foundNew = true;
        }
      }

      if (!currentUtm.utm_campaign && gadCampaignId) {
        currentUtm.utm_campaign = gadCampaignId;
        foundNew = true;
      }

      // ---- Auto-Detect Organic Search (e.g. google.com referrer without ad click) ----
      if (!foundNew && document.referrer) {
        try {
          const refHost = new URL(document.referrer).hostname;
          if (refHost.includes('google.')) {
            currentUtm.utm_source = 'google';
            currentUtm.utm_medium = 'organic';
            foundNew = true;
          } else if (refHost.includes('bing.')) {
            currentUtm.utm_source = 'bing';
            currentUtm.utm_medium = 'organic';
            foundNew = true;
          }
        } catch (e) {}
      }

      if (foundNew) {
        sessionStorage.setItem(STORAGE_KEYS.UTM_PARAMS, JSON.stringify(currentUtm));
        this.utmParams = currentUtm;
      } else {
        const saved = sessionStorage.getItem(STORAGE_KEYS.UTM_PARAMS);
        if (saved) {
          this.utmParams = JSON.parse(saved);
        }
      }
    } catch (e) {
      // ignore storage errors
    }
  }

  attachEventListeners() {
    // SPA navigation monkey-patching
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handlePageView();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handlePageView();
    };

    window.addEventListener('popstate', () => {
      this.handlePageView();
    });

    // Scroll depth listener
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

    // Page unload / visibility change listener for time_on_page & final flush
    window.addEventListener('beforeunload', () => {
      this.trackTimeOnPage();
      this.flush(true);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackTimeOnPage();
        this.flush(true);
      }
    });
  }

  normalizeUrl(url) {
    if (!url) return '';
    try {
      const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      let pathname = u.pathname;
      if (pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }
      return `${u.origin}${pathname}${u.search}`;
    } catch (e) {
      return url;
    }
  }

  handlePageView() {
    if (typeof window === 'undefined') return;

    const currentUrl = this.normalizeUrl(window.location.href);
    if (currentUrl && currentUrl === this.lastPageUrl) return;

    if (this.lastPageUrl) {
      this.trackTimeOnPage();
    }

    this.lastPageUrl = currentUrl;
    this.pageStartTime = Date.now();
    this.trackedScrollDepths.clear();

    this.track('page_view', {
      page_url: window.location.href,
      page_title: document.title,
    });
  }

  handleScroll() {
    const winHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (docHeight <= winHeight) return;

    const scrollPercent = Math.round((scrollTop / (docHeight - winHeight)) * 100);
    const thresholds = [25, 50, 75, 100];

    thresholds.forEach((threshold) => {
      if (scrollPercent >= threshold && !this.trackedScrollDepths.has(threshold)) {
        this.trackedScrollDepths.add(threshold);
        this.track('scroll_depth', {
          depth: threshold,
          page_url: window.location.href,
        });
      }
    });
  }

  trackTimeOnPage() {
    if (!this.pageStartTime) return;
    const durationSeconds = Math.round((Date.now() - this.pageStartTime) / 1000);
    if (durationSeconds > 0) {
      this.track('time_on_page', {
        duration_seconds: durationSeconds,
        page_url: this.lastPageUrl || window.location.href,
      });
    }
    this.pageStartTime = Date.now();
  }

  track(eventName, eventData = {}) {
    if (!this.initialized && typeof window !== 'undefined') {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
      const formattedBase = apiBase.endsWith('/') ? apiBase : `${apiBase}/`;
      this.init(`${formattedBase}api/tracker/collect`);
    }

    let customerId = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(atob(userStr));
        customerId = user.id || null;
      }
    } catch (e) {}

    const payload = {
      event_name: eventName,
      event_data: eventData,
      session_id: this.sessionId,
      visitor_id: this.visitorId,
      customer_id: customerId,
      page_url: eventData.page_url || window.location.href,
      page_title: eventData.page_title || document.title,
      referrer: getExternalReferrer(),
      utm_source: this.utmParams.utm_source || null,
      utm_medium: this.utmParams.utm_medium || null,
      utm_campaign: this.utmParams.utm_campaign || null,
      utm_term: this.utmParams.utm_term || null,
      utm_content: this.utmParams.utm_content || null,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      screen_width: window.innerWidth || null,
      screen_height: window.innerHeight || null,
      language: navigator.language || 'en',
      revenue: eventName === 'purchase' ? (eventData.total || eventData.revenue || eventData.price || null) : null,
      created_at: new Date().toISOString(),
    };

    this.queue.push(payload);

    if (this.isDev) {
      console.log(`[AhmedTracker] Event queued: ${eventName}`, payload);
    }

    // Flush immediately for key events or if queue >= 10
    if (IMMEDIATE_EVENTS.includes(eventName) || this.queue.length >= 10) {
      this.flush();
    }
  }

  flush(useKeepAlive = false) {
    if (this.queue.length === 0 || !this.endpoint) return;

    const batch = [...this.queue];
    this.queue = [];

    const bodyData = JSON.stringify({ events: batch });

    try {
      fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyData,
        keepalive: useKeepAlive,
      })
        .then((res) => {
          if (!res.ok && this.isDev) {
            console.warn(`[AhmedTracker] API Response status: ${res.status}`);
          } else if (this.isDev) {
            console.log(`[AhmedTracker] API Response: ${res.status}`);
          }
        })
        .catch((err) => {
          // Re-queue un-sent batch so no events are lost
          this.queue = [...batch, ...this.queue];
          if (this.isDev) {
            console.warn('[AhmedTracker] Network flush retry queued:', err.message || err);
          }
        });
    } catch (err) {
      this.queue = [...batch, ...this.queue];
      if (this.isDev) {
        console.warn('[AhmedTracker] Dispatch error retry queued:', err.message || err);
      }
    }
  }
}

export const AhmedTracker = new AhmedTrackerSDK();

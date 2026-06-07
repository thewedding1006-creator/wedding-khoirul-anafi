/* ============================================
   DARK LUXURY WEDDING - Service Worker (PWA)
   ============================================ */

const CACHE_NAME = 'dark-luxury-wedding-v1';
const ASSETS = [
  './',
  './index.html',
  './css/variables.css',
  './css/style.css',
  './css/animation.css',
  './css/responsive.css',
  './css/background.css',
  './js/particles.js',
  './js/navigation.js',
  './js/countdown.js',
  './js/gallery.js',
  './js/music.js',
  './js/rsvp.js',
  './js/spreadsheet.js',
  './js/animation.js',
  './js/app.js',
  './data/config.json',
  'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Montserrat:wght@300;400;500;600&family=Poppins:wght@300;400;500&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(ASSETS.map(url => cache.add(url).catch(() => {})));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Skip Google Spreadsheet requests
  if (e.request.url.includes('script.google.com')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => {
        if (e.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

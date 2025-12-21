importScripts('workbox-sw.js');

if (workbox) {
  console.log(`Workbox is loaded`);

  workbox.routing.registerRoute(
    new RegExp('.*\\.js'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'js-cache',
    }),
  );

  workbox.routing.registerRoute(
    new RegExp('.*\\.css'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'css-cache',
    }),
  );

  workbox.routing.registerRoute(
    new RegExp('.*\\.png|jpg|jpeg|gif|bmp'),
    new workbox.strategies.CacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAge: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    }),
  );

  workbox.routing.registerRoute(
    new RegExp('https://fonts.googleapis.com/(.*)'),
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxAge: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    }),
  );
} else {
  console.log(`Workbox didn't load`);
}

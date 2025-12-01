const APP_VERSION = "v1.0.0";

// Caches
const STATIC_CACHE = `static-${APP_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${APP_VERSION}`;

const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/telegram-icono.png",
];

// 📦 INSTALACIÓN
self.addEventListener("install", (event) => {
  console.log("📦 Service Worker instalado");

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(ASSETS))
  );

  self.skipWaiting();
});

// 🚀 ACTIVACIÓN
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activado");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );

  self.clients.claim();
});

// 🛰️ FETCH — primero red, fallback cache
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = request.url;

  // ❗ IGNORAR por completo placeholder.com
  if (url.includes("via.placeholder.com")) return;

  // ❗ Evitar interceptar Supabase Auth
  if (url.includes("supabase.co/auth")) {
    event.respondWith(fetch(request));
    return;
  }

  // ❗ Evitar cachear POST, PUT, DELETE, PATCH, OPTIONS
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // ❗ Evitar cachear recursos sin CORS (incluye imágenes externas)
  if (request.mode === "no-cors") {
    event.respondWith(fetch(request));
    return;
  }

  // 🌐 Estrategia: Red → Cache dinámico → Cache
  event.respondWith(
    fetch(request)
      .then((res) => {
        // Evitar cachear respuestas no válidas
        if (!res || res.status !== 200 || res.type === "opaque") {
          return res;
        }

        // Guardar en cache dinámico
        const resClone = res.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, resClone);
        });

        return res;
      })
      .catch(() => caches.match(request))
  );
});

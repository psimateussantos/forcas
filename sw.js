/* Forças PWA - Service Worker */
const BADGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAABhklEQVR4nO3d0WrDMBAFUbn0/3/ZfTKUUFKt6e1Y2jmPiSOMx3JgIWQMSVJXB30CKzrP83x97TiOW9fSAAU/XfhX1RAf90+nl5mLXznuYoAJ1YtaOd4AMAP8onr3Vz9nAJgBYAaAGQBmAJgBYAaAGQBmAJgBYJ/0CaT95ew+YdsA72Yx13tPCLHlIyg1u0/YLkBydp+wXYDVbBUgPbtP2CrAigwAMwDMADADwAwAMwDMADADwAwAe9Q4+umz+4RHBFhldp+AP4JWmt0noAFWm90n4DugOyzAirP7BHcAzAAwA8AMADMAzAAwA8AMADMAzACw2+PojrP7hHKAzrP7hNIjqPvsPmE6gLP7DL+EYVMBnN3nuANgBoAZAGYAmAFgBoAZAGYAmAFgBoAZAGYAmAFgBoAZAGYAmAFgBoAZAGYAmAFgBoAZAGYAmAFgBoAZAGYA2FSA2/8W/eZzndf8zh0Amw5QvRNmju+85qW0A2YXrpxA5zXHGOP2j+kSv5LsvKYkSfpnX+HxnKxw8yIrAAAAAElFTkSuQmCC";
const CACHE = "forcas-v14";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Cache-first para o app; runtime cache para fontes do Google */
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      }))
    );
  } else if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com")) {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      }))
    );
  }
});

/* Web Push: recebido mesmo com o app fechado (enviado pelo robô do GitHub) */
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) {}
  e.waitUntil(
    self.registration.showNotification(d.titulo || "Forças em prática", {
      body: d.corpo || "Hora de praticar suas forças.",
      icon: "icon-192.png",
      badge: BADGE,
      tag: d.tag || "push-forcas",
      actions: [{ action: "abrir", title: "Abrir app" }],
      data: { url: "./index.html#hoje" }
    })
  );
});

/* Notificação disparada pelo app em primeiro plano */
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "notificar") {
    self.registration.showNotification(e.data.titulo || "Forças em prática", {
      body: e.data.corpo || "Hora do seu check-in.",
      icon: "icon-192.png",
      badge: BADGE,
      tag: e.data.tag || "checkin-diario",
      actions: [{ action: "abrir", title: "Abrir app" }]
    });
  }
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ("focus" in c) return c.focus(); }
      return clients.openWindow("./index.html");
    })
  );
});

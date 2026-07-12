/* Forças PWA - Service Worker */
const BADGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAABZ0lEQVR4nO3cQW6DMBRAwVD1/lemaxYNhkCfTGfWhhA/kUhfgtcLAAD+3FJfwKzWdV331izLsru/X9dczv8ysvmj6wQ4aHTzR9cLcMDRzR85ToCYADEBYgLEBIgJEBMgJkBMgJgAMQFiAsS+6wu40+jwbGRuf5fH3gFHJpdnp5xXeGSAMxtaRXhcgE82sojwuACzESAmQEyAmAAxAWICxASICRATICZALB9HzzAyvlN6B8wyMr5TFmCmkfGdkgCzjYzv5E84JkBMgJgAMQFiAsQEiAkQEyAmQGx4GnrVyynYGroDrnw5BVu7Aa5+OQVbbwPc8XIKtvwJxwSICRATICZATICYADEBYgLEBIgJEBMgJkBMgJgAMQFiAsQEiAkQEyAmQEyAmAAxAWICxASICRATICZATICYALG3Ac4+crR33CePMs147nfH7d4BRz90dP2ZLzPjuffWD/0EVRc3+7k9tAgA8Jsf30pwrCKBvW4AAAAASUVORK5CYII=";
const CACHE = "forcas-v12";
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

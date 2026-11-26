// 오프라인에서도 열리도록 앱 파일을 저장해 둡니다.
// 페이지(index.html)는 인터넷이 되면 항상 최신으로 받아오고, 안 되면 저장본을 씁니다.
const VERSION = "hanjanpocha-v7";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const save = res => { if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; };
  if (req.mode === "navigate") {
    // 페이지: 네트워크 먼저, 실패하면 저장본
    e.respondWith(fetch(req).then(save).catch(() => caches.match(req).then(hit => hit || caches.match("index.html"))));
    return;
  }
  // 아이콘·폰트 등: 저장본 먼저
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(save)));
});

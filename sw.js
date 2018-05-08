// SW Version
const version = "1.0";

// Cache names
const cachePrefix = "static-",
      appCache = `${cachePrefix}${version}`,
      giphyCache = "giphy";

// Fetch URLs
const giphyAPIUrl = "api.giphy.com/v1/gifs/trending",
      giphyMediaUrl = "giphy.com/media";

// Errors
const fetchError = "Fetch Error";

// Static Cache - App Shell
const appAssets = [
    "index.html",
    "main.js",
    "images/flame.png",
    "images/logo.png",
    "images/sync.png",
    "vendor/bootstrap.min.css",
    "vendor/jquery.min.js"
];

// Message Actions
const cleanGiphyCacheAction = "cleanGiphyCache";

// SW Install
self.addEventListener("install", e => {
    let ready = caches.open(appCache)
            .then(cache => cache.addAll(appAssets));
    e.waitUntil(ready);
});

// SW Activate
self.addEventListener("activate", e => {
    // Clean Static Cache
    let cleaned = caches.keys().then(keys => {
        keys.forEach(key => {
            if(key !== appCache && key.match(cachePrefix)){
                return caches.delete(key);
            }
        });
    });
    e.waitUntil(cleaned);
});

// Static cache strategy = Cache with Network Fallback
const staticCache = (req, cacheName = appCache) => {
    return caches.match(req)
        .then(cacheRes => {
            // Return cached request if found
            if(cacheRes) return cacheRes;
            // Fallback to network
            return fetch(req).then(networkRes => {
                // Update cache with new response
                caches.open(cacheName)
                    .then(cache => {
                        cache.put(req, networkRes);
                    });
                // Return clone of Network response
                return networkRes.clone();
        });
    });
};

// Network with Cache fallback
const fallbackCache = (req) => {
    // Try Network
    return fetch(req).then(networkRes => {
        // Check response is ok, else go to cache
        if(!networkRes.ok) {
            throw fetchError;
        }
        // Update cache
        caches.open(appCache)
            .then(cache => {
                cache.put(req, networkRes);
            });
        // Return clone of Network response
        return networkRes.clone();
    })
    // Try cache
    .catch(err => {
       return caches.match(req);
    });
};

// Clean old Giphys from the Giphy Cache
const cleanGiphyCache = (giphys) => {
    caches.open(giphyCache).then(cache => {
        // Get all cache entries
        cache.keys().then(keys => {
            keys.forEach(key => {
                // if entry is not part of current giphys, delete
                if(!giphys.includes(key.url)) {
                    cache.delete(key);
                }
            });
        });
    });
};

// SW Fetch
self.addEventListener("fetch", e => {
    // App Shell
    if(e.request.url.match(location.origin)) {
        e.respondWith(staticCache(e.request));

    // Giphy API
    } else if(e.request.url.match(giphyAPIUrl)) {
        e.respondWith(fallbackCache(e.request));

    // Giphy Media
    } else if(e.request.url.match(giphyMediaUrl)) {
        e.respondWith(staticCache(e.request, giphyCache));
    }
});

// Listen for message from client (main.js)
self.addEventListener("message", e => {
    // Identify the message
    if(e.data.action === cleanGiphyCacheAction) {
        cleanGiphyCache(e.data.giphys);
    }
});

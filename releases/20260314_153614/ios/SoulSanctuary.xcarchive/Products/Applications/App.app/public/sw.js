/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-52f2a342'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "index.html",
    "revision": "25a7e120c7813ba6d67b0a8e2c3da19d"
  }, {
    "url": "assets/web-C4fWTgnD.js",
    "revision": null
  }, {
    "url": "assets/web-C3awe3Fr.js",
    "revision": null
  }, {
    "url": "assets/web-C-fRjYu3.js",
    "revision": null
  }, {
    "url": "assets/web-8-JNvRlU.js",
    "revision": null
  }, {
    "url": "assets/vendor-react-Bbh2-eiE.js",
    "revision": null
  }, {
    "url": "assets/vendor-icons-CBgk0ocL.js",
    "revision": null
  }, {
    "url": "assets/vendor-clerk-C6pKMwlh.js",
    "revision": null
  }, {
    "url": "assets/useAI-gnproizc.js",
    "revision": null
  }, {
    "url": "assets/react-force-graph-2d-DxgbbsPX.js",
    "revision": null
  }, {
    "url": "assets/index-iAFUz91V.js",
    "revision": null
  }, {
    "url": "assets/index-DvAufbc_.js",
    "revision": null
  }, {
    "url": "assets/crisisDetection-CqYDqEJA.js",
    "revision": null
  }, {
    "url": "assets/Profile-CTZgHyNk.js",
    "revision": null
  }, {
    "url": "assets/MoodTracker-DPpjydse.js",
    "revision": null
  }, {
    "url": "assets/MoodHistory-hAopiFGo.js",
    "revision": null
  }, {
    "url": "assets/MemoryVault-DsZHHyDM.js",
    "revision": null
  }, {
    "url": "assets/GoalCoach-ui6SW47V.js",
    "revision": null
  }, {
    "url": "assets/Dashboard-Cz_HUUGJ.js",
    "revision": null
  }, {
    "url": "assets/CrisisSupport-Bw5HkohS.js",
    "revision": null
  }, {
    "url": "assets/Coach-Cna8q5Yz.js",
    "revision": null
  }, {
    "url": "assets/Card-CWHhxbWq.js",
    "revision": null
  }, {
    "url": "assets/Button-COxHoA3H.js",
    "revision": null
  }, {
    "url": "assets/Analytics-CCe2WCTN.js",
    "revision": null
  }, {
    "url": "assets/styles/index-DZH6zWTr.css",
    "revision": null
  }, {
    "url": "manifest.webmanifest",
    "revision": "2764840e74780ddad7416ebd2692dd85"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/api\./, new workbox.NetworkFirst({
    "cacheName": "api-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 86400
    })]
  }), 'GET');
  workbox.registerRoute(/\.(?:png|jpg|jpeg|svg|gif)$/, new workbox.CacheFirst({
    "cacheName": "images",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 2592000
    })]
  }), 'GET');

}));

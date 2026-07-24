/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./worker/index.ts":
/*!*************************!*\
  !*** ./worker/index.ts ***!
  \*************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n// To disable all workbox logging during development, you can set self.__WB_DISABLE_DEV_LOGS to true\n// https://developers.google.com/web/tools/workbox/guides/configure-workbox#disable_logging\nconst _self = self;\nconst OFFLINE_ROUTES = [\n    '/',\n    '/ludo',\n    '/quizzes',\n    '/chess',\n    '/bible',\n    '/missions',\n    '/prayer',\n    '/comfort',\n    '/intercession',\n    '/~offline'\n];\n// Precache all essential offline pages on Service Worker installation\n_self.addEventListener('install', (event)=>{\n    event.waitUntil(caches.open('offline-pages-cache').then((cache)=>{\n        return cache.addAll(OFFLINE_ROUTES).catch((err)=>{\n            console.warn('Pre-caching some offline routes failed silently:', err);\n        });\n    }));\n});\n// Listen to message event from window\n_self.addEventListener('message', (event)=>{\n    if (event.data && event.data.type === 'SKIP_WAITING') {\n        _self.skipWaiting();\n    }\n});\n// PWABuilder requirements\n// Background Sync\n_self.addEventListener('sync', (event)=>{\n    console.log('Background sync event fired:', event.tag);\n});\n// Periodic Sync\n_self.addEventListener('periodicsync', (event)=>{\n    console.log('Periodic sync event fired:', event.tag);\n});\n// Push Notifications\n_self.addEventListener('push', (event)=>{\n    if (event.data) {\n        const data = event.data.json();\n        const options = {\n            body: data.body,\n            icon: data.icon || '/icon-192x192.png',\n            vibrate: [\n                100,\n                50,\n                100\n            ],\n            data: {\n                dateOfArrival: Date.now(),\n                primaryKey: '2'\n            }\n        };\n        event.waitUntil(_self.registration.showNotification(data.title, options));\n    }\n});\n\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi93b3JrZXIvaW5kZXgudHMiLCJtYXBwaW5ncyI6IjtBQUFBLG9HQUFvRztBQUNwRywyRkFBMkY7QUFFM0YsTUFBTUEsUUFBUUM7QUFFZCxNQUFNQyxpQkFBaUI7SUFDckI7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7Q0FDRDtBQUVELHNFQUFzRTtBQUN0RUYsTUFBTUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDQztJQUNqQ0EsTUFBTUMsU0FBUyxDQUNiQyxPQUFPQyxJQUFJLENBQUMsdUJBQXVCQyxJQUFJLENBQUMsQ0FBQ0M7UUFDdkMsT0FBT0EsTUFBTUMsTUFBTSxDQUFDUixnQkFBZ0JTLEtBQUssQ0FBQyxDQUFDQztZQUN6Q0MsUUFBUUMsSUFBSSxDQUFDLG9EQUFvREY7UUFDbkU7SUFDRjtBQUVKO0FBRUEsc0NBQXNDO0FBQ3RDWixNQUFNRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUNDO0lBQ2pDLElBQUlBLE1BQU1XLElBQUksSUFBSVgsTUFBTVcsSUFBSSxDQUFDQyxJQUFJLEtBQUssZ0JBQWdCO1FBQ3BEaEIsTUFBTWlCLFdBQVc7SUFDbkI7QUFDRjtBQUVBLDBCQUEwQjtBQUMxQixrQkFBa0I7QUFDbEJqQixNQUFNRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUNDO0lBQzlCUyxRQUFRSyxHQUFHLENBQUMsZ0NBQWdDZCxNQUFNZSxHQUFHO0FBQ3ZEO0FBRUEsZ0JBQWdCO0FBQ2hCbkIsTUFBTUcsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUNDO0lBQ3RDUyxRQUFRSyxHQUFHLENBQUMsOEJBQThCZCxNQUFNZSxHQUFHO0FBQ3JEO0FBRUEscUJBQXFCO0FBQ3JCbkIsTUFBTUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDQztJQUM5QixJQUFJQSxNQUFNVyxJQUFJLEVBQUU7UUFDZCxNQUFNQSxPQUFPWCxNQUFNVyxJQUFJLENBQUNLLElBQUk7UUFDNUIsTUFBTUMsVUFBVTtZQUNkQyxNQUFNUCxLQUFLTyxJQUFJO1lBQ2ZDLE1BQU1SLEtBQUtRLElBQUksSUFBSTtZQUNuQkMsU0FBUztnQkFBQztnQkFBSztnQkFBSTthQUFJO1lBQ3ZCVCxNQUFNO2dCQUNKVSxlQUFlQyxLQUFLQyxHQUFHO2dCQUN2QkMsWUFBWTtZQUNkO1FBQ0Y7UUFDQXhCLE1BQU1DLFNBQVMsQ0FBQ0wsTUFBTTZCLFlBQVksQ0FBQ0MsZ0JBQWdCLENBQUNmLEtBQUtnQixLQUFLLEVBQUVWO0lBQ2xFO0FBQ0Y7QUFFVSIsInNvdXJjZXMiOlsiQzpcXGNvZGluZ1xcaWduaXRlXFxmcm9udGVuZFxcd29ya2VyXFxpbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUbyBkaXNhYmxlIGFsbCB3b3JrYm94IGxvZ2dpbmcgZHVyaW5nIGRldmVsb3BtZW50LCB5b3UgY2FuIHNldCBzZWxmLl9fV0JfRElTQUJMRV9ERVZfTE9HUyB0byB0cnVlXG4vLyBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS93ZWIvdG9vbHMvd29ya2JveC9ndWlkZXMvY29uZmlndXJlLXdvcmtib3gjZGlzYWJsZV9sb2dnaW5nXG5cbmNvbnN0IF9zZWxmID0gc2VsZiBhcyBhbnk7XG5cbmNvbnN0IE9GRkxJTkVfUk9VVEVTID0gW1xuICAnLycsXG4gICcvbHVkbycsXG4gICcvcXVpenplcycsXG4gICcvY2hlc3MnLFxuICAnL2JpYmxlJyxcbiAgJy9taXNzaW9ucycsXG4gICcvcHJheWVyJyxcbiAgJy9jb21mb3J0JyxcbiAgJy9pbnRlcmNlc3Npb24nLFxuICAnL35vZmZsaW5lJ1xuXTtcblxuLy8gUHJlY2FjaGUgYWxsIGVzc2VudGlhbCBvZmZsaW5lIHBhZ2VzIG9uIFNlcnZpY2UgV29ya2VyIGluc3RhbGxhdGlvblxuX3NlbGYuYWRkRXZlbnRMaXN0ZW5lcignaW5zdGFsbCcsIChldmVudDogYW55KSA9PiB7XG4gIGV2ZW50LndhaXRVbnRpbChcbiAgICBjYWNoZXMub3Blbignb2ZmbGluZS1wYWdlcy1jYWNoZScpLnRoZW4oKGNhY2hlKSA9PiB7XG4gICAgICByZXR1cm4gY2FjaGUuYWRkQWxsKE9GRkxJTkVfUk9VVEVTKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUud2FybignUHJlLWNhY2hpbmcgc29tZSBvZmZsaW5lIHJvdXRlcyBmYWlsZWQgc2lsZW50bHk6JywgZXJyKTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICk7XG59KTtcblxuLy8gTGlzdGVuIHRvIG1lc3NhZ2UgZXZlbnQgZnJvbSB3aW5kb3dcbl9zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQ6IGFueSkgPT4ge1xuICBpZiAoZXZlbnQuZGF0YSAmJiBldmVudC5kYXRhLnR5cGUgPT09ICdTS0lQX1dBSVRJTkcnKSB7XG4gICAgX3NlbGYuc2tpcFdhaXRpbmcoKTtcbiAgfVxufSk7XG5cbi8vIFBXQUJ1aWxkZXIgcmVxdWlyZW1lbnRzXG4vLyBCYWNrZ3JvdW5kIFN5bmNcbl9zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ3N5bmMnLCAoZXZlbnQ6IGFueSkgPT4ge1xuICBjb25zb2xlLmxvZygnQmFja2dyb3VuZCBzeW5jIGV2ZW50IGZpcmVkOicsIGV2ZW50LnRhZyk7XG59KTtcblxuLy8gUGVyaW9kaWMgU3luY1xuX3NlbGYuYWRkRXZlbnRMaXN0ZW5lcigncGVyaW9kaWNzeW5jJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgY29uc29sZS5sb2coJ1BlcmlvZGljIHN5bmMgZXZlbnQgZmlyZWQ6JywgZXZlbnQudGFnKTtcbn0pO1xuXG4vLyBQdXNoIE5vdGlmaWNhdGlvbnNcbl9zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ3B1c2gnLCAoZXZlbnQ6IGFueSkgPT4ge1xuICBpZiAoZXZlbnQuZGF0YSkge1xuICAgIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhLmpzb24oKTtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgYm9keTogZGF0YS5ib2R5LFxuICAgICAgaWNvbjogZGF0YS5pY29uIHx8ICcvaWNvbi0xOTJ4MTkyLnBuZycsXG4gICAgICB2aWJyYXRlOiBbMTAwLCA1MCwgMTAwXSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZGF0ZU9mQXJyaXZhbDogRGF0ZS5ub3coKSxcbiAgICAgICAgcHJpbWFyeUtleTogJzInXG4gICAgICB9XG4gICAgfTtcbiAgICBldmVudC53YWl0VW50aWwoX3NlbGYucmVnaXN0cmF0aW9uLnNob3dOb3RpZmljYXRpb24oZGF0YS50aXRsZSwgb3B0aW9ucykpO1xuICB9XG59KTtcblxuZXhwb3J0IHt9O1xuIl0sIm5hbWVzIjpbIl9zZWxmIiwic2VsZiIsIk9GRkxJTkVfUk9VVEVTIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50Iiwid2FpdFVudGlsIiwiY2FjaGVzIiwib3BlbiIsInRoZW4iLCJjYWNoZSIsImFkZEFsbCIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsIndhcm4iLCJkYXRhIiwidHlwZSIsInNraXBXYWl0aW5nIiwibG9nIiwidGFnIiwianNvbiIsIm9wdGlvbnMiLCJib2R5IiwiaWNvbiIsInZpYnJhdGUiLCJkYXRlT2ZBcnJpdmFsIiwiRGF0ZSIsIm5vdyIsInByaW1hcnlLZXkiLCJyZWdpc3RyYXRpb24iLCJzaG93Tm90aWZpY2F0aW9uIiwidGl0bGUiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./worker/index.ts\n"));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	(() => {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = () => {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: (script) => (script)
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	(() => {
/******/ 		__webpack_require__.ts = (script) => (__webpack_require__.tt().createScript(script));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	(() => {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push((options) => {
/******/ 			const originalFactory = options.factory;
/******/ 			options.factory = (moduleObject, moduleExports, webpackRequire) => {
/******/ 				if (!originalFactory) {
/******/ 					document.location.reload();
/******/ 					return;
/******/ 				}
/******/ 				const hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				const cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : () => {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./worker/index.ts");
/******/ 	
/******/ })()
;
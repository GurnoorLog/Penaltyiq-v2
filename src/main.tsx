// Global Defensive Safeguard Patches for Sandboxed Environments
(function() {
  try {
    const originalFetch = window.fetch || globalThis.fetch;
    if (originalFetch) {
      let currentFetch = originalFetch;
      
      const targets = [
        window,
        globalThis,
        typeof Window !== 'undefined' ? Window.prototype : null,
        typeof window !== 'undefined' ? Object.getPrototypeOf(window) : null,
        typeof globalThis !== 'undefined' ? Object.getPrototypeOf(globalThis) : null
      ].filter(Boolean);
      
      for (const target of targets) {
        try {
          const desc = Object.getOwnPropertyDescriptor(target, 'fetch');
          if (desc && !desc.configurable) {
            continue;
          }
          Object.defineProperty(target, 'fetch', {
            configurable: true,
            enumerable: true,
            get() {
              return currentFetch;
            },
            set(val) {
              currentFetch = val;
            }
          });
        } catch (e) {
          // Silent catch
        }
      }
    }
  } catch (e) {
    console.warn("Bypassed fetch redefining limit in main.tsx:", e);
  }

  try {
    const createFallbackRect = function() {
      const w = (this as any).width || 640;
      const h = (this as any).height || 360;
      return {
        top: 0,
        left: 0,
        right: w,
        bottom: h,
        width: w,
        height: h,
        x: 0,
        y: 0,
        toJSON: function() { return this; }
      };
    };

    if (typeof HTMLCanvasElement !== 'undefined') {
      try {
        if (!HTMLCanvasElement.prototype.getBoundingClientRect || typeof HTMLCanvasElement.prototype.getBoundingClientRect !== 'function') {
          Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
            value: createFallbackRect,
            writable: true,
            configurable: true,
            enumerable: true
          });
        }
      } catch (e) {
        try {
          HTMLCanvasElement.prototype.getBoundingClientRect = createFallbackRect;
        } catch (err) {}
      }
    }
    if (typeof OffscreenCanvas !== 'undefined') {
      try {
        if (!(OffscreenCanvas.prototype as any).getBoundingClientRect || typeof (OffscreenCanvas.prototype as any).getBoundingClientRect !== 'function') {
          Object.defineProperty(OffscreenCanvas.prototype, 'getBoundingClientRect', {
            value: createFallbackRect,
            writable: true,
            configurable: true,
            enumerable: true
          });
        }
      } catch (e) {
        try {
          (OffscreenCanvas.prototype as any).getBoundingClientRect = createFallbackRect;
        } catch (err) {}
      }
    }
  } catch (e) {
    console.warn("Bypassed canvas getBoundingClientRect patching limit in main.tsx:", e);
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

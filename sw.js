if(!self.define){let s,e={};const i=(i,l)=>(i=new URL(i+".js",l).href,e[i]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=i,s.onload=e,document.head.appendChild(s)}else s=i,importScripts(i),e()})).then((()=>{let s=e[i];if(!s)throw new Error(`Module ${i} didn’t register its module`);return s})));self.define=(l,n)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let t={};const u=s=>i(s,r),o={module:{uri:r},exports:t,require:u};e[r]=Promise.all(l.map((s=>o[s]||u(s)))).then((s=>(n(...s),t)))}}define(["./workbox-5ffe50d4"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"assets/index-CiGvDgPe.js",revision:null},{url:"assets/index-D6PVDigZ.css",revision:null},{url:"assets/index-legacy-PU5D58f2.js",revision:null},{url:"assets/index9-DD1PLQUt.js",revision:null},{url:"assets/index9-legacy-CGVqHm71.js",revision:null},{url:"assets/input-shims-C7HLDdP7.js",revision:null},{url:"assets/input-shims-legacy-DamMrUl5.js",revision:null},{url:"assets/ios.transition-BzUVclHq.js",revision:null},{url:"assets/ios.transition-legacy-fwFqbtud.js",revision:null},{url:"assets/md.transition-BQk6pxG-.js",revision:null},{url:"assets/md.transition-legacy-qY5J2J7R.js",revision:null},{url:"assets/polyfills-legacy-DmY6Vbmp.js",revision:null},{url:"assets/status-tap-DDWGQEp3.js",revision:null},{url:"assets/status-tap-legacy-BoaDsMoQ.js",revision:null},{url:"assets/swipe-back-ij7C56rV.js",revision:null},{url:"assets/swipe-back-legacy-BxADy0y-.js",revision:null},{url:"assets/web-C-XjPBfc.js",revision:null},{url:"assets/web-CSGEgbC6.js",revision:null},{url:"assets/web-Gj3imXM7.js",revision:null},{url:"assets/web-legacy-Ch8pk6dP.js",revision:null},{url:"assets/web-legacy-DKciP8fE.js",revision:null},{url:"assets/web-legacy-RiVTBf8R.js",revision:null},{url:"index.html",revision:"a2444bbdb6c018357eb0791e0dcbb621"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"manifest.webmanifest",revision:"7ecebc55afbfd2cbc14922a5680a5056"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));

if(!self.define){let s,e={};const l=(l,i)=>(l=new URL(l+".js",i).href,e[l]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=l,s.onload=e,document.head.appendChild(s)}else s=l,importScripts(l),e()})).then((()=>{let s=e[l];if(!s)throw new Error(`Module ${l} didn’t register its module`);return s})));self.define=(i,n)=>{const r=s||("document"in self?document.currentScript.src:"")||location.href;if(e[r])return;let t={};const u=s=>l(s,r),o={module:{uri:r},exports:t,require:u};e[r]=Promise.all(i.map((s=>o[s]||u(s)))).then((s=>(n(...s),t)))}}define(["./workbox-5ffe50d4"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"assets/index-D6PVDigZ.css",revision:null},{url:"assets/index-Dz1StdDN.js",revision:null},{url:"assets/index-legacy-DAsyWGtX.js",revision:null},{url:"assets/index9-C4BteUX1.js",revision:null},{url:"assets/index9-legacy-BLy_ds82.js",revision:null},{url:"assets/input-shims-CQvNIKZe.js",revision:null},{url:"assets/input-shims-legacy-BvRKayze.js",revision:null},{url:"assets/ios.transition-fxesBVcA.js",revision:null},{url:"assets/ios.transition-legacy--cIBkLnq.js",revision:null},{url:"assets/md.transition-B4wq0cet.js",revision:null},{url:"assets/md.transition-legacy-DuR7ptNI.js",revision:null},{url:"assets/polyfills-legacy-DmY6Vbmp.js",revision:null},{url:"assets/status-tap-BladjIn2.js",revision:null},{url:"assets/status-tap-legacy-CtPzkeBd.js",revision:null},{url:"assets/swipe-back-J33dbSAj.js",revision:null},{url:"assets/swipe-back-legacy-BeOXv4QD.js",revision:null},{url:"assets/web-C2ccMYs_.js",revision:null},{url:"assets/web-Cn5glYTP.js",revision:null},{url:"assets/web-DU_nUy37.js",revision:null},{url:"assets/web-legacy-BFOz7HM0.js",revision:null},{url:"assets/web-legacy-BxEIZSB6.js",revision:null},{url:"assets/web-legacy-D7NSVb3n.js",revision:null},{url:"index.html",revision:"db05d42d992595bd61a1f33e05993014"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"manifest.webmanifest",revision:"7ecebc55afbfd2cbc14922a5680a5056"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))}));

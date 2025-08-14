// main.js
import { createApp, nextTick } from "vue";
import App from "./App.vue";
import router from "./router";
import "./styles/global.css";

import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// Mount app
const app = createApp(App).use(router);
const vm = app.mount("#app");

// ---------------------- Smooth Scroll (Lenis) ----------------------
const lenis = new Lenis({
  lerp: 0.06,
  smoothWheel: true,
  smoothTouch: false,
  wheelMultiplier: 1.0,
  touchMultiplier: 1.2,
});

window.__lenis = lenis;

lenis.on("scroll", () => {
  ScrollTrigger.update();
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Respect reduced motion
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
if (prefersReduced.matches) lenis.stop();
prefersReduced.addEventListener?.("change", (e) => {
  if (e.matches) lenis.stop();
  else lenis.start();
});

// Disable native smooth so it doesn't fight Lenis
document.documentElement.style.scrollBehavior = "auto";

// ---------------------- Reveals ----------------------
function setupReveals(scope = document) {
  // Fade + rise
  const ups = scope.querySelectorAll("[data-reveal='up']");
  if (ups.length) {
    gsap.set(ups, { y: 30, autoAlpha: 0 });
    ScrollTrigger.batch(ups, {
      start: "top 90%",
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power1.out",
          stagger: { each: 0.08, from: "start" },
          clearProps: "transform,opacity",
        });
      },
      once: true,
    });
  }

  // Curtain-up (chart-like) mask
  const wipes = scope.querySelectorAll("[data-reveal='wipe']");
  if (wipes.length) {
    gsap.set(wipes, { clipPath: "inset(100% 0% 0% 0%)" }); // hidden from bottom
    ScrollTrigger.batch(wipes, {
      start: "top 92%",
      onEnter: (batch) => {
        gsap.to(batch, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.9,
          ease: "power5.out",
          stagger: { each: 0.09, from: "start" },
          //{ each: 0.08, from: "start" }
          clearProps: "clipPath",
        });
      },
      once: true,
    });
  }
}

// Run after first route render
router.isReady().then(async () => {
  await nextTick();
  setupReveals();
  ScrollTrigger.refresh();
});

// Re-run on SPA navigations
router.afterEach(async () => {
  await nextTick();
  requestAnimationFrame(() => {
    setupReveals();
    ScrollTrigger.refresh(true);
  });
});

// Keep ST fresh on resize
window.addEventListener("resize", () => {
  ScrollTrigger.refresh();
}, { passive: true });

export { lenis }; // optional

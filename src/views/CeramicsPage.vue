<template>
  <main class="series-page">
    <!-- Close -->
    <button class="close-btn" @click="goBack">
      <span class="close-text">CLOSE</span>
      <svg class="close-icon mobile-only" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M18 6L6 18M6 6l12 12"></path>
      </svg>
    </button>

    <!-- Desktop Horizontal Layout -->
    <section class="pin desktop-only" ref="pinEl">
      <div class="track" ref="trackEl">
        <!-- INTRO TITLE (first panel) -->
        <div class="panel intro-slide">
          <h1 class="series-title">CERAMICS</h1>
        </div>

        <!-- IMAGES -->
        <div class="panel group">
          <div class="cards">
            <article
              class="card"
              v-for="(img,i) in images"
              :key="img.src + i"
              :style="cardStyle(img)"
            >
              <img
                :src="img.src"
                :alt="`Ceramics ${i+1}`"
                :style="imgStyle(img)"
                loading="lazy"
                decoding="async"
                @load="onAssetLoad"
              />
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- Mobile Vertical Layout -->
    <section class="mobile-series mobile-only">
      <!-- Mobile Header -->
      <div class="mobile-header">
        <h1 class="mobile-series-title">CERAMICS</h1>
        <div class="mobile-series-info">
          <span class="image-count">{{ images.length }} WORKS</span>
        </div>
      </div>

      <!-- Mobile Image Grid -->
      <div class="mobile-gallery" ref="mobileGalleryEl">
        <div 
          v-for="(img, i) in images" 
          :key="img.src + i"
          class="mobile-image-container"
          @click="openMobileLightbox(img, i)"
        >
          <img
            :src="img.src"
            :alt="`Ceramics ${i+1}`"
            loading="lazy"
            decoding="async"
            class="mobile-image"
          />
        </div>
      </div>
    </section>

    <!-- Mobile Lightbox -->
    <div 
      v-if="mobileLightboxOpen" 
      class="mobile-lightbox mobile-only"
      @click="closeMobileLightbox"
    >
      <div class="mobile-lightbox-content" @click.stop>
        <button class="mobile-lightbox-close" @click="closeMobileLightbox">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
        
        <div class="mobile-lightbox-image-container">
          <img 
            :src="currentMobileLightboxImage?.src" 
            :alt="`Ceramics ${currentMobileImageIndex + 1}`"
          />
        </div>
        
        <div class="mobile-lightbox-meta">
          <div class="mobile-lightbox-navigation">
            <button @click="previousMobileImage" :disabled="currentMobileImageIndex === 0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 18l-6-6 6-6"></path>
              </svg>
            </button>
            <span class="mobile-image-counter">{{ currentMobileImageIndex + 1 }} / {{ images.length }}</span>
            <button @click="nextMobileImage" :disabled="currentMobileImageIndex === images.length - 1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 18l6-6-6-6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { worksData } from "../data/worksData";
gsap.registerPlugin(ScrollTrigger);

const router = useRouter();
function goBack(){ router.replace("/work"); }

/* ----------------- images without duplicates ----------------- */
const base = worksData.ceramics.images;
/* Per-image overrides by index (0-based). Use any of: maxW, maxH, w, h, scale, pad */
const overrides = {
  0: { maxW: "60vw", maxH: "100vh" },
  1: { maxW: "60vw", maxH: "50vh"  },
  2: { maxW: "50vw", maxH: "60vh"  },  // image 3
  3: { maxW: "50vw", maxH: "90vh"  },
  4: { maxW: "50vw", maxH: "50vh"  },
  5: { maxW: "50vw", maxH: "80vh"  },
  // 6: { w: 720, h: 520, pad: 24, scale: 0.95 },
};
const images = base.map((item, i) => {
  const obj = typeof item === "string" ? { src: item } : { ...item };
  return overrides[i] ? { ...obj, ...overrides[i] } : obj;
});

/* ----------------- mobile state ----------------- */
const isMobile = ref(false);
const mobileLightboxOpen = ref(false);
const currentMobileLightboxImage = ref(null);
const currentMobileImageIndex = ref(0);
const mobileGalleryEl = ref(null);

/* ----------------- refs/state ----------------- */
const pinEl = ref(null);
const trackEl = ref(null);
let st = null;
let anim = null;
let resizeRaf = 0;
let imgCount = 0;
let revealTriggers = [];

/* ----------------- mobile functions ----------------- */
function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

function openMobileLightbox(image, index) {
  currentMobileLightboxImage.value = image;
  currentMobileImageIndex.value = index;
  mobileLightboxOpen.value = true;
  document.body.style.overflow = 'hidden';
}

function closeMobileLightbox() {
  mobileLightboxOpen.value = false;
  currentMobileLightboxImage.value = null;
  document.body.style.overflow = '';
}

function nextMobileImage() {
  if (currentMobileImageIndex.value < images.length - 1) {
    currentMobileImageIndex.value++;
    currentMobileLightboxImage.value = images[currentMobileImageIndex.value];
  }
}

function previousMobileImage() {
  if (currentMobileImageIndex.value > 0) {
    currentMobileImageIndex.value--;
    currentMobileLightboxImage.value = images[currentMobileImageIndex.value];
  }
}

/* ----------------- per-image inline styles ----------------- */
function imgStyle(img){
  if (isMobile.value) return {}; // Skip on mobile
  
  const s = {};
  if (img.w    != null) s["--img-w"]     = typeof img.w    === "number" ? `${img.w}px`    : img.w;
  if (img.h    != null) s["--img-h"]     = typeof img.h    === "number" ? `${img.h}px`    : img.h;
  if (img.maxW != null) s["--img-max-w"] = typeof img.maxW === "number" ? `${img.maxW}px`: img.maxW;
  if (img.maxH != null) s["--img-max-h"] = typeof img.maxH === "number" ? `${img.maxH}px`: img.maxH;
  if (img.scale!= null) s["--img-scale"] = img.scale;
  return s;
}
function cardStyle(img){
  if (isMobile.value) return {}; // Skip on mobile
  
  const s = {};
  if (img.pad != null) s["--card-pad"] = typeof img.pad === "number" ? `${img.pad}px` : img.pad;
  return s;
}

/* ----------------- GSAP horizontal scroll ----------------- */
function compute() {
  if (isMobile.value) return { endX: 0 };
  
  const vp = pinEl.value;
  const tr = trackEl.value;
  if (!vp || !tr) return { endX: 0 };
  
  const raw = Math.round(tr.scrollWidth - vp.clientWidth); // exact content width minus viewport
  return { endX: Math.max(1, raw) };
}

function setup() {
  if (isMobile.value) return; // Skip on mobile
  
  const tr = trackEl.value;
  if (!tr) return;

  anim?.kill();
  st?.kill();
  ScrollTrigger.getAll().forEach(t => t.vars?.containerAnimation && t.kill());
  revealTriggers.forEach(t => t.kill());
  revealTriggers = [];

  // map vertical scroll distance to horizontal translateX
  anim = gsap.to(tr, { x: () => -compute().endX, ease: "none" });

  st = ScrollTrigger.create({
    trigger: pinEl.value,
    start: "top top",
    end: () => "+=" + compute().endX,   // distance equals content width
    scrub: 1,
    pin: true,
    pinType: "fixed",
    anticipatePin: 1,
    animation: anim,
    invalidateOnRefresh: true,
  });

  // set up reveals tied to the container animation
  createReveals();
}

/* ----------------- Reveals (curtain top->down + zoom + title) ----------------- */
function createReveals(){
  if (isMobile.value) return; // Skip on mobile
  
  const root = trackEl.value;
  if (!root || !anim) return;

  // Title: wipe DOWN + slight drop-in
  const title = root.querySelector(".series-title");
  if (title){
    gsap.set(title, {
      y: -12,                       // start slightly above
      autoAlpha: 0,
      clipPath: "inset(0% 0% 100% 0%)" // hidden from TOP -> reveal DOWN
    });
    const t = ScrollTrigger.create({
      containerAnimation: anim,
      trigger: root.querySelector(".intro-slide"),
      start: "left 80%",
      once: true,
      onEnter: () => gsap.to(title, {
        y: 0,
        autoAlpha: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.9,
        ease: "power3.out",
        clearProps: "transform,opacity,clipPath",
      }),
    });
    revealTriggers.push(t);
  }

  // Images: wipe DOWN + subtle zoom-out (from 1.04 -> 1) + drop-in
  const cards = root.querySelectorAll(".card");
  cards.forEach((card) => {
    const img = card.querySelector("img");
    if (!img) return;

    gsap.set(img, {
      clipPath: "inset(0% 0% 100% 0%)", // hidden from TOP
      scale: 1.54,                       // tiny zoom-in look initially
      y: -8,                             // slight drop-in
      autoAlpha: 0,
      transformOrigin: "50% 0%",         // top center
      willChange: "transform, clip-path, opacity",
    });

    const t = ScrollTrigger.create({
      containerAnimation: anim,
      trigger: card,
      start: "left 78%",
      once: true,
      onEnter: () => {
        gsap.to(img, {
          clipPath: "inset(0% 0% 0% 0%)", // fully revealed
          scale: 1,
          y: 0,
          autoAlpha: 1,
          duration: 1.05,
          ease: "power3.out",
          clearProps: "clipPath,transform,opacity",
        });
      },
    });
    revealTriggers.push(t);
  });
}

function onAssetLoad(){
  if (isMobile.value) return; // Skip on mobile
  
  imgCount++;
  if (imgCount === 1 || imgCount % 2 === 0) {
    ScrollTrigger.refresh();
    setup(); // re-measure after new images affect width
  }
}

function onResize(){
  const wasMobile = isMobile.value;
  checkMobile();
  
  // If mobile state changed, restart appropriate mode
  if (wasMobile !== isMobile.value) {
    if (st) {
      st.kill();
      st = null;
    }
    if (anim) {
      anim.kill();
      anim = null;
    }
    revealTriggers.forEach(t => t.kill());
    revealTriggers = [];
    
    if (!isMobile.value) {
      // Switched to desktop, restart horizontal scroll
      nextTick(() => {
        setup();
      });
    }
  } else if (!isMobile.value) {
    // Still desktop, normal resize handling
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      setup();
    });
  }
}

/* ----------------- lifecycle ----------------- */
let headerEl, prevDisplay;
onMounted(async () => {
  checkMobile();
  
  // Hide global header on series pages; keep Lenis active for buttery feel
  headerEl = document.querySelector(".global-header");
  if (headerEl) { prevDisplay = headerEl.style.display; headerEl.style.display = "none"; }
  document.documentElement.style.scrollBehavior = "auto";

  await nextTick();
  
  if (!isMobile.value) {
    requestAnimationFrame(setup);
  }

  addEventListener("resize", onResize, { passive: true });
});

onBeforeUnmount(() => {
  removeEventListener("resize", onResize);
  st?.kill(); anim?.kill();
  revealTriggers.forEach(t => t.kill());
  revealTriggers = [];
  ScrollTrigger.getAll().forEach(t => t.kill());
  if (headerEl) headerEl.style.display = prevDisplay ?? "";
});
</script>

<style scoped>
/* ---------- page knobs ---------- */
.series-page{
  --slide-gap: 24px;   /* spacing between slides */
  --img-max-w: clamp(520px, 68vw, 980px);  /* default image max size */
  --img-max-h: clamp(360px, 70vh, 880px);
  --card-pad: 0px;     /* inner padding inside each card (can be overridden per image) */
  background:#fff; color:#000000;
}

/* ─── Desktop Layout Styles ──────────────────────────────────── */

/* Close button */
.close-btn{
  position: fixed;
  top: 1px; left: 38px;
  z-index: 20;
  appearance: none; border: 0; background: none; color: #000;
  font: inherit; font-weight: 700; letter-spacing: .02em; cursor: pointer;
  padding: 50px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-text {
  display: inline;
}

.close-icon {
  display: none;
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* pinned viewport */
.pin{ position:relative; height:100vh; overflow:hidden; }

/* horizontal filmstrip (content defines width) */
.track{ position:absolute; inset:0; display:inline-flex; height:100vh; will-change:transform; }
.panel{ position:relative; height:100vh; }

/* intro slide — consistent basis/width */
.intro-slide{
  flex: 0 0 60vw;
  width: 60vw;
  height: 100vh;
  display:flex; align-items:center; justify-content:center;
  background:#fff;
}
.series-title{
  font-family:'Oswald', Arial, sans-serif;
  font-weight:900; text-transform:uppercase; letter-spacing:-.02em; line-height:.9;
  font-size: clamp(76px, 10vw, 80px);
  margin:0;
}

/* image group — let content define width (no fake min-width) */
.group{
  width: max-content;    /* row width equals its content */
  flex: 0 0 auto;
}
.cards{
  height:100%;
  display:flex;
  gap: var(--slide-gap) !important; /* spacing only between slides */
  padding: 0;                        /* no end padding -> ends at last image */
}

/* each slide width (visible white between slides while centered) */
.card{
  flex: 0 0 calc(50vw - var(--slide-gap));
  width: calc(50vw - var(--slide-gap));
  height: 100vh;
  display: grid;
  place-items: center;
  background: #fff;
  padding: var(--card-pad);
  box-sizing: border-box;
}
.card img{
  width: var(--img-w, auto);
  height: var(--img-h, auto);
  max-width: var(--img-max-w);
  max-height: var(--img-max-h);
  object-fit: contain;
  display:block;
  transform: scale(var(--img-scale, 1));
  transform-origin: center;
  will-change: transform, clip-path, opacity;
}

/* ─── Mobile Layout Styles ───────────────────────────────────── */

.mobile-series {
  display: none;
  background: #fff;
  color: #000;
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 60px;
}

.mobile-header {
  padding: 0 16px 40px;
  text-align: center;
}

.mobile-series-title {
  font-family: 'Oswald', Arial, sans-serif;
  font-weight: 900;
  font-size: clamp(48px, 12vw, 80px);
  line-height: 0.9;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
  text-transform: uppercase;
  color: #000;
}

.mobile-series-info {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #666;
}

.mobile-gallery {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  padding: 0 16px;
}

.mobile-image-container {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.mobile-image-container:active {
  transform: scale(0.98);
}

.mobile-image {
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
  display: block;
  background: #fff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

/* ─── Mobile Lightbox ────────────────────────────────────────── */

.mobile-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255,255,255,0.98);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.mobile-lightbox-content {
  position: relative;
  width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  max-width: 600px;
}

.mobile-lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: none;
  border: none;
  color: #000;
  cursor: pointer;
  z-index: 2001;
  padding: 8px;
}

.mobile-lightbox-close svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.mobile-lightbox-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  overflow: hidden;
  margin-bottom: 20px;
}

.mobile-lightbox-image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.mobile-lightbox-meta {
  color: #000;
}

.mobile-lightbox-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.mobile-lightbox-navigation button {
  background: none;
  border: none;
  color: #000;
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.mobile-lightbox-navigation button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.mobile-lightbox-navigation button:not(:disabled):hover {
  background-color: rgba(0,0,0,0.05);
}

.mobile-lightbox-navigation button svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.mobile-image-counter {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ─── Responsive Display Control ────────────────────────────── */

.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: block;
  }
  
  .mobile-series {
    display: block;
  }
  
  .close-text {
    display: none;
  }
  
  .close-icon {
    display: block;
  }
  
  .close-btn {
    top: 20px;
    left: 16px;
    padding: 12px;
    background: rgba(255,255,255,0.9);
    border-radius: 50%;
    backdrop-filter: blur(10px);
  }
}

/* ─── Mobile Fine-tuning ─────────────────────────────────────── */

@media (max-width: 480px) {
  .mobile-header {
    padding: 0 12px 30px;
  }
  
  .mobile-series-title {
    font-size: clamp(36px, 10vw, 60px);
  }
  
  .mobile-gallery {
    padding: 0 12px;
    gap: 30px;
  }
  
  .mobile-lightbox-content {
    width: 95vw;
    height: 85vh;
  }
  
  .mobile-lightbox-close {
    top: -40px;
  }
}

/* ─── Touch Interactions ─────────────────────────────────────── */

@media (max-width: 768px) {
  .mobile-image-container,
  .mobile-lightbox-close,
  .mobile-lightbox-navigation button,
  .close-btn {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
}

/* ─── Performance Optimizations ─────────────────────────────── */

@media (max-width: 768px) {
  .mobile-image,
  .mobile-lightbox-image-container {
    will-change: transform;
    transform: translateZ(0);
  }
}

/* Original responsive breakpoint preserved */
@media (max-width: 700px){
  .series-page{
    --img-max-w: 86vw;
    --img-max-h: 68vh;
    --slide-gap: 8px;
  }
}
</style>
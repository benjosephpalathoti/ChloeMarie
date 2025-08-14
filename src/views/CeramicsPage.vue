<template>
  <main class="series-page">
    <!-- Close -->
    <button class="close-btn" @click="goBack">CLOSE</button>

    <section class="pin" ref="pinEl">
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

/* ----------------- refs/state ----------------- */
const pinEl = ref(null);
const trackEl = ref(null);
let st = null;
let anim = null;
let resizeRaf = 0;
let imgCount = 0;
let revealTriggers = [];

/* ----------------- per-image inline styles ----------------- */
function imgStyle(img){
  const s = {};
  if (img.w    != null) s["--img-w"]     = typeof img.w    === "number" ? `${img.w}px`    : img.w;
  if (img.h    != null) s["--img-h"]     = typeof img.h    === "number" ? `${img.h}px`    : img.h;
  if (img.maxW != null) s["--img-max-w"] = typeof img.maxW === "number" ? `${img.maxW}px`: img.maxW;
  if (img.maxH != null) s["--img-max-h"] = typeof img.maxH === "number" ? `${img.maxH}px`: img.maxH;
  if (img.scale!= null) s["--img-scale"] = img.scale;
  return s;
}
function cardStyle(img){
  const s = {};
  if (img.pad != null) s["--card-pad"] = typeof img.pad === "number" ? `${img.pad}px` : img.pad;
  return s;
}

/* ----------------- GSAP horizontal scroll ----------------- */
function compute() {
  const vp = pinEl.value;
  const tr = trackEl.value;
  const raw = Math.round(tr.scrollWidth - vp.clientWidth); // exact content width minus viewport
  return { endX: Math.max(1, raw) };
}
function setup() {
  const tr = trackEl.value;

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
  imgCount++;
  if (imgCount === 1 || imgCount % 2 === 0) {
    ScrollTrigger.refresh();
    setup(); // re-measure after new images affect width
  }
}
function onResize(){
  cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    setup();
  });
}

/* ----------------- lifecycle ----------------- */
let headerEl, prevDisplay;
onMounted(async () => {
  // Hide global header on series pages; keep Lenis active for buttery feel
  headerEl = document.querySelector(".global-header");
  if (headerEl) { prevDisplay = headerEl.style.display; headerEl.style.display = "none"; }
  document.documentElement.style.scrollBehavior = "auto";

  await nextTick();
  requestAnimationFrame(setup);

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

/* Close button */
.close-btn{
  position: fixed;
  top: 1px; left: 38px;
  z-index: 20;
  appearance: none; border: 0; background: none; color: #000;
  font: inherit; font-weight: 700; letter-spacing: .02em; cursor: pointer;
  padding: 50px 0;
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

@media (max-width: 700px){
  .series-page{
    --img-max-w: 86vw;
    --img-max-h: 68vh;
    --slide-gap: 8px;
  }
}
</style>

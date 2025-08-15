<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { gsap } from "gsap";

/**
 * Arc-style circular gallery (ReactBits look)
 * Only a few cards are visible; drag or wheel to reveal more.
 */
const props = defineProps({
  images: { type: Array, default: () => [] }, // [{src, alt, caption}]
  size:   { type: Number, default: 1080 },    // panel width in px (like React Bits container)
  cardW:  { type: Number, default: 260 },
  cardH:  { type: Number, default: 340 },
  gap:    { type: Number, default: 34 },      // space between cards
  bend:   { type: Number, default: 120 },     // arc depth (px)
  tilt:   { type: Number, default: 10 },      // deg tilt per step
  borderRadius: { type: Number, default: 20 },// panel radius
  keepUpright:  { type: Boolean, default: true }, // keep captions upright (not used for cards)
});

const root = ref(null);
const wrap = ref(null);
const offset = ref(1.5); // fractional index; 0 centers first, 1.5 starts between 1st/2nd
const isDown = ref(false);
const isMobile = ref(false);
let startX = 0;
let startOffset = 0;
let wheelRaf = 0;

// Check mobile state
function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

// Mobile-aware responsive calculations
const effectiveSize = computed(() => {
  if (isMobile.value) {
    return Math.min(props.size, window.innerWidth * 0.95);
  }
  return props.size;
});

const effectiveCardW = computed(() => {
  if (isMobile.value) {
    return Math.min(props.cardW, effectiveSize.value * 0.35);
  }
  return props.cardW;
});

const effectiveCardH = computed(() => {
  if (isMobile.value) {
    return Math.min(props.cardH, effectiveSize.value * 0.45);
  }
  return props.cardH;
});

const effectiveGap = computed(() => {
  if (isMobile.value) {
    return Math.max(props.gap * 0.6, 16);
  }
  return props.gap;
});

const effectiveBend = computed(() => {
  if (isMobile.value) {
    return props.bend * 0.5; // Less dramatic curve on mobile
  }
  return props.bend;
});

const effectiveTilt = computed(() => {
  if (isMobile.value) {
    return props.tilt * 0.7; // Less tilt on mobile
  }
  return props.tilt;
});

// one card step in px along X
const stepPx = computed(() => effectiveCardW.value + effectiveGap.value);

// visible height of panel: card plus some breathing room
const panelH = computed(() => {
  const baseHeight = effectiveCardH.value + 140;
  if (isMobile.value) {
    return Math.min(baseHeight, window.innerHeight * 0.6);
  }
  return baseHeight;
});

// helper: animate offset to an index (snap/focus)
function focusIndex(i) {
  const duration = isMobile.value ? 0.4 : 0.6; // Faster on mobile
  gsap.to(offset, { value: i, duration, ease: "power3.out" });
}

// drag with mobile-optimized touch handling
function onPointerDown(e) {
  isDown.value = true;
  startX = ("touches" in e ? e.touches[0].clientX : e.clientX) || 0;
  startOffset = offset.value;
  
  // Prevent scrolling on mobile while dragging
  if (isMobile.value) {
    e.preventDefault();
    document.body.style.overflowY = 'hidden';
  }
  
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("touchmove", onPointerMove, { passive: false });
  window.addEventListener("touchend", onPointerUp);
}

function onPointerMove(e) {
  if (!isDown.value) return;
  e.preventDefault();
  const x = ("touches" in e ? e.touches[0].clientX : e.clientX) || 0;
  const dx = x - startX;               // pixels dragged
  
  // More sensitive dragging on mobile
  const sensitivity = isMobile.value ? 1.2 : 1;
  offset.value = startOffset - (dx * sensitivity) / stepPx.value; // 1 step per card width
}

function onPointerUp() {
  isDown.value = false;
  if (isMobile.value) {
    document.body.style.overflowY = '';
  }
  
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("touchmove", onPointerMove);
  window.removeEventListener("touchend", onPointerUp);
}

// wheel with mobile considerations
function onWheel(e) {
  // Disable wheel on mobile (touch devices)
  if (isMobile.value) return;
  
  e.preventDefault();
  const delta = (e.deltaY || e.wheelDelta || 0) * 0.0025; // tune wheel sensitivity
  const target = offset.value + delta;
  cancelAnimationFrame(wheelRaf);
  wheelRaf = requestAnimationFrame(() => {
    gsap.to(offset, { value: target, duration: 0.25, ease: "power2.out" });
  });
}

// Handle resize
function onResize() {
  checkMobile();
}

onMounted(() => {
  checkMobile();
  const el = root.value;
  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("pointerdown", onPointerDown, { passive: false });
  el.addEventListener("touchstart", onPointerDown, { passive: false });
  window.addEventListener("resize", onResize, { passive: true });
});

onBeforeUnmount(() => {
  const el = root.value;
  el?.removeEventListener("wheel", onWheel);
  el?.removeEventListener("pointerdown", onPointerDown);
  el?.removeEventListener("touchstart", onPointerDown);
  window.removeEventListener("resize", onResize);
  cancelAnimationFrame(wheelRaf);
});

/* ---------- position/appearance for each item ----------
 * p = i - offset (distance from current focus)
 * x = center + p*step
 * y = gentle U-shape: bend * (p^2) * 0.18
 * rot = p * tilt
 * scale/opacity/zIndex based on |p|
 --------------------------------------------------------*/
function styleFor(i) {
  const p = i - offset.value;
  const c = effectiveSize.value / 2;          // panel center
  const x = c + p * stepPx.value;
  const y = (effectiveBend.value * (p * p) * 0.18); // parabolic arc
  const rot = effectiveTilt.value * p;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  
  // Mobile-optimized scaling and opacity
  const scaleMultiplier = isMobile.value ? 0.06 : 0.08;
  const opacityMultiplier = isMobile.value ? 0.10 : 0.12;
  const minScale = isMobile.value ? 0.8 : 0.7;
  const minOpacity = isMobile.value ? 0.4 : 0.35;
  
  const sc = clamp(1 - Math.abs(p) * scaleMultiplier, minScale, 1.04);
  const op = clamp(1 - Math.abs(p) * opacityMultiplier, minOpacity, 1);

  return {
    transform: `translate3d(${x - effectiveCardW.value / 2}px, ${y}px, 0)
                rotate(${rot}deg)`,
    zIndex: String(1000 - Math.abs(p) * 10 | 0),
    opacity: op,
    scale: sc,
  };
}
</script>

<template>
  <div
    class="rb-panel"
    ref="root"
    :class="{ 'mobile': isMobile }"
    :style="{
      '--panel-w': effectiveSize + 'px',
      '--panel-h': panelH + 'px',
      '--card-w': effectiveCardW + 'px',
      '--card-h': effectiveCardH + 'px',
      '--radius': borderRadius + 'px'
    }"
  >
    <div class="rb-inner" ref="wrap">
      <div class="items">
        <button
          v-for="(img, i) in images"
          :key="i"
          class="card"
          :style="styleFor(i)"
          @click="focusIndex(i)"
          :aria-label="`Focus image ${i + 1}`"
        >
          <img :src="img.src" :alt="img.alt || ('image '+(i+1))" loading="lazy" />
          <span v-if="img.caption" class="cap">{{ img.caption }}</span>
        </button>
      </div>
    </div>
    
    <!-- Removed mobile indicators and instruction for cleaner look -->
  </div>
</template>

<style scoped>
/* Panel (dark, rounded) – ReactBits vibe */
.rb-panel{
  width: var(--panel-w);
  height: var(--panel-h);
  margin: 28px auto 0;
  border-radius: var(--radius);
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(254, 254, 254, 0.04);
  overflow: hidden;
  position: relative;
}

/* Inner stage with perspective for nicer depth */
.rb-inner{
  position: absolute;
  inset: 0;
  border-radius: inherit;
  perspective: 1200px;
  overflow: hidden;
}

/* Item layer (we position absolute children) */
.items{
  position: absolute;
  inset: 0;
}

/* Cards */
.card{
  position: absolute;
  top: 60px; /* vertical padding inside the panel */
  left: 0;
  width: var(--card-w);
  height: var(--card-h);
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  transform-origin: center center;
  transition: box-shadow .2s ease;
}

.card:hover{
  box-shadow: 0 14px 40px rgba(0,0,0,.22);
}

.card img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 16px;
}

/* Caption (under the card, like the demo) */
.cap{
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  bottom: -36px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .02em;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  pointer-events: none;
  opacity: .9;
}

/* ─── Mobile-Specific Styles ─────────────────────────────────── */

.rb-panel.mobile {
  margin: 20px auto 0;
  background: transparent; /* Remove box background on mobile */
  box-shadow: none; /* Remove shadow on mobile */
}

.mobile .card {
  top: 40px; /* Less top padding on mobile */
}

.mobile .cap {
  font-size: 14px;
  bottom: -30px;
  color: #333; /* Darker text for better mobile readability */
}

/* Remove all mobile indicator styles since we removed them */

/* ─── Touch Interactions ─────────────────────────────────────── */

@media (max-width: 768px) {
  .card {
    -webkit-tap-highlight-color: transparent;
    touch-action: none;
  }
  
  .card:active {
    box-shadow: 0 8px 25px rgba(0,0,0,.3);
  }
  
  /* Disable hover effects on touch devices */
  .card:hover {
    box-shadow: none;
  }
  
  .rb-panel {
    touch-action: pan-y; /* Allow vertical scrolling but prevent horizontal */
  }
  
  .rb-inner {
    perspective: 800px; /* Reduced perspective for mobile */
  }
}

/* ─── Performance Optimizations ─────────────────────────────── */

@media (max-width: 768px) {
  .card {
    will-change: transform, opacity;
    transform: translateZ(0); /* Force hardware acceleration */
  }
  
  .rb-inner {
    will-change: transform;
  }
  
  /* Reduce animations for better mobile performance */
  @media (prefers-reduced-motion: reduce) {
    .card {
      transition: none;
    }
    
    .indicator {
      transition: none;
    }
  }
}

/* ─── Responsive Size Scaling ────────────────────────────────── */

@media (max-width: 1200px) {
  .rb-panel { 
    width: 90vw; 
    max-width: var(--panel-w);
  }
}

@media (max-width: 900px){
  .rb-panel{ 
    width: 94vw; 
    margin: 16px auto 0;
  }
}

@media (max-width: 768px) {
  .rb-panel {
    width: 96vw;
    margin: 12px auto 0;
    border-radius: 12px;
  }
  
  .cap {
    font-size: 13px;
    bottom: -25px;
  }
  
  .mobile-instruction {
    bottom: -30px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .rb-panel {
    width: 98vw;
    margin: 8px auto 0;
    border-radius: 8px;
  }
  
  .mobile .card {
    top: 30px;
  }
  
  .cap {
    font-size: 12px;
    bottom: -20px;
  }
  
  .mobile-indicators {
    bottom: 10px;
  }
  
  .indicator {
    width: 6px;
    height: 6px;
  }
  
  .mobile-instruction {
    bottom: -25px;
    font-size: 10px;
  }
}

/* ─── Ultra-wide Screens ─────────────────────────────────────── */
@media (min-width: 1600px) {
  .rb-panel {
    max-width: 1200px;
  }
}
</style>
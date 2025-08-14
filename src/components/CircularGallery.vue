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
let startX = 0;
let startOffset = 0;
let wheelRaf = 0;

// one card step in px along X
const stepPx = computed(() => props.cardW + props.gap);

// visible height of panel: card plus some breathing room
const panelH = computed(() => props.cardH + 140);

// helper: animate offset to an index (snap/focus)
function focusIndex(i) {
  gsap.to(offset, { value: i, duration: 0.6, ease: "power3.out" });
}

// drag
function onPointerDown(e) {
  isDown.value = true;
  startX = ("touches" in e ? e.touches[0].clientX : e.clientX) || 0;
  startOffset = offset.value;
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp);
}
function onPointerMove(e) {
  if (!isDown.value) return;
  e.preventDefault();
  const x = ("touches" in e ? e.touches[0].clientX : e.clientX) || 0;
  const dx = x - startX;               // pixels dragged
  offset.value = startOffset - dx / stepPx.value; // 1 step per card width
}
function onPointerUp() {
  isDown.value = false;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
}

// wheel
function onWheel(e) {
  e.preventDefault();
  const delta = (e.deltaY || e.wheelDelta || 0) * 0.0025; // tune wheel sensitivity
  const target = offset.value + delta;
  cancelAnimationFrame(wheelRaf);
  wheelRaf = requestAnimationFrame(() => {
    gsap.to(offset, { value: target, duration: 0.25, ease: "power2.out" });
  });
}

onMounted(() => {
  const el = root.value;
  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("pointerdown", onPointerDown, { passive: false });
});

onBeforeUnmount(() => {
  const el = root.value;
  el?.removeEventListener("wheel", onWheel);
  el?.removeEventListener("pointerdown", onPointerDown);
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
  const c = props.size / 2;          // panel center
  const x = c + p * stepPx.value;
  const y = (props.bend * (p * p) * 0.18); // parabolic arc
  const rot = props.tilt * p;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const sc = clamp(1 - Math.abs(p) * 0.08, 0.7, 1.04);
  const op = clamp(1 - Math.abs(p) * 0.12, 0.35, 1);

  return {
    transform: `translate3d(${x - props.cardW / 2}px, ${y}px, 0)
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
    :style="{
      '--panel-w': size + 'px',
      '--panel-h': panelH + 'px',
      '--card-w': cardW + 'px',
      '--card-h': cardH + 'px',
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
          aria-label="focus"
        >
          <img :src="img.src" :alt="img.alt || ('image '+(i+1))" />
          <span v-if="img.caption" class="cap">{{ img.caption }}</span>
        </button>
      </div>
    </div>
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
  color: #cfd1d6;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .02em;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  pointer-events: none;
  opacity: .9;
}

/* Responsive size scaling */
@media (max-width: 900px){
  .rb-panel{ width: 94vw; }
}
</style>

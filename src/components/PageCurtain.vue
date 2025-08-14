<template>
  <div ref="wrap" class="curtain-wrap" aria-hidden="true">
    <!-- dims the old page -->
    <div ref="dim" class="curtain-dim"></div>
    <!-- the white page that rises OVER the old page -->
    <div ref="panel" class="curtain-panel"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { gsap } from "gsap";

const wrap  = ref(null);
const dim   = ref(null);
const panel = ref(null);

onMounted(() => {
  gsap.set(wrap.value,  { autoAlpha: 0, pointerEvents: "none" });
  gsap.set(dim.value,   { autoAlpha: 0 });
  gsap.set(panel.value, { yPercent: 100, boxShadow: "0 30px 80px rgba(0,0,0,.20)" });
});

/* 1) Cover: white page rises. (Only upward motion happens here.) */
function cover() {
  document.documentElement.classList.add("is-transitioning");
  return new Promise((resolve) => {
    gsap.set(wrap.value, { autoAlpha: 1, pointerEvents: "auto" });
    const tl = gsap.timeline({ onComplete: resolve });
    tl.to(dim.value,   { autoAlpha: 0.18, duration: 0.22, ease: "power2.out" }, 0)
      .to(panel.value, { yPercent: 0, duration: 0.45, ease: "power3.out" }, 0.02);
  });
}

/* 2) Reveal: NO second slide. Just fade the white page away in place. */
function reveal() {
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        // reset back to start instantly for the next navigation
        gsap.set(panel.value, { yPercent: 100, autoAlpha: 1 });
        gsap.set(dim.value,   { autoAlpha: 0 });
        gsap.set(wrap.value,  { autoAlpha: 0, pointerEvents: "none" });
        document.documentElement.classList.remove("is-transitioning");
        resolve();
      }
    });
    tl.to([panel.value, dim.value], {
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.inOut",
    });
  });
}

defineExpose({ cover, reveal });
</script>

<style scoped>
.curtain-wrap{
  position: fixed;
  inset: 0;
  z-index: 4000; /* above header and content */
  pointer-events: none;
}

.curtain-dim{
  position: absolute; inset: 0;
  background: #000;
  opacity: 0;
}

.curtain-panel{
  position: absolute; left: 0; right: 0; bottom: 0; top: auto;
  height: 120vh; /* taller for nice overshoot */
  background: #fff; /* plain white slab */
  will-change: transform, box-shadow, opacity;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}
</style>

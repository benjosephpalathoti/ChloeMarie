<template>
  <div class="featured-images-art">
    <div
      v-for="(img, i) in images"
      :key="i"
      class="featured-image"
      :class="['img-' + (i + 1), { 'is-visible': visible[i] }]"
      :style="{ '--i': i }"
      ref="cards"
    >
      <img
        :src="img.src"
        :alt="img.alt"
        loading="lazy"
        decoding="async"
        sizes="(max-width: 900px) 95vw, (max-width: 1280px) 40vw, 25vw"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "FeaturedImages",
  props: { images: Array },
  data() {
    return {
      io: null,
      visible: [] // boolean per item for reveal state
    };
  },
  mounted() {
    // initialize vis flags
    this.visible = this.images.map(() => false);

    // IntersectionObserver: reveal once when 15% visible
    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const idx = Number(e.target.dataset.idx);
          if (e.isIntersecting && !this.visible[idx]) {
            this.$set(this.visible, idx, true);
            this.io.unobserve(e.target);
          }
        }
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );

    // Observe each card
    const nodes = this.$refs.cards || [];
    nodes.forEach((el, i) => {
      el.dataset.idx = i;
      this.io.observe(el);
    });
  },
  beforeUnmount() {
    this.io?.disconnect?.();
  }
};
</script>

<style scoped>
/* ---------- Grid container (unchanged, still responsive) ---------- */
.featured-images-art {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 100px;
  gap: clamp(24px, 6vw, 80px) clamp(16px, 4.5vw, 56px);
  width: 100%;
  margin: 0 auto;
  padding-top: clamp(40px, 8vw, 80px);
  position: relative;
  overflow-x: hidden;
}

/* Base card box */
.featured-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  overflow: hidden;
  justify-self: center;
  align-self: center;
  border-radius: 0;

  /* --- Reveal preset (initial state) --- */
  opacity: 0;
  transform: translateY(22px) scale(0.985);
  filter: saturate(0.85) blur(2px);
  /* Smooth, snappy easing; GPU-friendly */
  transition:
    opacity .70s cubic-bezier(.22,.61,.36,1),
    transform .70s cubic-bezier(.22,.61,.36,1),
    filter .70s cubic-bezier(.22,.61,.36,1);
  /* Stagger by index: 0ms, 60ms, 120ms, ... */
  transition-delay: calc(var(--i, 0) * 60ms);
  will-change: opacity, transform, filter;
}

/* When observed in view */
.featured-image.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: none;
}

/* Slight image “pop” following the container by 90ms */
.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transform: translateY(8px) scale(.995);
  transition:
    transform .70s cubic-bezier(.22,.61,.36,1) calc(var(--i,0) * 60ms + 90ms),
    opacity .70s cubic-bezier(.22,.61,.36,1)   calc(var(--i,0) * 60ms + 90ms);
  opacity: .001; /* avoids flash of unstyled content while lazy loads */
}
.featured-image.is-visible img {
  transform: translateY(0) scale(1);
  opacity: 1;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  .featured-image,
  .featured-image img {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
    filter: none !important;
  }
}

/* ===== Desktop composition (your fluid sizes & ratios) ===== */
.img-1 { grid-column: 2 / 4; grid-row: span 5; width: clamp(260px, 26vw, 380px); aspect-ratio: 380 / 520; }
.img-2 { grid-column: 1 / 2; grid-row: span 4; width: clamp(300px, 30vw, 440px); aspect-ratio: 11 / 10; }
.img-3 { grid-column: 5 / 7; grid-row: span 3; width: clamp(160px, 18vw, 220px); aspect-ratio: 220 / 250; }
.img-4 { grid-column: 1 / 2; grid-row: span 4; width: clamp(220px, 22vw, 310px); aspect-ratio: 310 / 414; }
.img-5 { grid-column: 5 / 7; grid-row: span 4; width: clamp(240px, 26vw, 320px); aspect-ratio: 320 / 398; }
.img-6 { grid-column: 1 / 2; grid-row: span 5; width: clamp(320px, 34vw, 470px); aspect-ratio: 470 / 460; }
.img-7 { grid-column: 5 / 7; grid-row: span 4; width: clamp(260px, 30vw, 390px); aspect-ratio: 1 / 1; }

@media (max-width: 1200px) {
  .featured-images-art { grid-auto-rows: 80px; }
}

/* ===== Mobile: stack; keep per-item aspect-ratio ===== */
@media (max-width: 900px) {
  .featured-images-art {
    grid-template-columns: 1fr !important;
    grid-auto-rows: auto !important;
    gap: 24px !important;
    padding: 24px 0;
  }
  .featured-image,
  .img-1, .img-2, .img-3, .img-4, .img-5, .img-6, .img-7 {
    grid-column: auto !important;
    grid-row: auto !important;
    width: 95vw !important;
    max-width: 430px;
    min-width: 210px;
    height: auto !important;
  }
  .featured-image img { border-radius: 0.5rem; }
}
</style>

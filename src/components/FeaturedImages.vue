<template>
  <div class="featured-images-art">
    <div
      v-for="(img, i) in images"
      :key="i"
      class="featured-image"
      :class="'img-' + (i + 1)"
    >
      <img :src="img.src" :alt="img.alt || ''" loading="lazy" />
    </div>
  </div>
</template>

<script>
export default {
  name: "FeaturedImages",
  props: {
    // expects: [{ src:'/assets/images/featured1.jpg', alt?:string }, ...]
    images: { type: Array, default: () => [] }
  }
};
</script>

<style scoped>
/* ─── Desktop (unchanged) ───────────────────────────────────── */
.featured-images-art {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(5, 614px);
  gap: 80px 56px;
  width: 100%;
  margin: 0 auto;
  padding-top: 80px;
  position: relative;
  overflow-x: hidden;
}

.featured-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  overflow: hidden;
  justify-self: center;
  align-self: center;
  transition: transform 0.3s ease;
}

.featured-image:hover {
  transform: translateY(-4px);
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 0;
}

/* Fixed grid placements (unchanged) */
.img-1 { grid-column: 2 / 4; grid-row: 1 / 2; width: 380px; height: 520px; }
.img-2 { grid-column: 1 / 2; grid-row: 2 / 3; width: 440px; height: 400px; }
.img-3 { grid-column: 5 / 7; grid-row: 2 / 4; width: 220px; height: 250px; }
.img-4 { grid-column: 1 / 2; grid-row: 2 / 5; width: 310px; height: 414px; }
.img-5 { grid-column: 5 / 7; grid-row: 3 / 5; width: 320px; height: 398px; }
.img-6 { grid-column: 1 / 2; grid-row: 4 / 6; width: 470px; height: 460px; }
.img-7 { grid-column: 5 / 7; grid-row: 5 / 6; width: 390px; height: 390px; }

/* ─── Large Tablet (unchanged) ──────────────────────────────── */
@media (max-width: 1200px) and (min-width: 1025px) {
  .featured-images-art { gap: 60px 40px; padding-top: 60px; }
  .img-1 { width: 320px; height: 440px; }
  .img-2 { width: 380px; height: 340px; }
  .img-3 { width: 190px; height: 220px; }
  .img-4 { width: 280px; height: 370px; }
  .img-5 { width: 290px; height: 350px; }
  .img-6 { width: 420px; height: 410px; }
  .img-7 { width: 340px; height: 340px; }
}

/* ─── Tablet (unchanged) ───────────────────────────────────── */
@media (max-width: 1024px) and (min-width: 769px) {
  .featured-images-art {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 300px);
    gap: 40px 30px;
    padding-top: 50px;
  }
  .img-1 { grid-column: 1 / 3; grid-row: 1; width: 100%; height: 100%; }
  .img-2 { grid-column: 3 / 5; grid-row: 1; width: 100%; height: 100%; }
  .img-3 { grid-column: 1 / 2; grid-row: 2; width: 100%; height: 100%; }
  .img-4 { grid-column: 2 / 4; grid-row: 2; width: 100%; height: 100%; }
  .img-5 { grid-column: 4 / 5; grid-row: 2; width: 100%; height: 100%; }
  .img-6 { grid-column: 1 / 3; grid-row: 3; width: 100%; height: 100%; }
  .img-7 { grid-column: 3 / 5; grid-row: 3; width: 100%; height: 100%; }
}

/* ===== MOBILE CHANGES (smaller items + lots of spacing) ===== */

/* Mobile ≤ 768px */
@media (max-width: 768px) {
  /* Switch to a simple vertical stack with big gaps */
  .featured-images-art {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 160px !important;          /* ← lots of space between images */
    padding: 60px 0 !important;
    margin-top: 0 !important;
  }

  .featured-image {
    /* Small containers on mobile */
    width: clamp(160px, 58vw, 360px) !important;
    height: auto !important;
    grid-column: unset !important;
    grid-row: unset !important;
    padding: 0 !important;
    position: relative;
    transform: none !important;      /* no hover lift on touch */
    margin: 0 auto !important;
  }

  .featured-image img {
    width: 100%;
    height: auto;
    object-fit: cover !important;
    object-position: center;
    border-radius: 0 !important;
  }

  /* Slight rhythm (optional): alternate a bit */
  .featured-image:nth-child(odd)  { width: clamp(150px, 54vw, 330px) !important; }
  .featured-image:nth-child(even) { width: clamp(170px, 62vw, 370px) !important; }
}

/* Small mobile ≤ 480px (extra spacing & slightly smaller) */
@media (max-width: 480px) {
  .featured-images-art { gap: 180px !important; padding: 40px 0 !important; }
  .featured-image       { width: clamp(140px, 64vw, 320px) !important; }
  .featured-image:nth-child(odd)  { width: clamp(130px, 60vw, 300px) !important; }
  .featured-image:nth-child(even) { width: clamp(150px, 68vw, 330px) !important; }
}

/* Accessibility tweaks (unchanged) */
.featured-image { outline: none; }
.featured-image:focus-visible { outline: 2px solid #0066cc; outline-offset: 4px; }

/* Ultra-wide (unchanged) */
@media (min-width: 1600px) {
  .featured-images-art { max-width: 1400px; margin: 0 auto; }
}
</style>

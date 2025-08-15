<template>
  <div class="featured-images-art">
    <div
      v-for="(img, i) in images"
      :key="i"
      class="featured-image"
      :class="'img-' + (i + 1)"
    >
      <img :src="img.src" :alt="img.alt || ''" />
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
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 0;
}

/* Fixed grid placements */
.img-1 {
  grid-column: 2 / 4;
  grid-row: 1 / 2;
  width: 380px;
  height: 520px;
}
.img-2 {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  width: 440px;
  height: 400px;
}
.img-3 {
  grid-column: 5 / 7;
  grid-row: 2 / 4;
  width: 220px;
  height: 250px;
}
.img-4 {
  grid-column: 1 / 2; /* ✅ Fixed span */
  grid-row: 2 / 5;
  width: 310px;
  height: 414px;
}
.img-5 {
  grid-column: 5 / 7;
  grid-row: 3 / 5;
  width: 320px;
  height: 398px;
}
.img-6 {
  grid-column: 1 / 2;
  grid-row: 4 / 6;
  width: 470px;
  height: 460px;
}
.img-7 {
  grid-column: 5 / 7;
  grid-row: 5 / 6;
  width: 390px;
  height: 390px;
}

@media (max-width: 900px) {
  .featured-images-art {
    grid-template-columns: 1fr !important;
    grid-template-rows: none !important;
    gap: 24px !important;
    padding: 24px 0;
  }
  .featured-image {
    width: 95vw !important;
    height: 60vw !important;
    max-width: 430px;
    min-width: 210px;
    max-height: 480px;
  }
  .featured-image img {
    border-radius: 0.5rem;
  }
}

</style>

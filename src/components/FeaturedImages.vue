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

/* ─── Desktop Grid Placements ───────────────────────────────── */

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

/* ─── Large Tablet (1024px - 1200px) ────────────────────────── */
@media (max-width: 1200px) and (min-width: 1025px) {
  .featured-images-art {
    gap: 60px 40px;
    padding-top: 60px;
  }
  
  /* Scale down all images proportionally */
  .img-1 { width: 320px; height: 440px; }
  .img-2 { width: 380px; height: 340px; }
  .img-3 { width: 190px; height: 220px; }
  .img-4 { width: 280px; height: 370px; }
  .img-5 { width: 290px; height: 350px; }
  .img-6 { width: 420px; height: 410px; }
  .img-7 { width: 340px; height: 340px; }
}

/* ─── Tablet (768px - 1024px) ────────────────────────────────── */
@media (max-width: 1024px) and (min-width: 769px) {
  .featured-images-art {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 300px);
    gap: 40px 30px;
    padding-top: 50px;
  }
  
  /* Reposition for 4-column grid */
  .img-1 { grid-column: 1 / 3; grid-row: 1; width: 100%; height: 100%; }
  .img-2 { grid-column: 3 / 5; grid-row: 1; width: 100%; height: 100%; }
  .img-3 { grid-column: 1 / 2; grid-row: 2; width: 100%; height: 100%; }
  .img-4 { grid-column: 2 / 4; grid-row: 2; width: 100%; height: 100%; }
  .img-5 { grid-column: 4 / 5; grid-row: 2; width: 100%; height: 100%; }
  .img-6 { grid-column: 1 / 3; grid-row: 3; width: 100%; height: 100%; }
  .img-7 { grid-column: 3 / 5; grid-row: 3; width: 100%; height: 100%; }
}

/* ===== MOBILE CHANGES START HERE ===== */

/* ─── Mobile Layout (up to 768px) - Match Target Design ─────── */
@media (max-width: 768px) {
  .featured-images-art {
    display: flex !important;
    flex-direction: column !important;
    gap: 40px !important; /* Good spacing between images */
    padding: 40px 0 !important;
    margin-top: 0 !important;
  }
  
  .featured-image {
    width: 100vw !important;
    height: auto !important;
    grid-column: unset !important;
    grid-row: unset !important;
    margin: 0 !important;
    padding: 0 !important;
    position: relative;
    transform: none !important;
  }
  
  /* Remove hover effects on mobile */
  .featured-image:hover,
  .featured-image:active {
    transform: none !important;
  }
  
  .featured-image img {
    width: 100%;
    height: 100%;
    object-fit: cover !important; /* Cover to fill the viewport */
    object-position: center;
    border-radius: 0 !important;
  }
  
  /* Varied heights for visual rhythm - alternating big/small pattern */
  .featured-image:nth-child(1) {
    height: 85vh !important; /* Big */
  }
  
  .featured-image:nth-child(2) {
    height: 65vh !important; /* Smaller */
  }
  
  .featured-image:nth-child(3) {
    height: 75vh !important; /* Medium-big */
  }
  
  .featured-image:nth-child(4) {
    height: 60vh !important; /* Small */
  }
  
  .featured-image:nth-child(5) {
    height: 80vh !important; /* Big */
  }
  
  .featured-image:nth-child(6) {
    height: 70vh !important; /* Medium */
  }
  
  .featured-image:nth-child(7) {
    height: 90vh !important; /* Biggest - grand finale */
  }
}

/* ─── Small Mobile (up to 480px) - Adjusted heights for smaller screens ─── */
@media (max-width: 480px) {
  .featured-images-art {
    gap: 30px !important; /* Slightly less gap on small screens */
    padding: 30px 0 !important;
  }
  
  /* Slightly reduced heights for small screens but maintain rhythm */
  .featured-image:nth-child(1) {
    height: 75vh !important; /* Big */
  }
  
  .featured-image:nth-child(2) {
    height: 55vh !important; /* Smaller */
  }
  
  .featured-image:nth-child(3) {
    height: 65vh !important; /* Medium-big */
  }
  
  .featured-image:nth-child(4) {
    height: 50vh !important; /* Small */
  }
  
  .featured-image:nth-child(5) {
    height: 70vh !important; /* Big */
  }
  
  .featured-image:nth-child(6) {
    height: 60vh !important; /* Medium */
  }
  
  .featured-image:nth-child(7) {
    height: 80vh !important; /* Biggest */
  }
}

/* ─── Performance Optimizations for Mobile ─────────────────── */
@media (max-width: 768px) {
  .featured-image {
    will-change: auto;
    transform: translateZ(0);
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .featured-image {
      transition: none;
    }
  }
}

/* ─── Accessibility Improvements ────────────────────────────── */
.featured-image {
  outline: none;
}

.featured-image:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 4px;
}

/* ─── Ultra-wide Screens ─────────────────────────────────────── */
@media (min-width: 1600px) {
  .featured-images-art {
    max-width: 1400px;
    margin: 0 auto;
  }
}
</style>
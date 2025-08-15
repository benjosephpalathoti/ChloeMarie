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

/* ─── Large Mobile (481px - 768px) ───────────────────────────── */
@media (max-width: 768px) and (min-width: 481px) {
  .featured-images-art {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: none;
    gap: 30px 20px;
    padding: 40px 16px;
  }
  
  /* Reset all positioning for 2-column mobile grid */
  .featured-image {
    grid-column: auto;
    grid-row: auto;
    width: 100%;
    height: clamp(250px, 50vw, 350px);
    max-width: none;
    min-width: none;
    max-height: none;
  }
  
  .featured-image img {
    border-radius: 8px;
  }
  
  /* Hover effects for touch devices */
  .featured-image:active {
    transform: scale(0.98);
  }
}

/* ─── Small Mobile (up to 480px) ─────────────────────────────── */
@media (max-width: 480px) {
  .featured-images-art {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 30px 12px;
  }
  
  .featured-image {
    width: 100%;
    height: clamp(200px, 60vw, 300px);
  }
  
  .featured-image img {
    border-radius: 6px;
  }
}

/* ─── Performance Optimizations ─────────────────────────────── */
@media (max-width: 768px) {
  .featured-image {
    will-change: transform;
    transform: translateZ(0);
  }
  
  /* Touch-friendly interactions */
  .featured-image {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  /* Reduce motion for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    .featured-image {
      transition: none;
    }
    
    .featured-image:hover,
    .featured-image:active {
      transform: none;
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

/* ─── Original Mobile Breakpoint Enhanced ───────────────────── */
@media (max-width: 900px) {   
  .featured-images-art {     
    grid-template-columns: 1fr !important;     
    grid-template-rows: none !important;     
    gap: 24px !important;     
    padding: 24px 16px;   
  }   
  
  .featured-image {     
    width: 100% !important;     
    height: clamp(240px, 55vw, 400px) !important;     
    max-width: 500px;     
    min-width: auto;     
    max-height: none;   
  }   
  
  .featured-image img {     
    border-radius: 8px;   
  } 
}

/* ─── Ultra-wide Screens ─────────────────────────────────────── */
@media (min-width: 1600px) {
  .featured-images-art {
    max-width: 1400px;
    margin: 0 auto;
  }
}
</style>
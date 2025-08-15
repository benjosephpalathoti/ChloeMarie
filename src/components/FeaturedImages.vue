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
    gap: 0 !important; /* We'll use individual margins instead */
    padding: 60px 0 !important;
    margin-top: 0 !important;
    align-items: center !important; /* Center all images */
  }
  
  .featured-image {
    grid-column: unset !important;
    grid-row: unset !important;
    padding: 0 !important;
    position: relative;
    transform: none !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
  
  /* Remove hover effects on mobile */
  .featured-image:hover,
  .featured-image:active {
    transform: none !important;
  }
  
  .featured-image img {
    width: 100%;
    height: 100%;
    object-fit: cover !important;
    object-position: center;
    border-radius: 0 !important;
  }
  
  /* Individual image sizing and spacing - matching screenshots */
  .featured-image:nth-child(1) {
    width: 15vw !important;  /* Slightly narrower than full width */
    height: 35vh !important;  /* Medium height */
    margin-bottom: 380px !important;  /* Space after */
  }
  
  .featured-image:nth-child(2) {
    width: 70vw !important;  /* Almost full width */
    height: 45vh !important;  /* Shorter */
    margin-bottom: 200px !important;  /* More space */
  }
  
  .featured-image:nth-child(3) {
    width: 35vw !important;  /* Narrower */
    height: 60vh !important;  /* Taller */
    margin-bottom: 170px !important;
  }
  
  .featured-image:nth-child(4) {
    width: 95vw !important;  /* Very wide */
    height: 40vh !important;  /* Short and wide */
    margin-bottom: 190px !important;
  }
  
  .featured-image:nth-child(5) {
    width: 80vw !important;  /* Medium width */
    height: 65vh !important;  /* Tall */
    margin-bottom: 85px !important;
  }
  
  .featured-image:nth-child(6) {
    width: 88vw !important;  
    height: 50vh !important;  /* Medium */
    margin-bottom: 75px !important;
  }
  
  .featured-image:nth-child(7) {
    width: 92vw !important;  /* Almost full for finale */
    height: 70vh !important;  /* Tallest */
    margin-bottom: 60px !important;
  }
}

/* ─── Small Mobile (up to 480px) - Adjusted for smaller screens ─── */
@media (max-width: 480px) {
  .featured-images-art {
    padding: 40px 0 !important;
  }
  
  /* Slightly adjusted dimensions for small screens */
  .featured-image:nth-child(1) {
    width: 90vw !important;  /* Wider on small screens */
    height: 50vh !important;  
    margin-bottom: 60px !important;  /* Less space on small screens */
  }
  
  .featured-image:nth-child(2) {
    width: 95vw !important;
    height: 40vh !important;
    margin-bottom: 70px !important;
  }
  
  .featured-image:nth-child(3) {
    width: 80vw !important;
    height: 55vh !important;
    margin-bottom: 55px !important;
  }
  
  .featured-image:nth-child(4) {
    width: 100vw !important;  /* Full width on small */
    height: 35vh !important;
    margin-bottom: 65px !important;
  }
  
  .featured-image:nth-child(5) {
    width: 85vw !important;
    height: 60vh !important;
    margin-bottom: 60px !important;
  }
  
  .featured-image:nth-child(6) {
    width: 92vw !important;
    height: 45vh !important;
    margin-bottom: 55px !important;
  }
  
  .featured-image:nth-child(7) {
    width: 95vw !important;
    height: 65vh !important;
    margin-bottom: 40px !important;
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
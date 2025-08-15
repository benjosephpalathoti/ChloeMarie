<template>
  <div>
    <!-- Main page container (your existing 1440px centered wrapper) -->
    <div class="container">
      <!-- Hero / landing -->
      <div class="index white-bg" style="position: relative; min-height: 100vh;">
        <!-- Hero image -->
        <img class="hero" src="/assets/images/hero-photo.png" alt="Hero image" data-reveal="wipe"/>

        <!-- Big logo proxy: invisible, used to set the header-logo start pos/scale (DESKTOP ONLY) -->
        <div class="hero-logo-proxy desktop-only" aria-hidden="true">
          CHLOE<br/>MARIE
        </div>

        <!-- Small photo/copyright -->
        <div class="footer-block-initial" data-reveal="wipe">
          <img src="/assets/images/small-photo.jpg" alt="Portrait" />
        </div>
      </div>

      <!-- Featured Images -->
      <section class="featured-section">
        <FeaturedImages :images="featuredImages" />
      </section>

      <!-- Circular (ReactBits-style) Gallery slice -->
      <section class="circular-gallery-section" data-reveal="wipe">
        <CircularGallery
          :images="circularImages"
          :size="circularGallerySize"
          :card-w="circularCardWidth"
          :card-h="circularCardHeight"
          :gap="circularGap"
          :bend="circularBend"
          :tilt="circularTilt"
        />
      </section>
    </div>
  </div>
</template>

<script>
import FeaturedImages from "../components/FeaturedImages.vue";
import CircularGallery from "../components/CircularGallery.vue";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default {
  name: "IndexPage",
  components: { FeaturedImages, CircularGallery },
  data() {
    return {
      featuredImages: [
        { src: "/assets/images/featured1.jpg", caption: "Portrait, Paris", alt: "Featured 1" },
        { src: "/assets/images/featured2.jpg", caption: "Fashion", alt: "Featured 2" },
        { src: "/assets/images/featured3.jpg", caption: "Editorial", alt: "Featured 3" },
        { src: "/assets/images/featured4.jpg", caption: "Street", alt: "Featured 4" },
        { src: "/assets/images/featured5.jpg", caption: "Travel", alt: "Featured 5" },
        { src: "/assets/images/featured6.jpg", caption: "Studio", alt: "Featured 6" },
        { src: "/assets/images/featured7.jpg", caption: "Studio", alt: "Featured 7" },
      ],
      circularImages: [
        { src: "/assets/circular/01.jpeg", },
        { src: "/assets/circular/02.jpeg", },
        { src: "/assets/circular/03.jpg",},
        { src: "/assets/circular/04.png", },
        { src: "/assets/circular/05.jpeg", },
        { src: "/assets/circular/06.jpeg", },
        { src: "/assets/circular/07.jpeg",  },
      ],
      // Responsive circular gallery settings
      windowWidth: 0,
      isMobile: false
    };
  },
  computed: {
    // Responsive circular gallery properties
    circularGallerySize() {
      if (this.windowWidth <= 480) return 300;
      if (this.windowWidth <= 768) return 400;
      if (this.windowWidth <= 1024) return 600;
      return 1080;
    },
    circularCardWidth() {
      if (this.windowWidth <= 480) return 120;
      if (this.windowWidth <= 768) return 150;
      if (this.windowWidth <= 1024) return 200;
      return 260;
    },
    circularCardHeight() {
      if (this.windowWidth <= 480) return 160;
      if (this.windowWidth <= 768) return 200;
      if (this.windowWidth <= 1024) return 260;
      return 340;
    },
    circularGap() {
      if (this.windowWidth <= 480) return 16;
      if (this.windowWidth <= 768) return 20;
      if (this.windowWidth <= 1024) return 24;
      return 34;
    },
    circularBend() {
      if (this.windowWidth <= 768) return 80;
      return 120;
    },
    circularTilt() {
      if (this.windowWidth <= 768) return 5;
      return 10;
    }
  },
  mounted() {
    this.updateWindowWidth();
    this.checkMobile();
    
    // Only init logo animation on desktop
    if (!this.isMobile) {
      this.initLogoDock();
    }
    
    window.addEventListener("resize", this.handleResize, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    ScrollTrigger.getAll().forEach(t => t.kill());
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    
    handleResize() {
      const wasMobile = this.isMobile;
      this.updateWindowWidth();
      this.checkMobile();
      
      // If switched from mobile to desktop, init logo animation
      if (wasMobile && !this.isMobile) {
        this.initLogoDock();
      }
      // If switched to mobile, kill logo animation and reset header logo
      else if (!wasMobile && this.isMobile) {
        if (this._logoTL) {
          this._logoTL.kill();
          this._logoTL = null;
        }
        // Reset header logo to normal App.vue mobile position
        const headerLogo = document.querySelector(".header-logo");
        if (headerLogo) {
          gsap.set(headerLogo, { 
            clearProps: "all",
            force3D: false 
          });
        }
      }
      // If staying desktop, refresh
      else if (!this.isMobile) {
        this.refreshLogoDock();
      }
    },
    
    updateWindowWidth() {
      this.windowWidth = window.innerWidth;
    },
    
    // Animate the fixed .header-logo from the proxy's start rect -> its final rect (DESKTOP ONLY)
    initLogoDock() {
      if (this.isMobile) return; // Skip on mobile
      
      // Wait a bit for App.vue to render properly
      setTimeout(() => {
        const headerLogo = document.querySelector(".header-logo");
        const proxy = document.querySelector(".hero-logo-proxy");
        if (!headerLogo || !proxy) return;

        const setup = () => {
          if (this.isMobile) return; // Double check
          
          // Ensure we're working with the current state
          const hBox = headerLogo.getBoundingClientRect();
          const pBox = proxy.getBoundingClientRect();

          // Safety check for valid measurements
          if (hBox.width === 0 || pBox.width === 0) return;

          const hSize = parseFloat(getComputedStyle(headerLogo).fontSize);
          const pSize = parseFloat(getComputedStyle(proxy).fontSize);
          const scaleStart = pSize / hSize;

          const dx = pBox.left - hBox.left;
          const dy = pBox.top  - hBox.top;

          // Start the header logo visually over the proxy
          gsap.set(headerLogo, { 
            x: dx, 
            y: dy, 
            scale: scaleStart, 
            transformOrigin: "0 0",
            force3D: true // Better mobile performance
          });

          // Kill previous timeline if any
          if (this._logoTL) this._logoTL.kill();

          // Scrub to neutral (x:0,y:0, scale:1)
          this._logoTL = gsap.timeline({
            scrollTrigger: {
              trigger: document.body,
              start: "top top",
              end: () => "+=" + Math.round(window.innerHeight * 3.5), // longer = slower shrink
              scrub: 1.1,
              invalidateOnRefresh: true,
              onRefresh: () => {
                // Recalculate on refresh to stay in sync
                if (!this.isMobile) setup();
              }
            }
          })
          .to(headerLogo, { 
            x: 0, 
            y: 0, 
            scale: 1, 
            ease: "none",
            force3D: true
          }, 0);
        };

        setup();
        this._recomputeLogo = setup;
      }, 100); // Small delay to ensure App.vue is fully rendered
    },
    
    refreshLogoDock() {
      if (this.isMobile || !this._recomputeLogo) return;
      this._recomputeLogo();
      ScrollTrigger.refresh();
    }
  }
};
</script>

<style scoped>
/* Big hero logo proxy (invisible; only for measuring the start position/size) - DESKTOP ONLY */
.hero-logo-proxy{
  position: absolute;
  left: -48px;
  top: 15px;
  font-family: 'Oswald', Arial, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  line-height: .55;
  letter-spacing: -0.02em;
  font-size: 13.5vw;     /* initial huge size; tweak as needed */
  visibility: hidden;  /* keep hidden; header-logo is the visible one */
  pointer-events: none;
}

/* Circular gallery section spacing */
.circular-gallery-section{
  padding: 72px 0 96px;
  display: flex;
  justify-content: center;
}

/* Keep hero layers under the fixed header */
.index .hero,
.index .left,
.footer-block-initial{ 
  z-index: 100; 
  position: relative; 
}

/* ─── Responsive Display Control ────────────────────────────── */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: block;
  }
}

/* ─── Mobile Responsive Styles ────────────────────────────────── */

/* Mobile adjustments for hero section */
@media (max-width: 768px) {
  .index {
    min-height: auto !important;
    padding-bottom: 2rem;
  }
  
  .circular-gallery-section {
    padding: 40px 16px 60px;
    overflow-x: hidden;
  }
  
  .featured-section {
    padding: 2rem 16px;
  }
}

@media (max-width: 480px) {
  .circular-gallery-section {
    padding: 30px 12px 40px;
  }
  
  .featured-section {
    padding: 1.5rem 12px;
  }
}

/* Ensure proper spacing on mobile */
@media (max-width: 768px) {
  .container {
    padding-left: 0;
    padding-right: 0;
  }
}

/* Mobile hero layout adjustments - NO LARGE LOGO SPACE NEEDED */
@media (max-width: 768px) {
  .index .hero {
    margin-top: 80px; /* Only account for fixed header */
    margin-bottom: 2rem;
  }
  
  .footer-block-initial {
    margin: 2rem 16px;
  }
}

@media (max-width: 480px) {
  .index .hero {
    margin-top: 80px; /* Consistent header space */
    margin-bottom: 1.5rem;
  }
  
  .footer-block-initial {
    margin: 1.5rem 12px;
  }
}

/* Touch-friendly circular gallery on mobile */
@media (max-width: 768px) {
  .circular-gallery-section {
    touch-action: pan-x;
    -webkit-overflow-scrolling: touch;
  }
}

/* Responsive container max-width adjustments */
@media (max-width: 1440px) {
  .container {
    max-width: 100%;
  }
}

/* Prevent horizontal overflow on mobile */
@media (max-width: 768px) {
  .index {
    overflow-x: hidden;
  }
  
  * {
    max-width: 100%;
    box-sizing: border-box;
  }
}

/* Improve performance on mobile */
@media (max-width: 768px) {
  .index .hero,
  .footer-block-initial {
    will-change: auto;
    transform: translateZ(0);
  }
}
</style>
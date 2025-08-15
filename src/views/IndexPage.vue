<template>
  <div>
    <!-- Main page container (your existing 1440px centered wrapper) -->
    <div class="container">
      <!-- Hero / landing -->
      <div class="index white-bg" style="position: relative; min-height: 100vh;">
        <!-- Hero image -->
        <img class="hero" src="/assets/images/hero-photo.png" alt="Hero image" data-reveal="wipe"/>

        <!-- Big logo proxy: invisible, used to set the header-logo start pos/scale -->
        <div class="hero-logo-proxy" aria-hidden="true">
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

      <!-- If you don't have this component, leave it commented -->
      <!-- <FeaturedProject /> -->
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
      windowWidth: 0
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
    this.initLogoDock();
    this.updateWindowWidth();
    window.addEventListener("resize", this.handleResize, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    ScrollTrigger.getAll().forEach(t => t.kill());
  },
  methods: {
    handleResize() {
      this.refreshLogoDock();
      this.updateWindowWidth();
    },
    updateWindowWidth() {
      this.windowWidth = window.innerWidth;
    },
    // Animate the fixed .header-logo from the proxy's start rect -> its final rect
    initLogoDock() {
      const headerLogo = document.querySelector(".header-logo");
      const proxy = document.querySelector(".hero-logo-proxy");
      if (!headerLogo || !proxy) return;

      const setup = () => {
        const isMobile = window.innerWidth <= 768;
        const hBox = headerLogo.getBoundingClientRect();
        const pBox = proxy.getBoundingClientRect();

        const hSize = parseFloat(getComputedStyle(headerLogo).fontSize);
        const pSize = parseFloat(getComputedStyle(proxy).fontSize);
        const scaleStart = pSize / hSize;

        // On mobile, we only need to scale, not translate
        if (isMobile) {
          // Mobile: only scale animation, no position change
          gsap.set(headerLogo, { 
            scale: scaleStart, 
            transformOrigin: "left top",
            force3D: true // Enable GPU acceleration
          });

          // Kill previous timeline if any
          if (this._logoTL) this._logoTL.kill();

          this._logoTL = gsap.timeline({
            scrollTrigger: {
              trigger: document.body,
              start: "top top",
              end: () => "+=" + Math.round(window.innerHeight * 1.5), // Faster on mobile
              scrub: 0.8,
              invalidateOnRefresh: true
            }
          })
          .to(headerLogo, { scale: 1, ease: "power2.out" }, 0);
        } else {
          // Desktop: original animation with position and scale
          const dx = pBox.left - hBox.left;
          const dy = pBox.top  - hBox.top;

          gsap.set(headerLogo, { x: dx, y: dy, scale: scaleStart, transformOrigin: "0 0" });

          if (this._logoTL) this._logoTL.kill();

          this._logoTL = gsap.timeline({
            scrollTrigger: {
              trigger: document.body,
              start: "top top",
              end: () => "+=" + Math.round(window.innerHeight * 3.5),
              scrub: 1.1,
              invalidateOnRefresh: true
            }
          })
          .to(headerLogo, { x: 0, y: 0, scale: 1, ease: "none" }, 0);
        }
      };

      setup();
      this._recomputeLogo = setup;
    },
    refreshLogoDock() {
      if (this._recomputeLogo) this._recomputeLogo();
      ScrollTrigger.refresh();
    }
  }
};
</script>

<style scoped>
/* Big hero logo proxy (invisible; only for measuring the start position/size) */
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

/* ===== MOBILE CHANGES START HERE ===== */

/* Mobile responsive proxy positioning to match target design */
@media (max-width: 768px) {
  .hero-logo-proxy {
    left: 16px;
    top: 16px; /* Start at same position as header logo for smooth animation */
    font-size: 22vw; /* Large initial size - will scale down with GSAP */
    line-height: 0.82;
    font-weight: 900;
    letter-spacing: -0.04em;
  }
  
  /* Mobile adjustments for hero section */
  .index {
    min-height: auto !important;
    padding-bottom: 0;
    background: #fff;
  }
  
  /* Hero image positioned below the large animated text */
  .index .hero {
    position: relative;
    margin-top: 35vh; /* Space for the large logo text */
    width: 100vw;
    max-width: 100vw;
    height: 70vh;
    object-fit: cover;
    object-position: center;
    left: 0;
    right: 0;
  }
  
  .circular-gallery-section {
    padding: 40px 16px 60px;
    overflow-x: hidden;
  }
  
  .featured-section {
    padding: 2rem 16px;
  }
  
  /* Container adjustments */
  .container {
    padding-left: 0;
    padding-right: 0;
  }
  
  /* Footer block mobile positioning */
  .footer-block-initial {
    margin: 2rem 16px;
    position: static;
  }
  
  /* Touch-friendly circular gallery */
  .circular-gallery-section {
    touch-action: pan-x;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Prevent horizontal overflow */
  .index {
    overflow-x: hidden;
  }
  
  * {
    max-width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 480px) {
  .hero-logo-proxy {
    left: 12px;
    top: 15px; /* Same as header logo position */
    font-size: 24vw; /* Even larger on smallest screens */
    line-height: 0.8;
  }
  
  .index .hero {
    margin-top: 38vh; /* Adjusted space for larger text */
    height: 65vh;
  }
  
  .circular-gallery-section {
    padding: 30px 12px 40px;
  }
  
  .featured-section {
    padding: 1.5rem 12px;
  }
  
  .footer-block-initial {
    margin: 1.5rem 12px;
  }
}

/* Responsive container max-width adjustments */
@media (max-width: 1440px) {
  .container {
    max-width: 100%;
  }
}

/* Improve performance on mobile */
@media (max-width: 768px) {
  .hero-logo-proxy,
  .index .hero,
  .footer-block-initial {
    will-change: auto;
    transform: translateZ(0);
  }
}
</style>
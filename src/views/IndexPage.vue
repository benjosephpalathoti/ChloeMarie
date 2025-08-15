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
          :size="1080"
          :card-w="260"
          :card-h="340"
          :gap="34"
          :bend="120"
          :tilt="10"
        />
      </section>

      <!-- If you don’t have this component, leave it commented -->
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
    };
  },
  mounted() {
    this.initLogoDock();
    window.addEventListener("resize", this.refreshLogoDock, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.refreshLogoDock);
    ScrollTrigger.getAll().forEach(t => t.kill());
  },
  methods: {
    // Animate the fixed .header-logo from the proxy's start rect -> its final rect
    initLogoDock() {
      const headerLogo = document.querySelector(".header-logo");
      const proxy = document.querySelector(".hero-logo-proxy");
      if (!headerLogo || !proxy) return;

      const setup = () => {
        const hBox = headerLogo.getBoundingClientRect();
        const pBox = proxy.getBoundingClientRect();

        const hSize = parseFloat(getComputedStyle(headerLogo).fontSize);
        const pSize = parseFloat(getComputedStyle(proxy).fontSize);
        const scaleStart = pSize / hSize;

        const dx = pBox.left - hBox.left;
        const dy = pBox.top  - hBox.top;

        // Start the header logo visually over the proxy
        gsap.set(headerLogo, { x: dx, y: dy, scale: scaleStart, transformOrigin: "0 0" });

        // Kill previous timeline if any
        if (this._logoTL) this._logoTL.kill();

        // Scrub to neutral (x:0,y:0, scale:1)
        this._logoTL = gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: () => "+=" + Math.round(window.innerHeight * 3.5), // longer = slower shrink
            scrub: 1.1,
            invalidateOnRefresh: true
          }
        })
        .to(headerLogo, { x: 0, y: 0, scale: 1, ease: "none" }, 0);
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
.footer-block-initial{ z-index: 100; position: relative; }
</style>

<template>
  <div id="app">
    <!-- Global header (fixed, above hero) -->
    <header class="global-header">
      <!-- Final, clickable header logo (we animate this one) -->
      <a class="header-logo" href="/" aria-label="Home">CHLOE<br/>MARIE</a>

      <div class="header-infos">
        <span class="photographer-caption" data-reveal="wipe">
          <br/> 
        </span>
        <span class="last-update-caption" data-reveal="wipe">
          MULTIDISCIPLINARY ARTIST<br/> BASED IN LITTLE ROCK,AR
        </span>
      </div>

      <!-- Desktop Menu -->
      <ul class="menu desktop-menu">
        <li data-reveal="wipe"><a href="/" class="active">INDEX</a></li>
        <li data-reveal="wipe"><a href="/work">WORK</a></li>
        <li data-reveal="wipe"><a href="/gallery">GALLERY</a></li>
        <li data-reveal="wipe"><a href="/about">ABOUT</a></li>
      </ul>

      <!-- Mobile Menu Button -->
      <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="Toggle menu">
        <span class="menu-text">MENU</span>
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M7 13l3 3 7-7" v-if="!mobileMenuOpen"></path>
          <path d="M18 6L6 18M6 6l12 12" v-if="mobileMenuOpen"></path>
        </svg>
      </button>
    </header>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" :class="{ 'mobile-menu-open': mobileMenuOpen }" @click="closeMobileMenu">
      <div class="mobile-menu-content">
        <!-- Close button -->
        <button class="mobile-menu-close" @click="closeMobileMenu" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>

        <!-- Mobile Navigation -->
        <nav class="mobile-nav">
          <ul class="mobile-menu-list">
            <li><a href="/" @click="closeMobileMenu">HOME</a></li>
            <li><a href="/work" @click="closeMobileMenu">WORK</a></li>
            <li><a href="/gallery" @click="closeMobileMenu">GALLERY</a></li>
            <li><a href="/about" @click="closeMobileMenu">ABOUT</a></li>
          </ul>

          <!-- Social Links -->
          <div class="mobile-social-links">
            <a href="#" class="social-link">
              INSTAGRAM
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 17l9.2-9.2M17 17V7H7"></path>
              </svg>
            </a>
            <a href="#" class="social-link">
              EMAIL
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 17l9.2-9.2M17 17V7H7"></path>
              </svg>
            </a>
          </div>

          <!-- Copyright -->
          <div class="mobile-copyright">
            ©CHLOE MARIE
          </div>
        </nav>
      </div>
    </div>

    <router-view/>
  </div>
</template>

<script>
export default { 
  name: "App",
  data() {
    return {
      mobileMenuOpen: false
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      // Prevent body scroll when menu is open
      if (this.mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false;
      document.body.style.overflow = '';
    }
  },
  mounted() {
    // Close mobile menu on window resize to desktop size
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.mobileMenuOpen) {
        this.closeMobileMenu();
      }
    });
  }
};
</script>

<style>
/* Header sits above hero/content */
.global-header{
  position: fixed !important;
  top: 0; left: 0; width: 100vw; height: 80px;
  background: transparent;
  z-index: 1000;
  pointer-events: none; /* let inner items decide */
}

/* Header logo (final spot/size) */
.header-logo{
  position: fixed;
  left: 12px;         /* tweak to your grid */
  top: 26px;         /* tweak to your grid */
  z-index: 1001;
  font-family: 'Oswald', Arial, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  line-height: .86;
  letter-spacing: -0.02em;
  font-size: 40px;   /* final size */
  color: #000;
  text-decoration: none;
  will-change: transform;
  opacity: 1;
  pointer-events: auto;
}

/* Header infos grid (unchanged from your version, trimmed) */
.header-infos{
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  width: 1476px;
  height: 30px;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: 30px;
  z-index: 1001;
  pointer-events: none;
}
.photographer-caption,
.last-update-caption{
  font-family: var(--primary-font, 'Oswald', Arial, sans-serif);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 17.5px;
  color: #000;
  opacity: .92;
  pointer-events: auto;
}
.photographer-caption{ grid-column: 3 / 6; text-align: center; }
.last-update-caption{ grid-column: 6 / 8; text-align: left; }

/* Desktop Menu (top-right) */
.desktop-menu{
  position: fixed;
  right: 30px; top: 30px;
  display: flex; gap: .3rem;
  list-style: none; padding: 0; margin: 0;
  font-size: 19px; text-transform: uppercase; letter-spacing: .01em;
  z-index: 1001; pointer-events: auto;
}
.desktop-menu li{ display: inline; }
.desktop-menu a{ color: #bbb; text-decoration: none; transition: color .25s; font-weight: 500; }
.desktop-menu a.active{ color: #000; text-decoration: underline; }
.desktop-menu li:not(:last-child)::after{ content: ","; color: #000; margin-left: .2em; }

/* Mobile Menu Button */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  right: 16px;
  top: 20px;
  z-index: 1002;
  background: none;
  border: none;
  cursor: pointer;
  align-items: center;
  gap: 8px;
  font-family: 'Oswald', Arial, sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #000;
  pointer-events: auto;
}

.menu-text {
  font-size: 16px;
}

.menu-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 1100;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-menu-overlay.mobile-menu-open {
  opacity: 1;
  visibility: visible;
}

.mobile-menu-content {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 100px 30px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mobile-menu-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  z-index: 1101;
}

.mobile-menu-close svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  max-height: 600px;
}

.mobile-menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mobile-menu-list li a {
  font-family: 'Oswald', Arial, sans-serif;
  font-size: 48px;
  font-weight: 400;
  text-transform: uppercase;
  color: #fff;
  text-decoration: none;
  line-height: 1;
  letter-spacing: -0.02em;
  transition: opacity 0.3s ease;
}

.mobile-menu-list li:first-child a {
  color: #fff;
}

.mobile-menu-list li:nth-child(2) a {
  color: #999;
}

.mobile-menu-list li:nth-child(3) a {
  color: #777;
}

.mobile-menu-list li:nth-child(4) a {
  color: #666;
}

.mobile-menu-list li a:hover {
  opacity: 0.7;
}

.mobile-social-links {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border: 1px solid #333;
  border-radius: 50px;
  color: #fff;
  text-decoration: none;
  font-family: 'Oswald', Arial, sans-serif;
  font-size: 16px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  padding-left: 30px;
  padding-right: 30px;
  transition: border-color 0.3s ease;
}

.social-link:hover {
  border-color: #666;
}

.social-link svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

.mobile-copyright {
  font-family: 'Oswald', Arial, sans-serif;
  font-size: 14px;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  text-align: center;
}

/* Add this to your App.vue styles for crisp logo rendering */
.header-logo {
  /* ... your existing styles ... */
  
  /* ADD THESE LINES for crisp rendering: */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transform: translateZ(0); /* Force hardware acceleration */
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Responsive Media Queries */
@media (max-width: 1200px){
  .header-infos{ width: 100vw; left: 0; transform: none; padding: 0 16px; }
}

@media (max-width: 768px) {
  /* Hide desktop menu, show mobile button */
  .desktop-menu { display: none; }
  .mobile-menu-toggle { display: flex; }
  
  /* Adjust header logo for mobile */
  .header-logo {
    font-size: 28px;
    left: 16px;
    top: 20px;
    line-height: 0.9;
  }
  
  /* Hide header infos on mobile */
  .header-infos {
    display: none;
  }
  
  /* Mobile menu adjustments */
  .mobile-menu-list li a {
    font-size: 36px;
  }
  
  .mobile-menu-content {
    padding: 80px 20px 40px;
  }
}

@media (max-width: 480px) {
  .header-logo {
    font-size: 24px;
    left: 12px;
    top: 18px;
  }
  
  .mobile-menu-toggle {
    right: 12px;
    top: 18px;
  }
  
  .mobile-menu-list li a {
    font-size: 32px;
  }
  
  .social-link {
    padding: 12px 20px;
    font-size: 14px;
  }
}

@media (max-width: 700px){
  .desktop-menu{ top: 18px; right: 10px; font-size: 15px; }
  .header-infos{ top: 16px; }
}
</style>
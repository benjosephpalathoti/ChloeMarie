<template>
  <main class="about-page">
    <!-- HERO / INFO -->
    <section class="about-hero" ref="hero">
      <img class="bg" :src="bgSrc" alt="About background" />

      <!-- overlays -->
      <div class="blackout" ref="blackout" aria-hidden="true"></div>
      <div class="tint" aria-hidden="true"></div>
      <div class="fade-bottom" ref="fadeBottom" aria-hidden="true"></div>

      <!-- content -->
      <div class="hero-content container" ref="heroContent" data-reveal="wipe">
        <div class="grid">
          <div class="text-col">
            <div class="lede-row">
              <span class="pill">INFO</span>
              <p class="lede">
                I am a multidisciplinary artist working across design, drawing, painting, and ceramics. My work is inspired by textures, forms, and the quiet details that bring each piece to life. Whether through the precision of pen and ink, the richness of paint, or the tactile nature of clay, I create pieces that reflect my love for exploring different mediums.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT BAND (below info) -->
    <section class="contact-band" id="contact">
      <div class="container">
        <div class="hairline" aria-hidden="true"></div>

        <div class="contact-grid">
          <!-- Left portrait (replace src) -->
          <figure class="portrait" data-reveal="wipe">
            <img src="/assets/about/portrait.jpeg" alt="Portrait" loading="lazy" decoding="async" />
          </figure>

          <!-- Right big buttons -->
          <div class="buttons">
            <a :href="email" class="cta-pill" data-reveal="wipe">
              <span class="label">EMAIL</span>
              <svg class="arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8"
                      fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <div class="band-footer">
          <span class="by">@Chloe Marie</span>
          <span class="last">LAST UPDATE · August 2025</span>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/* assets/links */
const bgSrc     = "/assets/about/hero.jpg";   // update path as needed

const email     = "mailto:bentenneson8@gmail.com";

/* refs */
const hero = ref(null);
const heroContent = ref(null);
const blackout = ref(null);
const fadeBottom = ref(null);

/* Tuning: faster/slower fade */
const END_EARLY = 5;      // finish this many px BEFORE the INFO bottom reaches top (bigger = faster)
const START_OFFSET = 750; // delay fade start by this many px after top (also compresses/faster)

/* Cursor parallax + 3D tilt tuning */
const MOUSE_AMT_X = 24;   // px translate horizontally
const MOUSE_AMT_Y = 12;   // px translate vertically
const TILT_MAX_Y  = 10;   // deg (left/right tilt)
const TILT_MAX_X  = 6;    // deg (forward/back tilt)

/* tweens / setters */
let bgParallaxTween, bgOpacityTween, blackoutTween, edgeTween, edgeOpacityTween;
let setX, setY, setRX, setRY, onPointerMove, onPointerLeave;

onMounted(() => {
  document.body.classList.add("header-on-photo");

  // Check if mobile to conditionally apply complex animations
  const isMobile = window.innerWidth <= 768;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  // All animations are tied to the INFO block
  const infoEndEl = heroContent.value || hero.value;
  const common = {
    trigger: hero.value,
    start: () => `top+=${isMobile ? START_OFFSET * 0.5 : START_OFFSET} top`, // Faster start on mobile
    endTrigger: infoEndEl,
    end: () => `bottom-=${END_EARLY} top`,
    scrub: true
    // , markers: true
  };

  const imgEl = hero.value?.querySelector(".bg");

  // 1) Scroll parallax/fades (simplified on mobile)
  if (imgEl) {
    bgParallaxTween = gsap.to(imgEl, {
      yPercent: isMobile ? -5 : -10, // Less parallax on mobile for performance
      scale: isMobile ? 1.02 : 1.04,  // Less scale on mobile
      ease: "none",
      scrollTrigger: { ...common }
    });

    bgOpacityTween = gsap.to(imgEl, {
      autoAlpha: 0,
      ease: "power2.out",
      scrollTrigger: { ...common }
    });
  }

  if (blackout.value) {
    blackoutTween = gsap.to(blackout.value, {
      opacity: 1,
      ease: "power2.out",
      scrollTrigger: { ...common }
    });
  }

  if (fadeBottom.value) {
    edgeTween = gsap.to(hero.value, {
      "--fadeH": isMobile ? "40svh" : "60svh", // Shorter fade on mobile
      ease: "none",
      scrollTrigger: { ...common }
    });

    edgeOpacityTween = gsap.fromTo(
      fadeBottom.value,
      { opacity: 0 },
      { opacity: 1, ease: "none", scrollTrigger: { ...common } }
    );
  }

  // 2) Cursor parallax + 3D tilt (desktop only, respect reduced motion)
  if (imgEl && !isCoarse && !prefersReduced.matches && !isMobile) {
    gsap.set(imgEl, { transformPerspective: 900, transformOrigin: '50% 50%' });

    setX  = gsap.quickTo(imgEl, 'x',         { duration: 0.6, ease: 'power3.out' });
    setY  = gsap.quickTo(imgEl, 'y',         { duration: 0.6, ease: 'power3.out' });
    setRX = gsap.quickTo(imgEl, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    setRY = gsap.quickTo(imgEl, 'rotationY', { duration: 0.8, ease: 'power3.out' });

    onPointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth)  - 0.5; // -0.5..0.5
      const ny = (e.clientY / window.innerHeight) - 0.5; // -0.5..0.5
      setX(nx * MOUSE_AMT_X);
      setY(ny * MOUSE_AMT_Y);
      setRY(-nx * TILT_MAX_Y);   // move right => tilt left
      setRX(-ny * TILT_MAX_X);   // move down  => tilt back slightly
    };

    onPointerLeave = () => { setX(0); setY(0); setRX(0); setRY(0); };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
  }
});

onBeforeUnmount(() => {
  document.body.classList.remove("header-on-photo");

  edgeOpacityTween?.scrollTrigger?.kill(); edgeOpacityTween?.kill();
  edgeTween?.scrollTrigger?.kill();        edgeTween?.kill();
  blackoutTween?.scrollTrigger?.kill();    blackoutTween?.kill();
  bgOpacityTween?.scrollTrigger?.kill();   bgOpacityTween?.kill();
  bgParallaxTween?.scrollTrigger?.kill();  bgParallaxTween?.kill();

  if (onPointerMove)  window.removeEventListener('pointermove', onPointerMove);
  if (onPointerLeave) window.removeEventListener('pointerleave', onPointerLeave);
  onPointerMove = onPointerLeave = null;
});
</script>

<style scoped>
.about-page{ background:#000; color:#fff; }

/* hero wrapper holds a CSS var for bottom-fade height */
.about-hero{
  position: relative;
  min-height: 100svh;
  --fadeH: 0svh;   /* grows on scroll */
}

/* background image */
.bg{
  position: fixed;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 1;                       /* start visible */
  transform: translateZ(0) scale(1.02);
  z-index: 0; will-change: transform, opacity;
}

/* extra overscan for mouse move (your override kept) */
.bg{
  transform: translateZ(0) scale(1.06); /* was 1.02 — extra room for mouse move */
  backface-visibility: hidden;
  will-change: transform, opacity;
}

/* overlays cover the whole viewport to avoid gaps when sections add margins */
.tint,
.blackout { position: fixed; inset: 0; pointer-events: none; }
.fade-bottom { position: fixed; left: 0; right: 0; bottom: 0; height: var(--fadeH); pointer-events: none; }

/* layering order */
.tint        { z-index: 1; background: rgba(210,0,0,0.55); mix-blend-mode: multiply; }
.fade-bottom {
  z-index: 2;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0%,
    rgba(0,0,0,.35) 45%,
    rgba(0,0,0,.75) 75%,
    rgba(0,0,0,1) 100%
  );
  opacity: 0;
}
.blackout    { z-index: 3; background:#000; opacity: 0; }

/* remove container right padding inside hero only */
.hero-content.container{ padding-right: 0; }

/* place content near the bottom-right */
.hero-content{
  position: relative; z-index: 4;    /* above overlays */
  min-height: 100svh;
  display: flex; align-items: flex-end;
  padding-top: clamp(36px, 80vh, 720px);
  padding-bottom: 10vh;
}

.grid{
  width: 100%;
  display: grid;
  grid-template-columns: repeat(12, minmax(0,1fr));
  column-gap: 12px;
}

/* text area */
.text-col{ grid-column: 7 / 13; max-width: none; }
.lede-row{ display:flex; align-items: baseline; gap:14px; }

/* main display text */
.lede{
  margin: 0;
  color: #fff;
  font-family: var(--primary-font, "Neue Montreal", system-ui, sans-serif);
  font-weight: 100;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  line-height: 1.30;
  max-width: 50ch;
  text-align: left;
  font-size: clamp(48px, 7.6vw, 45px);
  text-wrap: normal;
}

/* INFO pill */
.pill{
  flex: 0 0 auto;
  display: inline-block;
  border: 2px solid rgba(255,255,255,.95);
  border-radius: 999px;
  padding: 10px 18px 12px;
  margin-bottom: 6px;
  color: #fff;
  font-weight: 400;
  letter-spacing: .08em;
  font-size: 18px;
  line-height: 1;
}

/* click-through safety (only disable inside hero) */
.hero-content.container{ pointer-events:none; }
.pill { pointer-events:auto; }

/* =============== CONTACT BAND =============== */
.contact-band{
  position: relative;
  background:#000; color:#fff;
  padding: 10px 0 30px;
  margin-top: 180px;
  z-index: 5; /* sits above the hero overlays */
}
.contact-band .container{ pointer-events:auto; }
.contact-band .hairline{
  width: clamp(260px, 22vw, 480px);
  height: 1px;
  background: rgba(255,255,255,.12);
  margin: 10px 0 24px  auto;         /* push it to the right */
}

.contact-grid{
  display:grid;
  grid-template-columns: repeat(12, minmax(0,1fr));
  column-gap: 16px;
  align-items: center;
}

/* Left portrait */
.portrait{ grid-column: 1 / 4; margin:0; }
.portrait img{
  display:block;
  width:100%; height:auto;
  max-width: 250px;
  margin-top: 150px;
  filter: grayscale(100%); /* optional */
}

/* Right big buttons */
.buttons{ grid-column: 9 / 13; display:flex; flex-direction:column; gap: 54px; }
.cta-pill{
  --h: 150px; --rad: 9999px;
  display:flex; align-items:center; justify-content:space-between;
  gap: 24px; padding: 0 42px; height: var(--h);
  border-radius: var(--rad); border: 2px solid #fff;
  color:#fff; text-decoration:none;
  transition: transform .15s ease, background .15s ease, color .15s ease, border-color .15s ease;
  will-change: transform;
}
.cta-pill .label{
  font-family: var(--primary-font, "Neue Montreal", system-ui, sans-serif);
  font-weight: 800; letter-spacing: .02em; line-height: 1;
  font-size: clamp(28px, 5.5vw, 72px);
}
.cta-pill .arrow{ width: clamp(28px, 3.2vw, 48px); height: auto; flex: 0 0 auto; }
.cta-pill:hover{ background:#fff; color:#000; transform: translateY(-1px); }

/* bottom meta line */
.band-footer{
  margin-top: 90px;
  display:flex; justify-content:space-between; align-items:center;
  font-size: 12px; letter-spacing: .06em; opacity:.85;
}

/* ─── Enhanced Mobile Responsive Styles ─────────────────────── */

/* responsive */
@media (max-width: 1200px){
  .text-col{ grid-column: 4 / 13; }
  .portrait{ grid-column: 2 / 6; }
  .buttons{  grid-column: 6 / 13; }
}

@media (max-width: 1024px){
  .text-col{ grid-column: 2 / -2; }
}

@media (max-width: 900px){
  .contact-grid{
    grid-template-columns: repeat(6, minmax(0,1fr));
    row-gap: 28px; align-items: start;
  }
  .portrait{ grid-column: 1 / -1; }
  .portrait img{ max-width: 260px; }
  .buttons{ grid-column: 1 / -1; }
  .cta-pill{ --h: 102px; padding: 0 28px; }
  .band-footer{ flex-direction:column; gap:8px; align-items:flex-start; }
}

/* ─── Mobile Optimizations (768px and below) ─────────────────── */
@media (max-width: 768px) {
  .about-hero {
    min-height: 100vh; /* Use vh instead of svh for better mobile support */
  }
  
  .hero-content {
    min-height: 100vh;
    padding-top: clamp(120px, 60vh, 400px); /* Reduced top padding for mobile */
    padding-bottom: 15vh; /* More bottom padding for mobile reading */
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .grid {
    column-gap: 0; /* Remove grid gaps on mobile */
  }
  
  .text-col { 
    grid-column: 1 / -1; /* Full width on mobile */
  }
  
  .lede-row {
    flex-direction: column; /* Stack pill and text vertically */
    align-items: flex-start;
    gap: 16px;
  }
  
  .lede {
    max-width: none; /* Remove width constraint on mobile */
    font-size: clamp(24px, 7vw, 36px); /* Smaller but readable font size */
    line-height: 1.4; /* Better mobile line height */
    text-transform: none; /* Remove uppercase for better mobile readability */
  }
  
  .pill {
    font-size: 14px;
    padding: 8px 16px 10px;
    align-self: flex-start;
  }
  
  /* Contact band mobile optimizations */
  .contact-band {
    margin-top: 60px; /* Reduced margin on mobile */
    padding: 20px 0 40px;
  }
  
  .contact-band .container {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .contact-band .hairline {
    margin-left: 0; /* Left align hairline on mobile */
    width: 100%;
    max-width: 200px;
  }
  
  .contact-grid {
    grid-template-columns: 1fr; /* Single column on mobile */
    row-gap: 40px;
    align-items: stretch;
  }
  
  .portrait {
    grid-column: 1;
    text-align: center;
  }
  
  .portrait img {
    max-width: 200px;
    margin-top: 0;
    margin-left: auto;
    margin-right: auto;
  }
  
  .buttons {
    grid-column: 1;
    gap: 24px;
  }
  
  .cta-pill {
    --h: 80px;
    padding: 0 24px;
    border-radius: 40px;
  }
  
  .cta-pill .label {
    font-size: clamp(20px, 6vw, 28px);
  }
  
  .cta-pill .arrow {
    width: clamp(20px, 4vw, 24px);
  }
  
  .band-footer {
    margin-top: 60px;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    text-align: center;
  }
}

/* ─── Small Mobile (480px and below) ─────────────────────────── */
@media (max-width: 480px) {
  .hero-content {
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 20vh;
  }
  
  .lede {
    font-size: clamp(20px, 6vw, 28px);
    line-height: 1.5;
  }
  
  .pill {
    font-size: 12px;
    padding: 6px 14px 8px;
  }
  
  .contact-band .container {
    padding-left: 12px;
    padding-right: 12px;
  }
  
  .contact-grid {
    row-gap: 30px;
  }
  
  .portrait img {
    max-width: 160px;
  }
  
  .cta-pill {
    --h: 70px;
    padding: 0 20px;
    border-radius: 35px;
  }
  
  .cta-pill .label {
    font-size: clamp(18px, 5.5vw, 24px);
  }
  
  .band-footer {
    margin-top: 40px;
    font-size: 11px;
  }
}

/* ─── Mobile Performance Optimizations ──────────────────────── */
@media (max-width: 768px) {
  /* Reduce background image scale for mobile performance */
  .bg {
    transform: translateZ(0) scale(1.02); /* Less overscan on mobile */
  }
  
  /* Simplify will-change properties on mobile */
  .bg {
    will-change: transform, opacity;
  }
  
  /* Touch-friendly interactions */
  .cta-pill {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  .cta-pill:active {
    transform: translateY(0) scale(0.98);
  }
}

/* ─── Text Selection Improvements ───────────────────────────── */
@media (max-width: 768px) {
  .lede {
    -webkit-user-select: text;
    user-select: text;
  }
  
  /* Prevent zoom on input focus (if any inputs are added later) */
  input, textarea, select {
    font-size: 16px !important;
  }
}

@media (max-width: 680px){
  .text-col{ grid-column: 1 / -1; }
  .lede{ max-width: 28ch; font-size: clamp(30px, 8vw, 44px); }
  .pill{ font-size: 16px; }
}
</style>
<template>
  <main class="gallery-root">
    <!-- Desktop 3D Gallery -->
    <div class="desktop-gallery desktop-only">
      <!-- fixed background grid -->
      <div class="bg-layers" aria-hidden="true">
        <div class="corner corner--tl"></div>
        <div class="corner corner--br"></div>
      </div>

      <!-- 1440px centered viewport -->
      <div class="frame" ref="frameEl">
        <!-- drag anywhere here -->
        <div
          class="world"
          ref="worldEl"
          :style="worldStyle"
          @pointerdown="onPointerDown"
          @wheel.prevent="onWheelPan"
        >
          <!-- only this translates -->
          <section class="gallery-stage" :style="stageStyle">
            <article
              v-for="(img, i) in laidOut"
              :key="i"
              class="card"
              :style="cardStyleWithCurve(img)"
              @dblclick.stop="centerOn(img)"
            >
              <img :src="img.src" :alt="img.alt || ''" draggable="false" />
              <footer class="meta">
                <span class="year">{{ img.year || '2020' }}</span>
                <span class="dot">•</span>
                <span class="label">NAME</span>&nbsp;<span class="val">{{ img.name || 'UNTITLED' }}</span>
                <span class="dot">•</span>
                <span class="label">TYPE</span>&nbsp;<span class="val">{{ img.type || 'CAMPAIGN' }}</span>
              </footer>
            </article>
          </section>
        </div>

        <!-- Centered ruler -->
        <GalleryAxis
          :offset-x="offset.x"
          :base-value="500"
          :gap="10"
          :major-every="5"
          :units-per-pixel="0.12"
        />
      </div>
    </div>

    <!-- Mobile Gallery -->
    <div class="mobile-gallery mobile-only">
      <!-- Mobile Header -->
      <div class="mobile-gallery-header">
        <h1 class="mobile-gallery-title">GALLERY</h1>
        <div class="mobile-gallery-info">
          <span class="gallery-count">{{ items.length }} WORKS</span>
        </div>
      </div>

      <!-- Mobile Grid -->
      <div class="mobile-gallery-grid" ref="mobileGridEl">
        <div 
          v-for="(img, i) in items" 
          :key="i"
          class="mobile-gallery-item"
          @click="openLightbox(img, i)"
        >
          <div class="mobile-card">
            <img :src="img.src" :alt="img.alt || ''" loading="lazy" />
            <div class="mobile-meta">
              <span class="mobile-year">{{ img.year || '2020' }}</span>
              <span class="mobile-name">{{ img.name || 'UNTITLED' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Lightbox -->
    <div 
      v-if="lightboxOpen" 
      class="mobile-lightbox mobile-only"
      @click="closeLightbox"
    >
      <div class="lightbox-content" @click.stop>
        <button class="lightbox-close" @click="closeLightbox">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        </button>
        
        <div class="lightbox-image-container">
          <img 
            :src="currentLightboxImage?.src" 
            :alt="currentLightboxImage?.alt || ''" 
          />
        </div>
        
        <div class="lightbox-meta">
          <div class="lightbox-info">
            <span class="lightbox-year">{{ currentLightboxImage?.year || '2020' }}</span>
            <span class="lightbox-name">{{ currentLightboxImage?.name || 'UNTITLED' }}</span>
            <span class="lightbox-type">{{ currentLightboxImage?.type || 'CAMPAIGN' }}</span>
          </div>
          <div class="lightbox-navigation">
            <button @click="previousImage" :disabled="currentImageIndex === 0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 18l-6-6 6-6"></path>
              </svg>
            </button>
            <span class="image-counter">{{ currentImageIndex + 1 }} / {{ items.length }}</span>
            <button @click="nextImage" :disabled="currentImageIndex === items.length - 1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 18l6-6-6-6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { nextTick, watch } from "vue";
import GalleryAxis from "../components/GalleryAxis.vue";

export default {
  name: "GalleryPage",
  components: { GalleryAxis },
  data() {
    return {
      /* card size — tuned to see ~4–5 at once on 1440px */
      BOX: { w: 300, h: 400 },

      /* EVEN SPACING + ALT ROWS IN EVERY COLUMN */
      layout: {
        cols: 10,
        gapX: 90,
        gapY: 90,
        startX: 120,
        startY: 120,
        altStart: true, // col 2 starts on next row
      },

      items: [],

      /* viewport + stage */
      vpSize: { w: 1440, h: 900 },
      MIN_OVERFLOW_X: 1200,
      MIN_OVERFLOW_Y: 700,
      stage: { width: 1440, height: 900 },
      bounds: null,

      /* pan / inertia */
      offset: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },

      /* world tilt (globe) */
      tilt: { x: 0, y: 0, z: 0 },
      tiltTarget: { x: 0, y: 0, z: 0 },
      tiltMax: 16,
      tiltDamp: .08,   // faster settle

      /* constant globe curvature (always on, not only while dragging) */
      globe: {
        rotX: 3,   // deg at top/bottom edges
        rotY: 3,   // deg at left/right edges
        zAmp: 120,   // px push-back near edges
      },

      /* cloth-like bend while dragging */
      dragAmt: 0.5,                 // 0..1 elastic strength
      dragDelta: { x: 0, y: 0 },

      // extra "edge bend" power (stronger near borders while dragging)
      edgeBendAmp: 180,           // Z curve at borders
      edgeRotAmpX: 18,            // extra rotateX near borders
      edgeRotAmpY: 22,            // extra rotateY near borders

      /* drag state */
      dragging: false,
      last: { x: 0, y: 0 },
      activePointerId: null,

      raf: null,
      
      /* mobile state */
      isMobile: false,
      lightboxOpen: false,
      currentLightboxImage: null,
      currentImageIndex: 0,
    };
  },
  computed: {
    /* === Even spacing with alternating rows in each column === */
    laidOut() {
      // Skip complex layout calculations on mobile
      if (this.isMobile) return [];
      
      const src = this.items || [];
      if (!src.length) return [];

      const { w, h } = this.BOX;
      const { cols, gapX, gapY, startX, startY, altStart } = this.layout;

      const colX = Array.from({ length: cols }, (_, c) => startX + c * (w + gapX));
      const perCol = Math.ceil(src.length / cols);

      const out = [];
      let idx = 0;

      for (let c = 0; c < cols && idx < src.length; c++) {
        const startRow = (altStart && (c % 2 === 1)) ? 1 : 0; // col 2 begins on row 2
        for (let k = 0; k < perCol && idx < src.length; k++, idx++) {
          const r = startRow + k * 2; // alternate rows inside each column
          out.push({
            ...src[idx],
            x: colX[c],
            y: startY + r * (h + gapY),
            width: w,
            height: h,
          });
        }
      }

      const maxX = Math.max(...out.map(o => o.x + o.width), 0);
      const maxY = Math.max(...out.map(o => o.y + o.height), 0);

      const minW = this.vpSize.w + this.MIN_OVERFLOW_X;
      const minH = this.vpSize.h + this.MIN_OVERFLOW_Y;

      this.stage.width  = Math.max(maxX + startX, minW);
      this.stage.height = Math.max(maxY + startY, minH);

      return out;
    },

    stageStyle() {
      if (this.isMobile) return {};
      return {
        width: this.stage.width + "px",
        height: this.stage.height + "px",
        transform: `translate3d(${this.offset.x}px, ${this.offset.y}px, 0)`,
        transformOrigin: "0 0",
        willChange: "transform",
      };
    },
    worldStyle() {
      if (this.isMobile) return {};
      return {
        transform: `perspective(1400px) rotateX(${this.tilt.x}deg) rotateY(${this.tilt.y}deg) rotateZ(${this.tilt.z}deg)`,
        transformStyle: "preserve-3d",
      };
    },
  },
  mounted() {
    this.checkMobile();
    document.documentElement.classList.add("is-gallery");
    this._initItems();

    if (!this.isMobile) {
      nextTick(() => this._measureFrame(true));
      this.startDesktopAnimation();
    }

    window.addEventListener("resize", this._onResize, { passive: true });
    watch(() => this.laidOut, () => nextTick(() => this._measureFrame(false)), { deep: true });
  },
  beforeUnmount() {
    document.documentElement.classList.remove("is-gallery");
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this._onResize);
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    
    startDesktopAnimation() {
      if (this.isMobile) return;
      
      // buttery + faster settle loop
      const loop = () => {
        const lerp = 0.05; // smooth position
        this.offset.x += (this.target.x - this.offset.x) * lerp;
        this.offset.y += (this.target.y - this.offset.y) * lerp;

        const tLerp = 0.10; // faster tilt interpolation
        this.tilt.x += (this.tiltTarget.x - this.tilt.x) * tLerp;
        this.tilt.y += (this.tiltTarget.y - this.tilt.y) * tLerp;
        this.tilt.z += (this.tiltTarget.z - this.tilt.z) * tLerp;

        if (!this.dragging) {
          // snap cloth & drag motion back quicker
          this.dragAmt += (0 - this.dragAmt) * 0.35;
          this.dragDelta.x *= 0.80;
          this.dragDelta.y *= 0.80;
          this.tiltTarget.x *= this.tiltDamp;
          this.tiltTarget.y *= this.tiltDamp;
          this.tiltTarget.z *= this.tiltDamp;
        }

        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    },
    
    /* Mobile lightbox methods */
    openLightbox(image, index) {
      this.currentLightboxImage = image;
      this.currentImageIndex = index;
      this.lightboxOpen = true;
      document.body.style.overflow = 'hidden';
    },
    
    closeLightbox() {
      this.lightboxOpen = false;
      this.currentLightboxImage = null;
      document.body.style.overflow = '';
    },
    
    nextImage() {
      if (this.currentImageIndex < this.items.length - 1) {
        this.currentImageIndex++;
        this.currentLightboxImage = this.items[this.currentImageIndex];
      }
    },
    
    previousImage() {
      if (this.currentImageIndex > 0) {
        this.currentImageIndex--;
        this.currentLightboxImage = this.items[this.currentImageIndex];
      }
    },

    _initItems() {
      this.items = [
        { src: "/assets/gallery/01.png", year:"2020", name:"PORTRAIT",  type:"EDITORIAL" },
        { src: "/assets/gallery/02.png", year:"2020", name:"E. PRANDI", type:"PORTRAIT" },
        { src: "/assets/gallery/03.jpg" }, { src: "/assets/gallery/04.jpg" },
        { src: "/assets/gallery/05.jpg" }, { src: "/assets/gallery/06.png" },
        { src: "/assets/gallery/07.png" }, { src: "/assets/gallery/08.png" },
        { src: "/assets/gallery/09.jpg" }, { src: "/assets/gallery/10.png" },
        { src: "/assets/gallery/11.png" }, { src: "/assets/gallery/12.png" },
        { src: "/assets/gallery/13.jpg" }, { src: "/assets/gallery/14.png" },
        { src: "/assets/gallery/15.jpg" }, { src: "/assets/gallery/16.png" },
        { src: "/assets/gallery/17.png" }, { src: "/assets/gallery/18.png" },
        { src: "/assets/gallery/19.png" }, { src: "/assets/gallery/20.png" },
        { src: "/assets/gallery/21.png" }, { src: "/assets/gallery/22.jpeg" },
      ];
    },

    /* Desktop interaction methods */
    onPointerDown(e) {
      if (this.isMobile) return;
      
      const el = this.$refs.worldEl;
      this.dragging = true;
      this.dragAmt = 1;
      this.activePointerId = e.pointerId;
      el.setPointerCapture(e.pointerId);

      const fr = this.$refs.frameEl.getBoundingClientRect();
      this.dragCenter = { x: e.clientX - fr.left, y: e.clientY - fr.top };
      this.last = { x: e.clientX, y: e.clientY };
      this.dragDelta = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";

      el.addEventListener("pointermove", this.onPointerMove, { passive: false });
      el.addEventListener("pointerup", this.onPointerUp, { passive: true });
      el.addEventListener("pointercancel", this.onPointerUp, { passive: true });
    },
    onPointerMove(e) {
      if (!this.dragging || e.pointerId !== this.activePointerId || this.isMobile) return;
      e.preventDefault();
      const dx = e.clientX - this.last.x;
      const dy = e.clientY - this.last.y;

      const fr = this.$refs.frameEl.getBoundingClientRect();
      this.dragCenter = { x: e.clientX - fr.left, y: e.clientY - fr.top };
      this.dragDelta = { x: dx, y: dy };

      this.last = { x: e.clientX, y: e.clientY };

      this._applyPan(dx, dy);

      // stronger world tilt for globe feel while dragging
      const k = 0.42;
      this.tiltTarget.y = this._clamp(-dx * k, -this.tiltMax, this.tiltMax);
      this.tiltTarget.x = this._clamp( dy * k, -this.tiltMax, this.tiltMax);
      this.tiltTarget.z = this._clamp((-dx + dy) * 0.28, -7, 7);

      // inertia blend
      this.velocity.x = this.velocity.x * 0.6 + dx * 0.4;
      this.velocity.y = this.velocity.y * 0.6 + dy * 0.4;
    },
    onPointerUp(e) {
      if (e.pointerId !== this.activePointerId || this.isMobile) return;
      const el = this.$refs.worldEl;
      this.dragging = false;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      el.releasePointerCapture?.(e.pointerId);
      el.removeEventListener("pointermove", this.onPointerMove);
      el.removeEventListener("pointerup", this.onPointerUp);
      el.removeEventListener("pointercancel", this.onPointerUp);

      // start flying back, then settle quickly
      this.tiltTarget.x = 0;
      this.tiltTarget.y = 0;
      this.tiltTarget.z = 0;

      // inertia glide (shorter)
      const friction = 0.93;
      const step = () => {
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        if (Math.abs(this.velocity.x) < 0.05 && Math.abs(this.velocity.y) < 0.05) return;
        this._applyPan(this.velocity.x, this.velocity.y);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },

    onWheelPan(e) {
      if (this.isMobile) return;
      const dx = e.shiftKey ? -e.deltaY * 0.8 : -e.deltaX * 0.8;
      const dy = e.shiftKey ? 0 : -e.deltaY * 0.6;
      this._applyPan(dx, dy);
    },

    _applyPan(dx, dy) {
      let nx = this.target.x + dx;
      let ny = this.target.y + dy;
      if (this.bounds) {
        nx = Math.min(this.bounds.maxX, Math.max(this.bounds.minX, nx));
        ny = Math.min(this.bounds.maxY, Math.max(this.bounds.minY, ny));
      }
      this.target.x = nx;
      this.target.y = ny;
    },

    centerOn(img) {
      if (this.isMobile) return;
      const vp = this.$refs.frameEl.getBoundingClientRect();
      this.target.x = vp.width / 2 - (img.x + img.width / 2);
      this.target.y = vp.height / 2 - (img.y + img.height / 2);
      this._enforceBounds();
    },

    _onResize() { 
      const wasMobile = this.isMobile;
      this.checkMobile();
      
      if (wasMobile !== this.isMobile) {
        // Mobile state changed, restart appropriate mode
        if (this.raf) {
          cancelAnimationFrame(this.raf);
          this.raf = null;
        }
        
        if (!this.isMobile) {
          nextTick(() => {
            this._measureFrame(true);
            this.startDesktopAnimation();
          });
        }
      } else if (!this.isMobile) {
        this._measureFrame(false);
      }
    },

    _measureFrame(center) {
      if (this.isMobile) return;
      
      const vp = this.$refs.frameEl.getBoundingClientRect();
      this.vpSize.w = vp.width;
      this.vpSize.h = vp.height;

      const sw = this.stage.width;
      const sh = this.stage.height;
      const minX = Math.min(0, vp.width  - sw);
      const minY = Math.min(0, vp.height - sh);
      const maxX = 0, maxY = 0;
      this.bounds = { minX, minY, maxX, maxY };

      if (center) {
        const cx = Math.max(minX, Math.min(maxX, (vp.width - sw) / 2));
        const cy = Math.max(minY, Math.min(maxY, (vp.height - sh) / 2));
        this.offset.x = this.target.x = cx;
        this.offset.y = this.target.y = cy;
      } else {
        this._enforceBounds();
      }
    },
    _enforceBounds() {
      if (!this.bounds || this.isMobile) return;
      this.target.x = Math.min(this.bounds.maxX, Math.max(this.bounds.minX, this.target.x));
      this.target.y = Math.min(this.bounds.maxY, Math.max(this.bounds.minY, this.target.y));
    },

    /* per-card style: baseline globe + cloth bend from drag center + edge bending */
    cardStyleWithCurve(img) {
      if (this.isMobile) return {};
      
      const base = {
        left: img.x + "px",
        top: img.y + "px",
        width: img.width + "px",
        height: img.height + "px",
      };

      const fr = this.$refs.frameEl?.getBoundingClientRect() || { width: this.vpSize.w, height: this.vpSize.h };
      const center = this.dragging ? this.dragCenter : { x: fr.width / 2, y: fr.height / 2 };

      const cx = img.x + img.width  / 2 + this.offset.x;
      const cy = img.y + img.height / 2 + this.offset.y;

      // normalized position relative to viewport center (for globe)
      const dxN = (cx - fr.width  / 2) / (fr.width  / 2);
      const dyN = (cy - fr.height / 2) / (fr.height / 2);

      // --- baseline globe curvature (always present) ---
      const baseRotY = -dxN * this.globe.rotY;
      const baseRotX =  dyN * this.globe.rotX;
      const baseZ    = -(dxN*dxN + dyN*dyN) * this.globe.zAmp;

      // --- cloth bend around drag center (stronger while dragging) ---
      const dxC = cx - center.x;
      const dyC = cy - center.y;
      const dist = Math.hypot(dxC, dyC);
      const sigma = Math.max(fr.width, fr.height) * 0.35; // falloff radius
      const clothAmt = Math.exp(-(dist * dist) / (2 * sigma * sigma)) * this.dragAmt;

      const tx = -this.dragDelta.x * 1.0 * clothAmt;
      const ty = -this.dragDelta.y * 1.0 * clothAmt;

      let rotY = baseRotY + (-dxN * 16 * Math.max(0.4, this.dragAmt));
      let rotX = baseRotX + ( dyN * 12 * Math.max(0.4, this.dragAmt));
      let z    = baseZ    + (120 * clothAmt - 40 * (1 - clothAmt));

      // extra edge bending while dragging
      const edge = Math.min(1, Math.hypot(dxN, dyN));
      rotX += dyN  * this.edgeRotAmpX * edge * this.dragAmt;
      rotY += -dxN * this.edgeRotAmpY * edge * this.dragAmt;
      z    -= Math.pow(edge, 1.4) * this.edgeBendAmp * this.dragAmt;

      return {
        ...base,
        transform: `translate(${tx}px, ${ty}px) translateZ(${z}px) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
        transformStyle: "preserve-3d",
      };
    },

    _clamp(v, a, b) { return Math.max(a, Math.min(b, v)); },
  },
};
</script>

<style scoped>
/* ─── Desktop Gallery Styles ─────────────────────────────────── */

/* fixed grid */
.gallery-root{
  position:relative; width:100vw; height:100vh; overflow:hidden;
  background:#0e0e0f; color:#f2f2f2;
}
.gallery-root::before{
  content:""; position:absolute; inset:0; pointer-events:none;
  background:
    repeating-linear-gradient(to right, #1f1f1f 0 1px, transparent 1px 40px),
    repeating-linear-gradient(to bottom, #1f1f1f 0 1px, transparent 1px 40px),
    repeating-linear-gradient(to right, #2b2b2b 0 1px, transparent 1px 200px),
    repeating-linear-gradient(to bottom, #2b2b2b 0 1px, transparent 1px 200px);
}
.bg-layers{ position:absolute; inset:0; z-index:0; pointer-events:none; }
.corner{
  position:absolute; width:38vmin; height:38vmin; border-radius:50%;
  background:
    radial-gradient(closest-side, rgba(255,255,255,0.06), rgba(255,255,255,0.0) 70%),
    conic-gradient(from 0deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 70%);
  mask: radial-gradient(closest-side, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 65%);
  opacity:.18;
}
.corner--tl{ left:-8vmin; bottom:-8vmin; }
.corner--br{ right:-8vmin; top:-8vmin; transform:rotate(180deg); }

/* 1440px centered frame */
.frame{ position:relative; width:min(1440px, 100vw); height:100%; margin:0 auto; }

/* tilt container */
.world{
  position:absolute; inset:0;
  transform-style:preserve-3d;
  will-change:transform;
  cursor:grab; touch-action:none;
}
.world:active{ cursor:grabbing; }

/* panning stage */
.gallery-stage{
  position:absolute; left:0; top:0; z-index:1;
  transform-origin:0 0; will-change:transform;
}

/* cards */
.card{
  position:absolute; background:#0b0b0b; border-radius:2px; overflow:hidden;
  box-shadow: 0 18px 40px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.06) inset;
  transition: transform .18s cubic-bezier(.38,.05,.6,.9), box-shadow .18s;
  transform-style:preserve-3d;
}
.card:hover{ transform:translateY(-8px) scale(1.035); z-index:30; }
.card img{ width:100%; height:100%; object-fit:contain; background:#0b0b0b; display:block; pointer-events:none; }

/* caption */
.meta{
  position:absolute; left:10px; right:10px; bottom:8px;
  color:#dcdcdc; opacity:.75; font-size:10px; letter-spacing:.12em;
  text-transform:uppercase; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  text-shadow: 0 1px 2px rgba(0,0,0,.7);
  display:flex; gap:.5em; align-items:center; white-space:nowrap; overflow:hidden;
}
.meta .label{ opacity:.6; }
.meta .dot{ opacity:.45; }

/* ─── Mobile Gallery Styles ──────────────────────────────────── */

.mobile-gallery {
  display: none;
  background: #0e0e0f;
  color: #f2f2f2;
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 60px;
}

.mobile-gallery-header {
  padding: 0 16px 40px;
  text-align: center;
}

.mobile-gallery-title {
  font-family: 'Oswald', Arial, sans-serif;
  font-weight: 900;
  font-size: 12vw;
  line-height: 0.9;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
  text-transform: uppercase;
  color: #f2f2f2;
}

.mobile-gallery-info {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #999;
}

.mobile-gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px;
}

.mobile-gallery-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.mobile-gallery-item:active {
  transform: scale(0.98);
}

.mobile-card {
  background: #0b0b0b;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,.6);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.mobile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0,0,0,.8);
}

.mobile-card img {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  display: block;
}

.mobile-meta {
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,.1);
}

.mobile-year {
  display: block;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  font-size: 10px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}

.mobile-name {
  display: block;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  font-size: 11px;
  color: #dcdcdc;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
}

/* ─── Mobile Lightbox ────────────────────────────────────────── */

.mobile-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.95);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.lightbox-content {
  position: relative;
  width: 90vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  max-width: 500px;
}

.lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  z-index: 2001;
  padding: 8px;
}

.lightbox-close svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.lightbox-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0b0b0b;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.lightbox-image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.lightbox-meta {
  color: #f2f2f2;
}

.lightbox-info {
  margin-bottom: 20px;
  text-align: center;
}

.lightbox-year {
  display: block;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.lightbox-name {
  display: block;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  font-size: 14px;
  color: #dcdcdc;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
  margin-bottom: 4px;
}

.lightbox-type {
  display: block;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.lightbox-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.lightbox-navigation button {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.lightbox-navigation button:disabled {
  color: #555;
  cursor: not-allowed;
}

.lightbox-navigation button:not(:disabled):hover {
  background-color: rgba(255,255,255,0.1);
}

.lightbox-navigation button svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.image-counter {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.1em;
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
  
  .mobile-gallery {
    display: block;
  }
  
  /* Remove desktop background on mobile */
  .gallery-root::before {
    display: none;
  }
}

/* ─── Mobile Fine-tuning ─────────────────────────────────────── */

@media (max-width: 480px) {
  .mobile-gallery-header {
    padding: 0 12px 30px;
  }
  
  .mobile-gallery-title {
    font-size: 14vw;
  }
  
  .mobile-gallery-grid {
    padding: 0 12px;
    gap: 10px;
  }
  
  .mobile-meta {
    padding: 10px;
  }
  
  .lightbox-content {
    width: 95vw;
    height: 85vh;
  }
  
  .lightbox-close {
    top: -40px;
  }
}

/* ─── Touch Interactions ─────────────────────────────────────── */

@media (max-width: 768px) {
  .mobile-gallery-item,
  .lightbox-close,
  .lightbox-navigation button {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
}

/* ─── Performance Optimizations ─────────────────────────────── */

@media (max-width: 768px) {
  .mobile-card,
  .lightbox-image-container {
    will-change: transform;
    transform: translateZ(0);
  }
}
</style>

<!-- force white header on this route -->
<style>
html.is-gallery .global-header .header-logo,
html.is-gallery .global-header .menu a,
html.is-gallery .global-header .menu a.active,
html.is-gallery .global-header .header-infos span { color:#fff !important; }

/* Mobile header styling for gallery */
@media (max-width: 768px) {
  html.is-gallery .global-header .mobile-menu-toggle {
    color: #fff !important;
  }
}
</style>
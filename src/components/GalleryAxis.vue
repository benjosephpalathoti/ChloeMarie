<template>   
  <div 
    class="axis" 
    :class="{ 'mobile-hidden': isMobile }"
    :style="{ '--axis-w': effectiveAxisWidth + 'px' }"
  >     
    <div class="bar">       
      <div class="track">         
        <div           
          v-for="k in indices"           
          :key="k"           
          class="tick"           
          :class="{ major: (Math.abs(k) % majorEvery) === 0 }"           
          :style="{ left: `calc(50% + ${k * effectiveGap + trackOffset}px)` }"         
        >           
          <i />           
          <span v-if="(Math.abs(k) % majorEvery) === 0" class="label">{{ labelFor(k) }}</span>         
        </div>       
      </div>     
    </div>      

    <div class="playhead">       
      <div class="stem"></div>       
      <div class="nub"></div>     
    </div>   
  </div> 
</template>  

<script> 
export default {   
  name: "GalleryAxis",
  data() {
    return {
      isMobile: false
    }
  },
  props: {     
    offsetX:        { type: Number, default: 0 },     
    baseValue:      { type: Number, default: 500 },     
    gap:            { type: Number, default: 10 },     
    majorEvery:     { type: Number, default: 5 },     
    unitsPerPixel:  { type: Number, default: 0.12 },     
    sensitivity:    { type: Number, default: 1 },     
    axisWidth:      { type: Number, default: 920 },   
  },   
  computed: {
    // Responsive axis width
    effectiveAxisWidth() {
      if (this.isMobile) return 0; // Hidden on mobile
      return Math.min(this.axisWidth, window.innerWidth * 0.9);
    },
    
    // Responsive gap spacing
    effectiveGap() {
      if (this.isMobile) return this.gap;
      // Slightly larger gaps on smaller screens for better readability
      if (window.innerWidth < 1200) {
        return this.gap * 1.2;
      }
      return this.gap;
    },
    
    visibleTicks() { 
      if (this.isMobile) return 0;
      return Math.ceil(this.effectiveAxisWidth / this.effectiveGap) + 12; 
    },     
    indices() {       
      if (this.isMobile) return [];
      const half = Math.floor(this.visibleTicks / 2);       
      return Array.from({ length: this.visibleTicks }, (_, i) => i - half);     
    },     
    trackOffset() {       
      if (this.isMobile) return 0;
      const shift = (this.offsetX * this.sensitivity) % this.effectiveGap;       
      const rem = (shift + this.effectiveGap) % this.effectiveGap;       
      return -rem;     
    },   
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    
    onResize() {
      this.checkMobile();
    },
    
    labelFor(k) {       
      if (this.isMobile) return '';
      const pxFromCenter = this.offsetX + k * this.effectiveGap;       
      const val = this.baseValue + pxFromCenter * this.unitsPerPixel;       
      return Math.round(val);     
    },   
  },
  
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.onResize, { passive: true });
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  }
}; 
</script>  

<style scoped> 
.axis{   
  position:fixed; left:0; right:0; bottom:0; height:86px; z-index:5;   
  pointer-events:none; display:flex; align-items:flex-end; justify-content:center; 
  transition: opacity 0.3s ease, transform 0.3s ease;
} 

.bar{   
  position:absolute; left:50%; transform:translateX(-50%); bottom:10px;   
  width: var(--axis-w); height:48px; pointer-events:none; overflow:hidden;    
  /* soft fade on the ticks themselves (no boxy overlays) */   
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);           
  mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%); 
} 

.track{ 
  position:absolute; left:0; right:0; bottom:8px; height:38px; 
} 

.tick{   
  position:absolute; bottom:0; width:1px; height:100%;   
  display:flex; flex-direction:column; align-items:center; gap:6px; 
} 

.tick i{   
  display:block; width:2px; height:10px; background:#ffd84c; border-radius:1px; opacity:.75; 
} 

.tick.major i{ 
  height:18px; opacity:1; 
} 

.label{   
  position:relative; top:-2px; font-size:12px; letter-spacing:.08em;   
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;   
  color:#f5f5f5; text-shadow:0 2px 8px #000a; 
}  

.playhead{ 
  position:absolute; left:50%; bottom:0; transform:translateX(-50%); 
} 

.playhead .stem{ 
  width:3px; height:46px; background:#ffd84c; border-radius:2px; box-shadow:0 2px 10px #2228; 
} 

.playhead .nub{ 
  width:10px; height:10px; border-radius:50%; background:#ffd84c; margin:6px auto 10px auto;   
  filter:drop-shadow(0 0 8px rgba(255,216,76,.6)); 
}

/* ─── Responsive Styles ──────────────────────────────────────── */

/* Large Desktop - Full axis */
@media (min-width: 1201px) {
  .axis {
    opacity: 1;
  }
}

/* Desktop/Laptop - Scaled axis */
@media (max-width: 1200px) and (min-width: 769px) {
  .axis {
    height: 72px;
  }
  
  .bar {
    bottom: 8px;
    height: 40px;
  }
  
  .playhead .stem {
    height: 38px;
  }
  
  .label {
    font-size: 11px;
  }
  
  .tick i {
    width: 1.5px;
  }
  
  .playhead .nub {
    width: 8px;
    height: 8px;
  }
}

/* ─── Mobile Styles (Hidden) ─────────────────────────────────── */

@media (max-width: 768px) {
  .axis {
    display: none !important;
    opacity: 0;
    transform: translateY(100%);
    pointer-events: none;
  }
}

/* Alternative mobile-hidden class for programmatic control */
.mobile-hidden {
  display: none !important;
  opacity: 0;
  transform: translateY(100%);
  pointer-events: none;
}

/* ─── Tablet - Simplified axis (optional, currently hidden) ──── */
@media (max-width: 1024px) and (min-width: 769px) {
  /* Uncomment if you want a simplified axis on tablets */
  /*
  .axis {
    height: 60px;
  }
  
  .bar {
    bottom: 6px;
    height: 32px;
  }
  
  .playhead .stem {
    height: 30px;
    width: 2px;
  }
  
  .label {
    font-size: 10px;
  }
  
  .tick i {
    width: 1px;
    height: 8px;
  }
  
  .tick.major i {
    height: 14px;
  }
  
  .playhead .nub {
    width: 6px;
    height: 6px;
  }
  */
}

/* ─── Performance Optimizations ─────────────────────────────── */

@media (max-width: 768px) {
  /* Ensure no processing happens on mobile */
  .axis * {
    display: none;
  }
}

/* ─── Reduced Motion Support ─────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .axis {
    transition: none;
  }
}

/* ─── High DPI Displays ──────────────────────────────────────── */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .tick i {
    /* Slightly thicker ticks on high DPI displays for better visibility */
    width: 2.5px;
  }
  
  .playhead .stem {
    width: 3.5px;
  }
}
</style>
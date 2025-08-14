<template>
  <div class="axis" :style="{ '--axis-w': axisWidth + 'px' }">
    <div class="bar">
      <div class="track">
        <div
          v-for="k in indices"
          :key="k"
          class="tick"
          :class="{ major: (Math.abs(k) % majorEvery) === 0 }"
          :style="{ left: `calc(50% + ${k * gap + trackOffset}px)` }"
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
    visibleTicks() { return Math.ceil(this.axisWidth / this.gap) + 12; },
    indices() {
      const half = Math.floor(this.visibleTicks / 2);
      return Array.from({ length: this.visibleTicks }, (_, i) => i - half);
    },
    trackOffset() {
      const shift = (this.offsetX * this.sensitivity) % this.gap;
      const rem = (shift + this.gap) % this.gap;
      return -rem;
    },
  },
  methods: {
    labelFor(k) {
      const pxFromCenter = this.offsetX + k * this.gap;
      const val = this.baseValue + pxFromCenter * this.unitsPerPixel;
      return Math.round(val);
    },
  },
};
</script>

<style scoped>
.axis{
  position:fixed; left:0; right:0; bottom:0; height:86px; z-index:5;
  pointer-events:none; display:flex; align-items:flex-end; justify-content:center;
}
.bar{
  position:absolute; left:50%; transform:translateX(-50%); bottom:10px;
  width: var(--axis-w); height:48px; pointer-events:none; overflow:hidden;

  /* soft fade on the ticks themselves (no boxy overlays) */
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
}
.track{ position:absolute; left:0; right:0; bottom:8px; height:38px; }
.tick{
  position:absolute; bottom:0; width:1px; height:100%;
  display:flex; flex-direction:column; align-items:center; gap:6px;
}
.tick i{
  display:block; width:2px; height:10px; background:#ffd84c; border-radius:1px; opacity:.75;
}
.tick.major i{ height:18px; opacity:1; }
.label{
  position:relative; top:-2px; font-size:12px; letter-spacing:.08em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  color:#f5f5f5; text-shadow:0 2px 8px #000a;
}

.playhead{ position:absolute; left:50%; bottom:0; transform:translateX(-50%); }
.playhead .stem{ width:3px; height:46px; background:#ffd84c; border-radius:2px; box-shadow:0 2px 10px #2228; }
.playhead .nub{ width:10px; height:10px; border-radius:50%; background:#ffd84c; margin:6px auto 10px auto;
  filter:drop-shadow(0 0 8px rgba(255,216,76,.6)); }
</style>

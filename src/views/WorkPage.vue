<template>
  <main class="work-page">
    <section class="pin container-1440" ref="pinEl">
      <!-- rails (hidden; re-enable if you want them) -->
      <div class="rails" aria-hidden="true">
        <div class="rail"></div>
        <div class="rail"></div>
      </div>

      <!-- right-edge pills -->
      <aside class="edge-nav">
        <button
          v-for="(sec,i) in sections"
          :key="sec.key"
          class="edge-pill"
          :class="{ active: activeIndex === i }"
          @click="scrollToSection(i)"
        >
          <span class="num">{{ String(i+1).padStart(2,'0') }}</span>
          <span class="label">{{ sec.title }}</span>
        </button>
      </aside>

      <!-- HORIZONTAL TRACK (ALL CONTENT SLIDES) -->
      <div class="track" ref="trackEl">
        <!-- FIRST PANEL: ALL WORKS (slides too) -->
        <div class="panel intro" ref="introEl">
          <h1 class="allworks" data-reveal="wipe">ALL<br />WORKS</h1>
        </div>

        <!-- SECTIONS -->
        <div
          class="panel group"
          v-for="(sec,i) in sections"
          :key="sec.key"
          :style="{ '--cards': sec.images.length }"
        >
          <div class="cards">
            <article class="card" v-for="(img,j) in sec.images" :key="j">
              <img
                :src="img.src"
                :alt="img.alt || `${sec.title} ${j+1}`"
                loading="lazy"
                decoding="async"
                @load="onAssetLoad"
                @click="goSeries(sec.key, j)"
                style="cursor:pointer"
              />
              <h2 v-if="j === 0" class="card-title">{{ sec.title }}</h2>
            </article>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRouter } from 'vue-router'
gsap.registerPlugin(ScrollTrigger)

/* === DATA === */
const router = useRouter()

// Click: open dedicated vertical page and jump to the clicked image (?i=index)
function goSeries(sectionKey, index){
  const key = String(sectionKey).toLowerCase()
  const map = {
    ceramics: '/ceramics',
    drawing:  '/drawings',
    designs:  '/designs',
  }
  const path = map[key]
  if (path) router.push({ path, query: { i: index } })
}

const sections = ref([
  {
    key: 'CERAMICS',
    title: 'CERAMICS',
    images: [
      { src: '/assets/works/ceramics/01.png' },
      { src: '/assets/works/ceramics/02.png' },
      { src: '/assets/works/ceramics/03.png' },
      { src: '/assets/works/ceramics/04.png' },
      { src: '/assets/works/ceramics/05.png' },
      { src: '/assets/works/ceramics/06.jpeg' },
      { src: '/assets/works/ceramics/07.jpg' },
      { src: '/assets/works/ceramics/08.jpg' },
    ],
  },
  {
    key: 'DRAWING',
    title: 'DRAWINGS',
    images: [
      { src: '/assets/works/drawing/01.png' },
      { src: '/assets/works/drawing/02.png' },
      { src: '/assets/works/drawing/03.png' },
      { src: '/assets/works/drawing/04.png' },
      { src: '/assets/works/drawing/05.png' },
      { src: '/assets/works/drawing/06.png' },
      { src: '/assets/works/drawing/07.png' },
      { src: '/assets/works/drawing/08.png' },
      { src: '/assets/works/drawing/09.jpg' },
    ],
  },
  {
    key: 'DESIGNS',
    title: 'DESIGNS',
    images: [
      { src: '/assets/works/designs/01.png' },
      { src: '/assets/works/designs/02.png' },
      { src: '/assets/works/designs/03.jpg' },
      { src: '/assets/works/designs/04.jpg' },
      { src: '/assets/works/designs/05.jpg' },
    ],
  },
])

/* === REFS & STATE === */
const pinEl = ref(null)     // pinned viewport
const trackEl = ref(null)   // long track that slides
const introEl = ref(null)   // intro panel
const activeIndex = ref(0)

let st = null
let anim = null
let resizeRaf = 0
let imgCount = 0
let sectionStarts = [] // X offsets for pill jumps

function compute() {
  const vp = pinEl.value
  const tr = trackEl.value
  const introW = introEl.value?.getBoundingClientRect().width || 0
  const groups = Array.from(tr.querySelectorAll('.group'))

  // X start of each section (after the intro panel)
  sectionStarts = []
  let sum = introW
  groups.forEach(g => {
    sectionStarts.push(sum)
    sum += g.getBoundingClientRect().width
  })

  // overshoot so we never stop short; matches the ::after tail
  const raw = tr.scrollWidth - vp.clientWidth
  const endX = Math.max(0, Math.ceil(raw) + 24)
  return { endX, groups }
}

function setup() {
  const tr = trackEl.value
  const { endX, groups } = compute()

  anim?.kill()
  st?.kill()
  ScrollTrigger.getAll().forEach(t => t.vars?.containerAnimation && t.kill())

  anim = gsap.to(tr, { x: () => -compute().endX, ease: 'none' })

  st = ScrollTrigger.create({
    trigger: pinEl.value,
    start: 'top top',
    end: () => '+=' + compute().endX,
    scrub: 1,
    pin: true,
    anticipatePin: 1,
    animation: anim,
    invalidateOnRefresh: true,
  })

  groups.forEach((el, i) => {
    ScrollTrigger.create({
      containerAnimation: anim,
      trigger: el,
      start: 'left center',
      end: 'right center',
      onToggle: s => s.isActive && (activeIndex.value = i),
    })
  })
}

function onAssetLoad() {
  imgCount++
  if (imgCount === 1 || imgCount % 2 === 0) {
    ScrollTrigger.refresh()
    setup()
  }
}

function onResize() {
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    ScrollTrigger.refresh()
    setup()
  })
}

function scrollToSection(i) {
  if (!st) return
  const { endX } = compute()
  const targetX = sectionStarts[i] || 0
  const progress = endX ? targetX / endX : 0
  const y = st.start + progress * (st.end - st.start)
  window.scrollTo({ top: y, behavior: 'smooth' })
}

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(setup)
  window.addEventListener('resize', onResize, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  st?.kill()
  anim?.kill()
  ScrollTrigger.getAll().forEach(t => t.kill())
})
</script>

<style scoped>
.work-page{
  --page-w: 100vw;
  --header-h: 80px;
  --card-w: 588px;
  --card-h: 742px;

  /* tuning knobs */
  --lead-left: 550px;                    /* how far the first card sits to the right */
  --brand-size: 36px;
  --allworks-size: clamp(160px, 23vw, 140px);
  --title-size: clamp(56px, 6.4vw, 96px);

  background:#fff; color:#000;
}

/* full-bleed, zero padding/gaps */
.container-1440{ width:100vw; margin:0; padding:0; box-sizing:border-box; }
.pin{ position:relative; height:var(--card-h); overflow:hidden; border:0; }

/* (optional) rails ON to match the reference lines */
.rails{ position:absolute; inset:0; pointer-events:none; display:block; z-index:1; }
.rail{ position:absolute; top:0; bottom:0; width:1px; background:#e9e9e9; }
.rail:first-child{ left:0; }
.rail:last-child{ right:0; }

/* pills */
.edge-nav{
  position:absolute; right:8px; top:50%; transform:translateY(-50%);
  display:flex; flex-direction:column; gap:16px; z-index:3;
}
.edge-pill{
  border:0; background:#fff; color:#000; border-radius:999px;
  padding:10px 10px 14px; display:flex; flex-direction:column; align-items:center; gap:4px;
  writing-mode:vertical-rl; transform:rotate(180deg);
  text-transform:uppercase; letter-spacing:.08em; font-size:12px; line-height:1; opacity:.5; transition:.2s ease;
}
.edge-pill.active{ background:#000; color:#fff; opacity:1; }

/* track */
.track{
  position:absolute; top:0; left:0; height:var(--card-h);
  display:inline-flex; will-change:transform; padding:0; margin:0; transform:translateZ(0); z-index:2;
}
/* no trailing sliver */
.track::after{ content:""; flex:0 0 24px; width:24px; }

/* panels */
.panel{ position:relative; height:var(--card-h); }

/* intro wider than one card so first image sits further right */
.intro{
  min-width: calc(var(--card-w) + var(--lead-left));
  display:flex; align-items:flex-end; padding:0; margin:0;
}
.brand{
  position:absolute; left:12px; top:10px;
  font-family:'Oswald', Arial, sans-serif; font-weight:900;
  font-size: var(--brand-size); line-height:.9; letter-spacing:.04em;
}
.allworks{
  font-family:'Oswald', Arial, sans-serif; font-weight:900;
  font-size: var(--allworks-size);
  line-height:.84; letter-spacing:-.02em; margin:0 0 12px 12px;
}

/* sections */
.group{ min-width: calc(var(--card-w) * var(--cards)); padding:0; }

/* filmstrip: exact 588×742, edge-to-edge */
.cards{ height:100%; display:flex; gap:0; padding:0; }
.card{
  position:relative; flex:0 0 var(--card-w);
  width:var(--card-w); height:var(--card-h); overflow:hidden; margin:0; border:0;
}
.card + .card{ margin-left:-1px; } /* hide any seam */
.card img{ width:100%; height:100%; object-fit: cover; object-position:center; display:block; transform:translateZ(0); }

/* section title over image */
.card-title{
  position:absolute; left:24px; bottom:22px;
  font-family:'Oswald', Arial, sans-serif; font-weight:900; text-transform:uppercase;
  letter-spacing:.02em; font-size: var(--title-size); line-height:.95;
  color:#fff; text-shadow:0 6px 24px rgba(0,0,0,.35);
}

/* responsive: keep fixed card box on tablet too */
@media (max-width:1200px){
  .pin{ height:var(--card-h); }
  .card{ width:var(--card-w); height:var(--card-h); }
}
</style>

<template>
  <main class="work-page">
    <!-- DESKTOP / TABLET (landscape) -->
    <section class="pin container-1440 desktop-only" ref="pinEl">
      <div class="track" ref="trackEl">
        <!-- LEFT: big title -->
        <div class="panel intro" ref="introEl">
          <h1 class="allworks" data-reveal="wipe">ALL<br />WORKS</h1>
        </div>

        <!-- For each section: 1) LANE (two vertical lines + vertical pill)  2) your existing image group -->
        <template v-for="(sec,i) in sections" :key="sec.key">
          <!-- lane -->
          <div class="panel pre-rails">
            <span class="pre-pill">
              <span class="pill-label">{{ sec.title }}</span>
              <span class="pill-num">{{ String(i+1).padStart(2,'0') }}</span>
            </span>
          </div>

          <!-- image group (unchanged behavior) -->
          <div class="panel group" :style="{ '--cards': sec.images.length }">
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
        </template>

        <div class="tail" aria-hidden="true"></div>
      </div>
    </section>

    <!-- MOBILE / SMALL TABLET -->
    <section class="mobile-only mobile-work-layout">
      <div class="mobile-work-header">
        <h1 class="mobile-allworks">ALL<br />WORKS</h1>
      </div>

      <div class="mobile-categories">
        <div class="mo-lane" v-for="(sec,i) in sections" :key="sec.key">
          <!-- horizontal pill sitting inside a vertical lane -->
          <button class="mo-pill" @click="openIndex = openIndex === i ? -1 : i">
            <span class="mo-label">{{ sec.title }}</span>
            <span class="mo-dot"></span>
            <span class="mo-num">{{ String(i+1).padStart(2,'0') }}</span>
            <svg class="mo-chev" viewBox="0 0 24 24" :class="{ open: openIndex===i }">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>

          <!-- horizontally swipeable ribbon, page scroll remains vertical -->
          <div v-if="openIndex===i" class="mo-frame">
            <div class="mo-scroll">
              <img
                v-for="(img,j) in sec.images"
                :key="j"
                :src="img.src"
                :alt="img.alt || ''"
                loading="lazy"
                decoding="async"
                @click="goSeries(sec.key, j)"
              />
            </div>
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
function goSeries(sectionKey, index){
  const key = String(sectionKey).toLowerCase()
  const map = { ceramics: '/ceramics', drawing: '/drawings', designs: '/designs' }
  const path = map[key]
  if (path) router.push({ path, query: { i: index } })
}

const sections = ref([
  {
    key: 'CERAMICS', title: 'CERAMICS',
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
    key: 'DRAWING', title: 'DRAWINGS',
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
    key: 'DESIGNS', title: 'DESIGNS',
    images: [
      { src: '/assets/works/designs/01.png' },
      { src: '/assets/works/designs/02.png' },
      { src: '/assets/works/designs/03.jpg' },
      { src: '/assets/works/designs/04.jpg' },
      { src: '/assets/works/designs/05.jpg' },
    ],
  },
])

/* === DESKTOP REFS & STATE === */
const pinEl = ref(null)
const trackEl = ref(null)
const introEl = ref(null)
const activeIndex = ref(0)

let st = null
let anim = null
let resizeRaf = 0
let imgCount = 0
let sectionStarts = []

function compute() {
  const vp = pinEl.value, tr = trackEl.value
  if (!vp || !tr) return { endX: 0 }

  // walk every child panel in order; mark the x where each .group begins
  sectionStarts = []
  let sum = 0
  const kids = Array.from(tr.children).filter(el => !el.classList.contains('tail'))
  kids.forEach(el => {
    if (el.classList.contains('group')) sectionStarts.push(sum) // jump to real section, not the lane
    sum += el.getBoundingClientRect().width
  })

  const endX = Math.max(0, Math.ceil(sum - vp.clientWidth) + 24)
  return { endX }
}

function setup() {
  if (window.innerWidth <= 768) return
  const tr = trackEl.value
  if (!tr) return

  anim?.kill(); st?.kill()
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

  // keep your active section detection on each .group
  const groups = Array.from(tr.querySelectorAll('.group'))
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
  if (window.innerWidth <= 768) return
  imgCount++
  if (imgCount === 1 || imgCount % 2 === 0) {
    ScrollTrigger.refresh()
    setup()
  }
}

function onResize() {
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    if (window.innerWidth > 768) {
      ScrollTrigger.refresh()
      setup()
    } else {
      st?.kill(); anim?.kill()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  })
}

function scrollToSection(i) {
  if (!st || window.innerWidth <= 768) return
  const { endX } = compute()
  const targetX = sectionStarts[i] || 0
  const progress = endX ? targetX / endX : 0
  const y = st.start + progress * (st.end - st.start)
  window.scrollTo({ top: y, behavior: 'smooth' })
}

/* === MOBILE STATE === */
const openIndex = ref(0)

onMounted(async () => {
  await nextTick()
  if (window.innerWidth > 768) requestAnimationFrame(setup)
  window.addEventListener('resize', onResize, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  st?.kill(); anim?.kill()
  ScrollTrigger.getAll().forEach(t => t.kill())
})
</script>

<style scoped>
.work-page{
  /* shared sizing knobs */
  --header-h: 80px;
  --card-w: 588px;
  --card-h: 742px;

  --allworks-size: clamp(160px, 23vw, 140px);
  --title-size: clamp(56px, 6.4vw, 96px);

  /* lane (desktop) */
  --lane-w: clamp(260px, 20vw, 380px);
  --lane-line: 2px;
  --lane-color: #111;

  /* pill (desktop) */
  --pill-bw: 2px;
  --pill-r: 999px;

  background:#fff; color:#000;
}

/* ─── Desktop Layout ─────────────────────────────────────────── */

.container-1440{ width:100vw; margin:0; padding:0; box-sizing:border-box; }
.pin{ position:relative; height:var(--card-h); overflow:hidden; }

.track{
  position:absolute; top:0; left:0; height:var(--card-h);
  display:inline-flex; gap:0; will-change:transform; transform:translateZ(0);
}
.tail{ flex:0 0 24px; width:24px; }

.panel{ position:relative; height:var(--card-h); }

/* intro column (left) */
.intro{
  min-width: calc(var(--card-w) + 550px);     /* push first rail to the right */
  display:flex; align-items:flex-end;
}
.allworks{
  font-family:'Oswald', Arial, sans-serif; font-weight:900;
  font-size: clamp(120px, 20vw, 180px);
  line-height:.84; letter-spacing:-.02em; margin:0 0 8px 12px;
}

/* lane with two vertical lines and a vertical pill */
.pre-rails{
  min-width: var(--lane-w);
  height: var(--card-h);
  position: relative;
  pointer-events: none;
}
.pre-rails::before,
.pre-rails::after{
  content:"";
  position:absolute; top:0; bottom:0;
  width: var(--lane-line);
  background: var(--lane-color);
}
.pre-rails::before{ left:0; }
.pre-rails::after{ right:0; }

/* attached vertical pill */
.pre-pill{
  position:absolute; left: 8px; bottom: 10px;
  display:flex; flex-direction:column; align-items:center; gap:6px;
  background:#fff; color:#000; border: var(--pill-bw) solid #000;
  border-radius: var(--pill-r);
  padding: 12px 10px 16px;
  writing-mode: vertical-rl; transform: rotate(180deg);
  text-transform: uppercase; letter-spacing:.08em; font-size:12px; line-height:1;
  pointer-events: auto; z-index: 2;
}
.pre-pill .pill-label{ font-weight: 800; }
.pre-pill .pill-num{ opacity:.6; font-weight:600; }

/* groups: your original filmstrip */
.group{ min-width: calc(var(--card-w) * var(--cards)); }
.cards{ height:100%; display:flex; gap:0; }
.card{ position:relative; flex:0 0 var(--card-w); width:var(--card-w); height:var(--card-h); overflow:hidden; }
.card + .card{ margin-left:-1px; } /* hide seam */
.card img{ width:100%; height:100%; object-fit: cover; object-position:center; display:block; transform:translateZ(0); }

.card-title{
  position:absolute; left:24px; bottom:22px;
  font-family:'Oswald', Arial, sans-serif; font-weight:900; text-transform:uppercase;
  letter-spacing:.02em; font-size: var(--title-size); line-height:.95;
  color:#fff; text-shadow:0 6px 24px rgba(0,0,0,.35);
}

/* ─── Mobile Layout ─────────────────────────────────────────── */

.mobile-work-layout {
  padding-top: 96px; padding-bottom: 48px; min-height: 100vh;
}

.mobile-work-header { padding: 0 16px 32px; }
.mobile-allworks{
  font-family: 'Oswald', Arial, sans-serif; font-weight: 900;
  font-size: 18vw; line-height: .84; letter-spacing: -0.02em; margin: 0;
}

/* vertical lane with two lines; horizontal pill inside */
.mobile-categories{ padding: 0 12px; display:grid; gap: 24px; }
.mo-lane{
  position: relative; padding: 56px 0 12px; /* top room for pill */
  min-height: 64px;
}
.mo-lane::before,
.mo-lane::after{
  content:"";
  position:absolute; top:0; bottom:0;
  width: 2px; background: #111;
}
.mo-lane::before{ left: 6px; }
.mo-lane::after{ right: 6px; }

/* horizontal pill button */
.mo-pill{
  position:absolute; top: 8px; left: 50%;
  transform: translateX(-50%);
  display:flex; align-items:center; gap:10px;
  padding: 10px 14px;
  background:#fff; color:#000; border:2px solid #000; border-radius: 999px;
  text-transform: uppercase; letter-spacing:.06em; font-weight:700;
}
.mo-label{ font-family:'Oswald', Arial, sans-serif; font-weight:700; }
.mo-num{ opacity:.6; font-weight:600; }
.mo-dot{ width:6px; height:6px; border-radius:50%; background:#000; }
.mo-chev{ width:18px; height:18px; transition: transform .2s ease; }
.mo-chev.open{ transform: rotate(180deg); }

/* frame + horizontal ribbon */
.mo-frame{
  border:2px solid #000; border-radius: 18px;
  overflow:hidden; background:#fff;
}
.mo-scroll{
  display:flex; overflow-x:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling: touch;
}
.mo-scroll img{
  width: 100%; height: auto; flex: 0 0 100%;
  display:block; object-fit: cover; scroll-snap-align: start;
}

/* ─── Display toggles ───────────────────────────────────────── */

.desktop-only{ display:block; }
.mobile-only{ display:none; }

@media (max-width: 768px){
  .desktop-only{ display:none; }
  .mobile-only{ display:block; }
}

/* keep fixed card box on mid screens too */
@media (max-width:1200px) and (min-width: 769px) {
  .pin{ height:var(--card-h); }
  .card{ width:var(--card-w); height:var(--card-h); }
}
</style>

<template>
  <main class="work-page">
    <!-- DESKTOP / TABLET (landscape) -->
    <section class="pin container-1440 desktop-only" ref="pinEl">
      <div class="track" ref="trackEl">
        <!-- LEFT: big title -->
        <div class="panel intro" ref="introEl">
          <h1 class="allworks">ALL<br />WORKS</h1>
        </div>

        <!-- lane (two thin lines + vertical pill) + your image group -->
        <template v-for="(sec,i) in sections" :key="sec.key">
          <div class="panel pre-rails">
            <span class="pre-pill">
              <span class="pill-label">{{ sec.title }}</span>
              <span class="pill-num">{{ String(i+1).padStart(2,'0') }}</span>
            </span>
          </div>

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
        <div
          class="mo-lane"
          v-for="(sec,i) in sections"
          :key="sec.key"
          :class="{ open: openIndex===i }"
        >
          <!-- Closed: centered horizontal pill -->
          <button v-if="openIndex!==i" class="mo-pill" @click="openIndex = i">
            <span class="mo-label">{{ sec.title }}</span>
            <span class="mo-dot"></span>
            <span class="mo-num">{{ String(i+1).padStart(2,'0') }}</span>
            <svg class="mo-chev" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>

          <!-- Open: vertical pill on left rail -->
          <button v-else class="mo-vpill" @click="openIndex = -1">
            <span class="vpill-label">{{ sec.title }}</span>
            <span class="vpill-num">{{ String(i+1).padStart(2,'0') }}</span>
          </button>

          <!-- Open: vertical stack of images within the lane -->
          <div v-if="openIndex===i" class="mo-vframe">
            <div class="mo-vstack">
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

  // record where each .group begins (after its lane)
  sectionStarts = []
  let sum = 0
  const kids = Array.from(tr.children).filter(el => !el.classList.contains('tail'))
  kids.forEach(el => {
    if (el.classList.contains('group')) sectionStarts.push(sum)
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

  // active section detection on groups
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
const openIndex = ref(-1) // start closed

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
/* ====== KNOBS ====== */
.work-page{
  /* Full-height strips so images fill top→bottom */
  --card-h: 100vh;
  --card-w: 588px;

  /* DESKTOP lanes: thinner + light grey */
  --lane-w: clamp(130px, 12vw, 200px); /* thinner distance between the two lines */
  --lane-line: 1px;
  --lane-color: #e5e5e5;

  /* DESKTOP vertical pill: taller + bigger text */
  --pill-fs: clamp(16px, 1.3vw, 22px);
  --pill-pad-block: 34px;   /* top/bottom (makes pill taller) */
  --pill-pad-inline: 16px;  /* left/right (makes pill thicker) */
  --pill-bw: 3px;
  --pill-r: 999px;

  /* MOBILE lanes + pills */
  --mo-lane-w: min(300px, 72vw);
  --mo-lane-line: 1px;
  --mo-lane-color: #e5e5e5;

  --mo-pill-fs: clamp(17px, 5.6vw, 21px);
  --mo-pill-pad: 14px 26px;

  --mo-vpill-fs: clamp(16px, 5vw, 20px);
  --mo-vpill-pad-block: 28px;  /* taller vertical pill when open */
  --mo-vpill-pad-inline: 16px;

  background:#fff; color:#000;
}

/* ─── Desktop Layout ─────────────────────────────────────────── */
.container-1440{ width:100vw; margin:0; padding:0; box-sizing:border-box; }
.pin{ position:relative; height:var(--card-h); overflow:hidden; }
.track{ position:absolute; top:0; left:0; height:var(--card-h); display:inline-flex; gap:0; will-change:transform; }
.tail{ flex:0 0 24px; width:24px; }
.panel{ position:relative; height:var(--card-h); }

/* Big title column (offset pushes first lane to the right) */
.intro{ min-width: calc(var(--card-w) + 520px); display:flex; align-items:flex-end; }
.allworks{
  font-family:'Oswald', Arial, sans-serif; font-weight:900;
  font-size: clamp(120px, 20vw, 180px);
  line-height:.84; letter-spacing:-.02em; margin:0 0 8px 12px;
}

/* LANE: two thin vertical lines via borders */
.pre-rails{
  min-width: var(--lane-w);
  height: var(--card-h);
  border-left: var(--lane-line) solid var(--lane-color);
  border-right: var(--lane-line) solid var(--lane-color);
  position: relative;
}

/* DESKTOP vertical pill */
.pre-pill{
  position:absolute; left: 8px; bottom: 12px;
  display:flex; flex-direction:column; align-items:center; gap:8px;
  font-family:'Oswald', Arial, sans-serif;
  font-size: var(--pill-fs); line-height:1;
  background:#000; color:#fff;
  border: var(--pill-bw) solid #000; border-radius: var(--pill-r);
  padding: var(--pill-pad-block) var(--pill-pad-inline);
  writing-mode: vertical-rl; transform: rotate(180deg);
  text-transform: uppercase; letter-spacing:.08em;
  z-index: 2;
}
.pre-pill .pill-label{ font-weight:900; }
.pre-pill .pill-num{ opacity:.95; font-weight:700; }

/* Your filmstrip cards */
.group{ min-width: calc(var(--card-w) * var(--cards)); }
.cards{ height:100%; display:flex; gap:0; }
.card{ position:relative; flex:0 0 var(--card-w); width:var(--card-w); height:var(--card-h); overflow:hidden; }
.card + .card{ margin-left:-1px; } /* hide seam */
.card img{ width:100%; height:100%; object-fit: cover; object-position:center; display:block; transform:translateZ(0); }

.card-title{
  position:absolute; left:24px; bottom:22px;
  font-family:'Oswald', Arial, sans-serif; font-weight:900; text-transform:uppercase;
  letter-spacing:.02em; font-size: clamp(56px, 6.4vw, 96px); line-height:.95;
  color:#fff; text-shadow:0 6px 24px rgba(0,0,0,.35);
}

/* ─── Mobile Layout ─────────────────────────────────────────── */
.mobile-work-layout { padding-top: 96px; padding-bottom: 48px; min-height: 100vh; }
.mobile-work-header { padding: 0 16px 32px; }
.mobile-allworks{
  font-family:'Oswald', Arial, sans-serif; font-weight:900;
  font-size: 18vw; line-height:.84; letter-spacing:-0.02em; margin:0;
}

/* container */
.mobile-categories{ padding: 0 12px; display:grid; gap: 24px; }

/* vertical lane using centered pseudo-lines */
.mo-lane{ position: relative; padding: 70px 0 12px; }
.mo-lane::before,
.mo-lane::after{
  content:""; position:absolute; top:0; bottom:0;
  width: var(--mo-lane-line); background: var(--mo-lane-color);
}
.mo-lane::before{ left: calc(50% - var(--mo-lane-w)/2); }
.mo-lane::after { right: calc(50% - var(--mo-lane-w)/2); }

/* CLOSED: horizontal pill centered */
.mo-pill{
  position:absolute; top: 10px; left: 50%; transform: translateX(-50%);
  display:flex; align-items:center; gap:10px;
  padding: var(--mo-pill-pad);
  font-family:'Oswald', Arial, sans-serif; font-weight:900; font-size: var(--mo-pill-fs);
  background:#000; color:#fff; border:2px solid #000; border-radius: 999px;
  text-transform: uppercase; letter-spacing:.06em;
}
.mo-label{ font-weight:900; }
.mo-num{ opacity:.95; font-weight:700; }
.mo-dot{ width:6px; height:6px; border-radius:50%; background:#fff; }
.mo-chev{ width:18px; height:18px; fill:none; }

/* OPEN: tighter top padding (pill moves to side vertically) */
.mo-lane.open{ padding-top: 12px; }

/* OPEN: vertical pill on left rail */
.mo-vpill{
  position:absolute;
  left: calc(50% - var(--mo-lane-w)/2 + 6px); /* ~6px in from the line */
  bottom: 12px;
  display:flex; flex-direction:column; align-items:center; gap:8px;
  padding: var(--mo-vpill-pad-block) var(--mo-vpill-pad-inline);
  font-family:'Oswald', Arial, sans-serif; font-size: var(--mo-vpill-fs);
  background:#000; color:#fff; border:2px solid #000; border-radius: 999px;
  writing-mode: vertical-rl; transform: rotate(180deg);
  text-transform: uppercase; letter-spacing:.08em; line-height:1;
  z-index: 2;
}
.vpill-label{ font-weight:900; }
.vpill-num{ opacity:.95; font-weight:700; }

/* OPEN content: vertical stack inside lane */
.mo-vframe{
  width: var(--mo-lane-w);
  margin: 12px auto 0;               /* center inside lane */
  border:2px solid #000; border-radius: 18px;
  overflow:hidden; background:#fff;
}
.mo-vstack{ display:block; }
.mo-vstack img{
  width:100%; height:auto; display:block; object-fit:cover;
}

/* Display toggles */
.desktop-only{ display:block; }
.mobile-only{ display:none; }
@media (max-width: 768px){
  .desktop-only{ display:none; }
  .mobile-only{ display:block; }
}

/* mid screens keep fixed card box */
@media (max-width:1200px) and (min-width: 769px) {
  .pin{ height:var(--card-h); }
  .card{ width:var(--card-w); height:var(--card-h); }
}
</style>

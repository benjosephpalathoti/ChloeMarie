<template>
  <main class="work-page">
    <!-- DESKTOP -->
    <section class="pin container-1440 desktop-only" ref="pinEl">
      <div class="track" ref="trackEl">
        <!-- Left: big title -->
        <div class="intro-col" ref="introEl">
          <h1 class="allworks">ALL<br />WORKS</h1>
        </div>

        <!-- Right: three framed strips -->
        <div class="strips-col" ref="stripsEl">
          <div class="strip" v-for="(sec,i) in sections" :key="sec.key">
            <div class="strip-frame">
              <!-- attached vertical pill -->
              <div class="strip-label">
                <span class="label">{{ sec.title }}</span>
                <span class="num">{{ String(i+1).padStart(2,'0') }}</span>
              </div>

              <!-- viewport (fixed frame) -->
              <div class="strip-viewport">
                <!-- inner rail that slides -->
                <div class="strip-track" :ref="el => (stripTracks[i] = el)">
                  <img
                    v-for="(img,j) in sec.images"
                    :key="j"
                    :src="img.src"
                    :alt="img.alt || `${sec.title} ${j+1}`"
                    loading="lazy"
                    decoding="async"
                    @load="onAssetLoad"
                    @click="goSeries(sec.key, j)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- tiny spacer so the last pixels don't get clipped -->
        <div class="tail" aria-hidden="true"></div>
      </div>
    </section>

    <!-- MOBILE -->
    <section class="mobile-only mobile-work-layout">
      <div class="mobile-work-header">
        <h1 class="mobile-allworks">ALL<br />WORKS</h1>
      </div>

      <div class="mobile-categories">
        <div class="mo-cat" v-for="(sec,i) in sections" :key="sec.key">
          <button class="mo-bar" @click="openIndex = openIndex === i ? -1 : i">
            <span class="pill">{{ sec.title }}</span>
            <span class="num">{{ String(i+1).padStart(2,'0') }}</span>
            <svg class="chev" viewBox="0 0 24 24" :class="{ open: openIndex===i }"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
          </button>

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

/* === DATA (unchanged) === */
const router = useRouter()
function goSeries(sectionKey, index){
  const key = String(sectionKey).toLowerCase()
  const map = { ceramics: '/ceramics', drawing: '/drawings', designs: '/designs' }
  const path = map[key]
  if (path) router.push({ path, query: { i: index } })
}

const sections = ref([
  { key:'CERAMICS', title:'CERAMICS', images:[
    { src:'/assets/works/ceramics/01.png' }, { src:'/assets/works/ceramics/02.png' },
    { src:'/assets/works/ceramics/03.png' }, { src:'/assets/works/ceramics/04.png' },
    { src:'/assets/works/ceramics/05.png' }, { src:'/assets/works/ceramics/06.jpeg' },
    { src:'/assets/works/ceramics/07.jpg' }, { src:'/assets/works/ceramics/08.jpg' },
  ]},
  { key:'DRAWING', title:'DRAWINGS', images:[
    { src:'/assets/works/drawing/01.png' }, { src:'/assets/works/drawing/02.png' },
    { src:'/assets/works/drawing/03.png' }, { src:'/assets/works/drawing/04.png' },
    { src:'/assets/works/drawing/05.png' }, { src:'/assets/works/drawing/06.png' },
    { src:'/assets/works/drawing/07.png' }, { src:'/assets/works/drawing/08.png' },
    { src:'/assets/works/drawing/09.jpg' },
  ]},
  { key:'DESIGNS', title:'DESIGNS', images:[
    { src:'/assets/works/designs/01.png' }, { src:'/assets/works/designs/02.png' },
    { src:'/assets/works/designs/03.jpg' }, { src:'/assets/works/designs/04.jpg' },
    { src:'/assets/works/designs/05.jpg' },
  ]},
])

/* === DESKTOP REFS / STATE === */
const pinEl = ref(null)
const trackEl = ref(null)
const introEl = ref(null)
const stripsEl = ref(null)
const stripTracks = ref([])

let st = null
let anim = null
let stripTweens = []
let resizeRaf = 0
let imgCount = 0

function compute(){
  const vp = pinEl.value
  const tr = trackEl.value
  if (!vp || !tr) return { endX: 0 }
  const raw = tr.scrollWidth - vp.clientWidth
  const endX = Math.max(0, Math.ceil(raw) + 24)
  return { endX }
}

function setup(){
  if (window.innerWidth <= 768) return
  const tr = trackEl.value
  if (!tr) return

  // kill old
  stripTweens.forEach(t => t.kill()); stripTweens = []
  anim?.kill(); st?.kill()
  ScrollTrigger.getAll().forEach(t => t.vars?.containerAnimation && t.kill())

  // main horizontal pan (intro -> strips)
  anim = gsap.to(tr, {
    x: () => -compute().endX,
    ease: 'none',
  })

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

  // each strip's inner rail slides inside its frame
  stripTracks.value.forEach((el) => {
    if (!el) return
    const vp = el.parentElement // .strip-viewport
    const getX = () => -(el.scrollWidth - vp.clientWidth)

    const t = gsap.to(el, {
      x: getX,
      ease: 'none',
      scrollTrigger: {
        containerAnimation: anim,
        trigger: stripsEl.value,
        start: 'left left',
        end: 'right right',
        scrub: 1,
        invalidateOnRefresh: true,
      }
    })
    stripTweens.push(t)
  })
}

function onAssetLoad(){
  if (window.innerWidth <= 768) return
  imgCount++
  if (imgCount === 1 || imgCount % 2 === 0){
    ScrollTrigger.refresh()
    setup()
  }
}

function onResize(){
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    if (window.innerWidth > 768){
      ScrollTrigger.refresh()
      setup()
    } else {
      st?.kill(); anim?.kill()
      stripTweens.forEach(t => t.kill()); stripTweens = []
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  })
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
  stripTweens.forEach(t => t.kill())
  ScrollTrigger.getAll().forEach(t => t.kill())
})
</script>

<style scoped>
.work-page{
  /* sizing knobs to tweak the look */
  --strip-h: min(86vh, 900px);
  --strip-w: clamp(280px, 22vw, 420px);
  --strip-gap: 28px;
  --frame-r: 28px;
  --frame-bw: 2px;
  --intro-w: clamp(520px, 48vw, 760px);

  background:#fff; color:#000;
}

/* --- DESKTOP --- */
.container-1440{ width:100vw; margin:0; padding:0; box-sizing:border-box; }
.pin{ position:relative; height:var(--strip-h); overflow:hidden; }

.track{
  position:absolute; inset:auto auto 0 0;
  display:flex; align-items:flex-end; gap:48px;
  height:var(--strip-h);
  will-change: transform;
}

/* left column */
.intro-col{
  min-width: var(--intro-w);
  height: 100%;
  display:flex; align-items:flex-end;
  padding-left: 12px;
}
.allworks{
  font-family:'Oswald', Arial, sans-serif; font-weight:900;
  font-size: clamp(120px, 20vw, 180px);
  line-height:.84; letter-spacing:-.02em; margin:0 0 8px 0;
}

/* right column with 3 strips */
.strips-col{
  height: 100%;
  display:flex;
  gap: var(--strip-gap);
  min-width: calc(3 * var(--strip-w) + 2 * var(--strip-gap));
  padding-right: 12px;
}

/* strip frame */
.strip{ height:100%; width:var(--strip-w); }
.strip-frame{
  position:relative;
  height:100%; width:100%;
  border: var(--frame-bw) solid #000;
  border-radius: var(--frame-r);
  overflow: hidden;
  background:#fff;
}

/* vertical pill attached inside frame */
.strip-label{
  position:absolute; left:8px; bottom:8px;
  display:flex; flex-direction:column; align-items:center; gap:8px;
  background:#fff; color:#000;
  border: var(--frame-bw) solid #000; border-radius:999px;
  padding:12px 10px 16px;
  writing-mode: vertical-rl; transform: rotate(180deg);
  z-index: 2;
  text-transform: uppercase; letter-spacing:.08em; font-size:12px;
}
.strip-label .label{ font-weight:700; }
.strip-label .num{ opacity:.6; font-weight:600; }

/* viewport stays fixed; inner track slides */
.strip-viewport{ position:relative; height:100%; width:100%; overflow:hidden; }
.strip-track{
  position:absolute; inset:0 auto 0 0;
  display:flex; gap:0; will-change:transform;
}
.strip-track img{
  width: var(--strip-w);
  height: 100%;
  object-fit: cover;
  display:block;
  cursor:pointer;
}

/* spacer */
.tail{ flex:0 0 24px; width:24px; }

/* --- MOBILE --- */
.mobile-work-layout{
  padding-top: 96px; padding-bottom: 48px;
}
.mobile-work-header{ padding: 0 16px 32px; }
.mobile-allworks{
  font-family:'Oswald', Arial, sans-serif;
  font-weight:900; font-size: 18vw; line-height:.84; letter-spacing:-.02em; margin:0;
}

.mobile-categories{ padding:0 0; }
.mo-cat{ margin: 0 0 24px; }

.mo-bar{
  width:100%; display:flex; align-items:center; justify-content:space-between;
  border:2px solid #000; border-radius: 999px;
  padding: 14px 16px; background:#fff; color:#000;
  text-transform: uppercase; letter-spacing:.06em;
}
.mo-bar .pill{ font-family:'Oswald', Arial, sans-serif; font-weight:700; }
.mo-bar .num{ opacity:.6; }
.mo-bar .chev{ width:22px; height:22px; transition: transform .2s ease; }
.mo-bar .chev.open{ transform: rotate(180deg); }

.mo-frame{
  border:2px solid #000; border-radius: 24px;
  margin-top: 12px; overflow:hidden; background:#fff;
}
.mo-scroll{
  display:flex; overflow-x:auto; scroll-snap-type:x mandatory;
}
.mo-scroll img{
  width: 100%; height: auto; flex: 0 0 100%;
  scroll-snap-align: start; display:block; object-fit: cover;
}

/* display toggles */
.desktop-only{ display:block; }
.mobile-only{ display:none; }

@media (max-width: 768px){
  .desktop-only{ display:none; }
  .mobile-only{ display:block; }
}
</style>

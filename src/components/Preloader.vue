<template>
  <transition name="fade" appear>
    <div v-if="show" class="preload-wrap">
      <!-- progress row -->
      <div class="row">
        <span class="label">LOADING</span>
        <span class="dot">•</span>
        <span class="pct">{{ pct }}%</span>
      </div>

      <!-- star that expands -->
      <svg class="star" viewBox="0 0 100 100" :style="{ transform:`scale(${scale})` }" aria-hidden="true">
        <!-- four-curved star (squircle-ish) -->
        <path
          d="M50 10 C60 30, 70 40, 90 50 C70 60, 60 70, 50 90 C40 70, 30 60, 10 50 C30 40, 40 30, 50 10 Z"
          fill="#fff"/>
      </svg>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'

const show  = ref(true)
const pct   = ref(0)
const scale = ref(0.2)

// emit “done” when preloader finishes
const emit = defineEmits(['done'])

onMounted(() => {
  const MIN_MS = 900
  const start  = performance.now()
  let done = false

  // fake counter that eases to 100
  const tick = () => {
    if (done) return
    pct.value = Math.min(99, pct.value + (1 + (100 - pct.value) * 0.06))
    requestAnimationFrame(tick)
  }
  tick()

  const finish = () => {
    if (done) return
    done = true
    pct.value = 100

    // star grows → fill screen → fade out preloader
    gsap.to(scale, { value: 24, duration: 0.8, ease: 'power3.out',
      onUpdate: () => { /* reactive object */ },
      onComplete: () => {
        gsap.to(show, { value: false, duration: 0.25, onComplete: () => emit('done') })
      }
    })
  }

  // wait for window load OR min time
  const onLoaded = () => {
    const left = Math.max(0, MIN_MS - (performance.now() - start))
    setTimeout(finish, left)
  }
  if (document.readyState === 'complete') onLoaded()
  else window.addEventListener('load', onLoaded, { once: true })
})
</script>

<style scoped>
.preload-wrap{
  position: fixed; inset: 0; background:#000; color:#fff; z-index: 20000;
  display:flex; align-items:center; justify-content:center; overflow:hidden;
}
.row{
  position: absolute; left:50%; top: calc(50% + 58px); transform: translateX(-50%);
  font-size:12px; letter-spacing:.14em; text-transform:uppercase; opacity:.9;
  display:flex; gap:.5em; align-items:center; font-family: ui-monospace, Menlo, Monaco, "Roboto Mono", monospace;
}
.pct{ padding:.18em .6em; border:1px solid #fff; border-radius:999px; font-size:11px; }
.star{
  width: 96vmin; height: 96vmin; transform-origin: 50% 50%;
  filter: drop-shadow(0 0 24px rgba(255,255,255,.35));
}
.fade-enter-active,.fade-leave-active{ transition: opacity .25s ease; }
.fade-enter-from,.fade-leave-to{ opacity: 0; }
</style>

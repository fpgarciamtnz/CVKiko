<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

definePageMeta({ layout: 'blank' })

const scrollContainer = ref(null)
const viewport = ref(null)
const scene = ref(null)
let ctx = null

const sections = [
  { label: 'ABOUT', color: '#264653' },
  { label: 'EXPERIENCE', color: '#2a9d8f' },
  { label: 'SKILLS', color: '#e9c46a' },
  { label: 'EDUCATION', color: '#f4a261' },
  { label: 'CONTACT', color: '#e76f51' },
]

onMounted(() => {
  // CRITICAL: Triple-wait to ensure DOM is fully laid out inside <ClientOnly>
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initScrollAnimation()
      })
    })
  })
})

function initScrollAnimation() {
  // --- GUARD 1: Check refs exist ---
  if (!scrollContainer.value || !viewport.value || !scene.value) {
    console.error('[GSAP] Refs not ready:', {
      scrollContainer: !!scrollContainer.value,
      viewport: !!viewport.value,
      scene: !!scene.value,
    })
    return
  }

  // --- GUARD 2: Get GSAP from plugin ---
  const { $gsap, $ScrollTrigger } = useNuxtApp()
  if (!$gsap || !$ScrollTrigger) {
    console.error('[GSAP] Plugin not providing gsap or ScrollTrigger:', {
      gsap: !!$gsap,
      ScrollTrigger: !!$ScrollTrigger,
    })
    return
  }

  // --- GUARD 3: Check scrollWidth is valid ---
  const totalScroll = scene.value.scrollWidth - window.innerWidth
  console.log('[GSAP] totalScroll:', totalScroll, 'scrollWidth:', scene.value.scrollWidth, 'innerWidth:', window.innerWidth)
  if (totalScroll <= 0) {
    console.error('[GSAP] totalScroll is 0 or negative — CSS panels are not taking up width. Check .panel has min-width: 100vw and flex-shrink: 0')
    return
  }

  // --- CREATE ANIMATION ---
  ctx = $gsap.context(() => {
    $gsap.to(scene.value, {
      x: () => -(scene.value.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContainer.value,
        pin: viewport.value,
        scrub: 1,
        end: () => `+=${scene.value.scrollWidth - window.innerWidth}`,
        invalidateOnRefresh: true,
        markers: true,
      },
    })
  }, scrollContainer.value)

  console.log('[GSAP] ScrollTrigger initialized successfully')
}

onBeforeUnmount(() => {
  if (ctx) {
    ctx.revert()
    ctx = null
  }
})
</script>

<template>
  <ClientOnly>
    <div ref="scrollContainer" class="scroll-container">
      <div ref="viewport" class="viewport">
        <div ref="scene" class="scene">
          <div
            v-for="(section, i) in sections"
            :key="i"
            class="panel"
            :style="{ backgroundColor: section.color }"
          >
            <h1>{{ section.label }}</h1>
          </div>
        </div>
      </div>
    </div>
    <template #fallback>
      <div class="loading">Loading...</div>
    </template>
  </ClientOnly>
</template>

<style scoped>
/* Remove any global margin/padding that kills layout */
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.scroll-container {
  /* This element MUST exist so ScrollTrigger has something to measure */
}

.viewport {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.scene {
  display: flex;
  flex-wrap: nowrap;
  height: 100%;
  /* DO NOT set width here — let children define it */
}

.panel {
  min-width: 100vw;   /* EACH panel is full screen width */
  height: 100%;
  flex-shrink: 0;      /* CRITICAL: prevents panels from collapsing */
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel h1 {
  color: white;
  font-size: 4rem;
  font-family: sans-serif;
  margin: 0;
}

.loading {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
</style>

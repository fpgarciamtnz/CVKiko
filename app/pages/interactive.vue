<script setup lang="ts">
const { $gsap, $ScrollTrigger } = useNuxtApp()

const scrollContainer = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const scene = ref<HTMLElement | null>(null)

let ctx: any

onMounted(() => {
  if (!scrollContainer.value || !viewport.value || !scene.value) return

  const gsap = $gsap as any
  const ScrollTrigger = $ScrollTrigger as any

  ctx = gsap.context(() => {
    const totalScroll = scene.value!.scrollWidth - window.innerWidth

    gsap.to(scene.value, {
      x: -totalScroll,
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContainer.value,
        pin: viewport.value,
        scrub: 1,
        end: () => `+=${totalScroll}`,
        invalidateOnRefresh: true,
        markers: true,
      }
    })
  })
})

onBeforeUnmount(() => {
  if (ctx) ctx.revert()
})
</script>

<template>
  <ClientOnly>
    <div class="scroll-container" ref="scrollContainer">
      <div class="viewport" ref="viewport">
        <div class="scene" ref="scene">
          <div class="panel" style="background: #264653;">ABOUT</div>
          <div class="panel" style="background: #2a9d8f;">EXPERIENCE</div>
          <div class="panel" style="background: #e9c46a;">SKILLS</div>
          <div class="panel" style="background: #f4a261;">EDUCATION</div>
          <div class="panel" style="background: #e76f51;">CONTACT</div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.viewport {
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.scene {
  display: flex;
  flex-wrap: nowrap;
  height: 100%;
}

.panel {
  min-width: 100vw;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
  font-family: sans-serif;
}
</style>

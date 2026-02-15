import type { Ref } from 'vue'

export function usePixiApp(container: Ref<HTMLDivElement | null>) {
  const app = shallowRef<InstanceType<typeof import('pixi.js').Application> | null>(null)

  onMounted(async () => {
    const el = container.value
    if (!el) return

    const PIXI = await import('pixi.js')
    const pixiApp = new PIXI.Application()

    await pixiApp.init({
      resizeTo: el,
      background: 0x3a7d44,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    })

    el.appendChild(pixiApp.canvas as HTMLCanvasElement)
    app.value = pixiApp
  })

  onUnmounted(() => {
    if (app.value) {
      app.value.destroy(true, { children: true })
      app.value = null
    }
  })

  return { app }
}

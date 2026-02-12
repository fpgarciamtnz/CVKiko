export function useGameLoop(callback: (dt: number) => void) {
  let rafId = 0
  let lastTime = 0
  let running = false

  function loop(time: number) {
    if (!running) return
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0
    lastTime = time
    callback(dt)
    rafId = requestAnimationFrame(loop)
  }

  function start() {
    if (running) return
    running = true
    lastTime = 0
    rafId = requestAnimationFrame(loop)
  }

  function stop() {
    running = false
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  onMounted(start)
  onUnmounted(stop)

  return { start, stop }
}

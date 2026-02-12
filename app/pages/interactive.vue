<script setup lang="ts">
const { bricks, fetchBricks } = useBricks()
const { settings, fetchSettings } = useSettings()

await Promise.all([
  fetchBricks(),
  fetchSettings()
])
</script>

<template>
  <div class="h-[calc(100vh-120px)]">
    <ClientOnly>
      <InteractiveInteractiveScene
        :bricks="bricks"
        :settings="settings"
      />
      <template #fallback>
        <div class="flex items-center justify-center h-full text-slate-500">
          <div class="text-center">
            <UIcon
              name="i-lucide-car"
              class="w-12 h-12 mx-auto mb-4 animate-pulse"
            />
            <p>Loading interactive experience...</p>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

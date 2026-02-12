<script setup lang="ts">
defineProps<{
  worldWidth: number
}>()
</script>

<template>
  <div
    class="absolute left-0 right-0"
    :style="{ top: '55%', height: '128px', width: worldWidth + 'px' }"
  >
    <!-- Road surface -->
    <div class="absolute inset-0 bg-slate-600 dark:bg-slate-700 rounded-sm" />

    <!-- Road edges -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-slate-400 dark:bg-slate-500" />
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-slate-400 dark:bg-slate-500" />

    <!-- Dashed center line -->
    <div
      class="absolute left-0 right-0"
      :style="{ top: '50%', transform: 'translateY(-50%)', height: '4px' }"
    >
      <svg
        :width="worldWidth"
        height="4"
        class="block"
      >
        <line
          x1="0"
          y1="2"
          :x2="worldWidth"
          y2="2"
          stroke="#facc15"
          stroke-width="4"
          stroke-dasharray="40 30"
          class="dark:opacity-70"
        />
      </svg>
    </div>
  </div>
</template>

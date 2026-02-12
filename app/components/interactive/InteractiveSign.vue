<script setup lang="ts">
defineProps<{
  x: number
  label: string
  icon: string
  active: boolean
}>()
</script>

<template>
  <div
    class="absolute"
    :style="{
      left: x + 'px',
      top: '55%',
      transform: 'translateX(-50%) translateY(-220px)',
      zIndex: 10
    }"
  >
    <!-- Sign board -->
    <div
      class="relative px-4 py-2 rounded-md border-2 text-center transition-all duration-300 whitespace-nowrap"
      :class="active
        ? 'bg-slate-800 border-amber-400 text-white dark:bg-slate-100 dark:text-slate-900 dark:border-amber-400 scale-110'
        : 'bg-slate-200 border-slate-400 text-slate-700 dark:bg-slate-700 dark:border-slate-500 dark:text-slate-300'"
    >
      <UIcon
        :name="icon"
        class="w-5 h-5 mx-auto mb-1"
      />
      <div class="text-xs font-bold uppercase tracking-wider">
        {{ label }}
      </div>

      <!-- Glow effect when active -->
      <div
        v-if="active"
        class="absolute -inset-1 rounded-lg bg-amber-400/20 dark:bg-amber-400/10 -z-10 animate-pulse"
      />
    </div>

    <!-- Post -->
    <div class="w-1 h-16 bg-slate-400 dark:bg-slate-500 mx-auto" />
  </div>
</template>

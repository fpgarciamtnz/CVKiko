<script setup lang="ts">
const props = defineProps<{
  cameraX: number
  worldWidth: number
}>()

// Parallax speeds: hills slow, buildings faster
const hillOffset = computed(() => props.cameraX * 0.1)
const buildingOffset = computed(() => props.cameraX * 0.3)
</script>

<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <!-- Sky gradient -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" />

    <!-- Hills layer (slowest parallax) -->
    <svg
      class="absolute bottom-[45%] left-0 w-full h-[200px]"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      :style="{ transform: `translateX(${-hillOffset % 600}px)` }"
    >
      <!-- Repeat pattern for seamless scrolling -->
      <path
        d="M0 200 L0 140 Q100 60 200 120 Q300 40 400 100 Q500 20 600 80 Q700 50 800 110 Q900 30 1000 90 Q1100 60 1200 120 L1200 200 Z"
        class="fill-slate-300/60 dark:fill-slate-700/40"
      />
      <path
        d="M0 200 L0 160 Q150 100 300 140 Q450 80 600 130 Q750 70 900 120 Q1050 90 1200 150 L1200 200 Z"
        class="fill-slate-300/40 dark:fill-slate-700/25"
      />
    </svg>

    <!-- Buildings layer (faster parallax) -->
    <svg
      class="absolute bottom-[45%] left-0 w-full h-[160px]"
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      :style="{ transform: `translateX(${-buildingOffset % 800}px)` }"
    >
      <!-- Building silhouettes -->
      <rect
        x="50"
        y="60"
        width="40"
        height="100"
        class="fill-slate-400/30 dark:fill-slate-600/30"
      />
      <rect
        x="100"
        y="40"
        width="50"
        height="120"
        class="fill-slate-400/25 dark:fill-slate-600/25"
      />
      <rect
        x="200"
        y="70"
        width="30"
        height="90"
        class="fill-slate-400/30 dark:fill-slate-600/30"
      />
      <rect
        x="300"
        y="30"
        width="60"
        height="130"
        class="fill-slate-400/20 dark:fill-slate-600/20"
      />
      <rect
        x="380"
        y="55"
        width="35"
        height="105"
        class="fill-slate-400/25 dark:fill-slate-600/25"
      />
      <rect
        x="500"
        y="45"
        width="45"
        height="115"
        class="fill-slate-400/30 dark:fill-slate-600/30"
      />
      <rect
        x="600"
        y="65"
        width="30"
        height="95"
        class="fill-slate-400/20 dark:fill-slate-600/20"
      />
      <rect
        x="700"
        y="35"
        width="55"
        height="125"
        class="fill-slate-400/25 dark:fill-slate-600/25"
      />
      <rect
        x="800"
        y="50"
        width="40"
        height="110"
        class="fill-slate-400/30 dark:fill-slate-600/30"
      />
      <rect
        x="900"
        y="70"
        width="35"
        height="90"
        class="fill-slate-400/20 dark:fill-slate-600/20"
      />
      <rect
        x="1000"
        y="40"
        width="50"
        height="120"
        class="fill-slate-400/25 dark:fill-slate-600/25"
      />
      <rect
        x="1100"
        y="55"
        width="40"
        height="105"
        class="fill-slate-400/30 dark:fill-slate-600/30"
      />
    </svg>

    <!-- Ground line -->
    <div class="absolute left-0 right-0 bottom-[45%] h-px bg-slate-300 dark:bg-slate-700" />
  </div>
</template>

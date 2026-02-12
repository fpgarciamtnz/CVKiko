<script setup lang="ts">
const props = defineProps<{
  x: number
  direction: 1 | -1
  velocity: number
}>()

const isMoving = computed(() => Math.abs(props.velocity) > 10)
</script>

<template>
  <div
    class="absolute"
    :style="{
      left: x + 'px',
      top: '55%',
      transform: `translateX(-50%) translateY(-100%) scaleX(${direction})`,
      transition: 'none',
      zIndex: 20
    }"
  >
    <!-- Car SVG -->
    <svg
      width="80"
      height="48"
      viewBox="0 0 80 48"
      fill="none"
      class="drop-shadow-md"
    >
      <!-- Car body -->
      <rect
        x="4"
        y="20"
        width="72"
        height="18"
        rx="4"
        class="fill-slate-800 dark:fill-slate-200"
      />
      <!-- Car roof -->
      <path
        d="M20 20 L28 6 L56 6 L64 20"
        class="fill-slate-700 dark:fill-slate-300"
      />
      <!-- Windows -->
      <path
        d="M30 8 L24 18 L42 18 L42 8 Z"
        class="fill-sky-200 dark:fill-sky-400"
        opacity="0.7"
      />
      <path
        d="M44 8 L44 18 L60 18 L54 8 Z"
        class="fill-sky-200 dark:fill-sky-400"
        opacity="0.7"
      />
      <!-- Front wheel -->
      <circle
        cx="22"
        cy="38"
        r="8"
        class="fill-slate-900 dark:fill-slate-100"
      />
      <circle
        cx="22"
        cy="38"
        r="4"
        class="fill-slate-500 dark:fill-slate-400"
      />
      <!-- Rear wheel -->
      <circle
        cx="58"
        cy="38"
        r="8"
        class="fill-slate-900 dark:fill-slate-100"
      />
      <circle
        cx="58"
        cy="38"
        r="4"
        class="fill-slate-500 dark:fill-slate-400"
      />
      <!-- Headlight -->
      <rect
        x="72"
        y="24"
        width="4"
        height="6"
        rx="1"
        class="fill-amber-300"
        :opacity="isMoving ? 1 : 0.5"
      />
      <!-- Taillight -->
      <rect
        x="4"
        y="24"
        width="3"
        height="6"
        rx="1"
        class="fill-red-500"
        :opacity="isMoving ? 1 : 0.5"
      />
    </svg>

    <!-- Wheel spin animation -->
    <div
      v-if="isMoving"
      class="absolute bottom-[2px] left-[14px] w-[16px] h-[16px] rounded-full border-t-2 border-slate-400 animate-spin"
    />
    <div
      v-if="isMoving"
      class="absolute bottom-[2px] right-[14px] w-[16px] h-[16px] rounded-full border-t-2 border-slate-400 animate-spin"
    />
  </div>
</template>

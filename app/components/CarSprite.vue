<template>
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
    <g class="wheel">
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
      <line
        x1="22"
        y1="34"
        x2="22"
        y2="42"
        stroke="currentColor"
        stroke-width="1"
        class="text-slate-700 dark:text-slate-300"
      />
    </g>
    <!-- Rear wheel -->
    <g class="wheel">
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
      <line
        x1="58"
        y1="34"
        x2="58"
        y2="42"
        stroke="currentColor"
        stroke-width="1"
        class="text-slate-700 dark:text-slate-300"
      />
    </g>
    <!-- Headlight -->
    <rect
      x="72"
      y="24"
      width="4"
      height="6"
      rx="1"
      class="fill-amber-300"
    />
    <!-- Taillight -->
    <rect
      x="4"
      y="24"
      width="3"
      height="6"
      rx="1"
      class="fill-red-500"
    />
  </svg>
</template>

<style scoped>
.wheel {
  transform-origin: center;
  animation: spin 1s linear infinite;
}

.wheel:first-of-type {
  transform-origin: 22px 38px;
}

.wheel:last-of-type {
  transform-origin: 58px 38px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

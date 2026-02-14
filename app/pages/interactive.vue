<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const checked = ref(false)
</script>

<template>
  <div style="min-height: 300vh;">
    <div style="padding: 2rem; display: flex; align-items: center; gap: 0.75rem;">
      <input
        id="proof-of-life"
        v-model="checked"
        type="checkbox"
      >
      <label for="proof-of-life" style="font-size: 1.25rem; color: white; font-family: sans-serif;">
        {{ checked ? 'It works!' : 'Check me' }}
      </label>
    </div>

    <section
      v-for="section in [
        { label: 'ABOUT', bg: '#264653' },
        { label: 'EXPERIENCE', bg: '#2a9d8f' },
        { label: 'SKILLS', bg: '#e9c46a' },
        { label: 'EDUCATION', bg: '#f4a261' },
        { label: 'CONTACT', bg: '#e76f51' },
      ]"
      :key="section.label"
      :style="{ background: section.bg, height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }"
    >
      <span style="font-size: 4rem; color: white; font-family: sans-serif;">
        {{ section.label }}
      </span>
    </section>
  </div>
</template>

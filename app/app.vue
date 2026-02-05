<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'CVKiko - Modular CV Builder'
const description = 'Build customized CVs with AI-powered brick selection. Add your experiences as bricks and let AI help you choose the best ones for each job.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})

const navigation = [
  { label: 'Dashboard', to: '/', icon: 'i-lucide-home' },
  { label: 'Bricks', to: '/bricks', icon: 'i-lucide-layers' },
  { label: 'Builder', to: '/builder', icon: 'i-lucide-file-text' },
  { label: 'Settings', to: '/settings', icon: 'i-lucide-settings' }
]
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2"
        >
          <UIcon
            name="i-lucide-boxes"
            class="w-6 h-6 text-primary"
          />
          <span class="font-bold text-lg">CVKiko</span>
        </NuxtLink>
      </template>

      <template #center>
        <UNavigationMenu
          :items="navigation"
          class="hidden md:flex"
        />
      </template>

      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter class="border-t">
      <template #left>
        <p class="text-sm text-muted">
          CVKiko - Build better CVs with AI
        </p>
      </template>
    </UFooter>
  </UApp>
</template>

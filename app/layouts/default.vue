<script setup>
const navigation = [
  { label: 'Dashboard', to: '/' },
  { label: 'Bricks', to: '/bricks' },
  { label: 'Builder', to: '/builder' },
  { label: 'Settings', to: '/settings' }
]
</script>

<template>
  <div>
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
      <slot />
    </UMain>

    <UFooter class="border-t">
      <template #left>
        <p class="text-sm text-muted">
          CVKiko - Build better CVs with AI
        </p>
      </template>
    </UFooter>
  </div>
</template>

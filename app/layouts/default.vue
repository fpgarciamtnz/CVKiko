<script setup>
const navigation = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/' },
  { label: 'Bricks', icon: 'i-lucide-layers', to: '/bricks' },
  { label: 'Builder', icon: 'i-lucide-file-text', to: '/builder' },
  { label: 'Roadmap', icon: 'i-lucide-map', to: '/roadmap' },
  { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }
]
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible>
      <template #header="{ collapsed }">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 min-w-0"
        >
          <UIcon
            name="i-lucide-boxes"
            class="size-6 text-primary shrink-0"
          />
          <span
            v-if="!collapsed"
            class="font-bold text-lg truncate"
          >CVKiko</span>
        </NuxtLink>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="navigation"
          orientation="vertical"
          :collapsed="collapsed"
          :tooltip="collapsed"
          highlight
        />
      </template>

      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template #footer="{ collapsed }">
        <UColorModeButton />
        <UDashboardSidebarCollapse />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <UDashboardNavbar>
        <template #right>
          <UColorModeButton class="lg:hidden" />
        </template>
      </UDashboardNavbar>

      <div class="flex-1 overflow-y-auto">
        <slot />
      </div>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

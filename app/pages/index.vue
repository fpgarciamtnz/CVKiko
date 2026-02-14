<script setup lang="ts">
import { BRICK_TYPE_CONFIG, BRICK_TYPES } from '~/utils/brick-types'

const { bricks, fetchBricks } = useBricks()
const { settings, fetchSettings } = useSettings()
const { savedCVs, fetchCVs } = useSavedCVs()
const schedule = useSchedule()

await Promise.all([
  fetchBricks(),
  fetchSettings(),
  fetchCVs(),
  schedule.fetchSchedule(),
  schedule.fetchRequests()
])

const showRequestModal = ref(false)

const stats = computed(() => {
  const counts = BRICK_TYPES.reduce((acc, type) => {
    acc[type] = bricks.value.filter(b => b.type === type).length
    return acc
  }, {} as Record<string, number>)

  return {
    total: bricks.value.length,
    byType: counts
  }
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome{{ settings?.name ? `, ${settings.name}` : '' }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Build customized CVs by selecting the right bricks for each job application.
      </p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <UCard class="text-center">
        <div class="text-3xl font-bold text-primary">
          {{ stats.total }}
        </div>
        <div class="text-sm text-gray-500">
          Total Bricks
        </div>
      </UCard>
      <UCard
        v-for="type in BRICK_TYPES"
        :key="type"
        class="text-center"
      >
        <div class="flex items-center justify-center gap-2 mb-1">
          <UIcon
            :name="BRICK_TYPE_CONFIG[type].icon"
            class="w-5 h-5"
            :class="`text-${BRICK_TYPE_CONFIG[type].color}-500`"
          />
          <span class="text-2xl font-bold">{{ stats.byType[type] }}</span>
        </div>
        <div class="text-xs text-gray-500">
          {{ BRICK_TYPE_CONFIG[type].pluralLabel }}
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-layers"
              class="w-5 h-5 text-primary"
            />
            <h2 class="font-semibold">
              Manage Bricks
            </h2>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Add your work experiences, education, projects, and skills as reusable bricks.
        </p>
        <UButton
          to="/bricks"
          variant="soft"
          block
        >
          Go to Bricks
        </UButton>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-file-text"
              class="w-5 h-5 text-primary"
            />
            <h2 class="font-semibold">
              Build CV
            </h2>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Select bricks and use AI to create a customized CV for your target job.
        </p>
        <UButton
          to="/builder"
          variant="soft"
          block
        >
          Start Building
        </UButton>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-settings"
              class="w-5 h-5 text-primary"
            />
            <h2 class="font-semibold">
              Personal Info
            </h2>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Set up your contact information, summary, and social links.
        </p>
        <UButton
          to="/settings"
          variant="soft"
          block
        >
          Edit Settings
        </UButton>
      </UCard>
    </div>

    <!-- Ticket Scheduling -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Ticket Availability
        </h2>
        <div class="flex gap-2">
          <UButton
            to="/request"
            variant="soft"
            icon="i-lucide-calendar-plus"
          >
            Request Ticket
          </UButton>
          <UButton
            to="/admin"
            variant="ghost"
            icon="i-lucide-shield"
            color="neutral"
          >
            Admin
          </UButton>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <CalendarView />

        <UCard>
          <template #header>
            <h3 class="font-semibold text-sm">
              Legend
            </h3>
          </template>
          <div class="space-y-3 text-sm">
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-full bg-red-500 shrink-0" />
              <span>Owner using (full day — all 3 slots blocked)</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-full bg-red-200 dark:bg-red-900/40 shrink-0" />
              <span>Owner using (partial day — some slots available)</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-full ring-2 ring-yellow-400 bg-transparent shrink-0" />
              <span>Pending request</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-full ring-2 ring-blue-400 bg-transparent shrink-0" />
              <span>Approved request</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-4 h-4 rounded-full ring-2 ring-green-400 bg-transparent shrink-0" />
              <span>Today</span>
            </div>
            <UDivider />
            <p class="text-gray-500 dark:text-gray-400 text-xs">
              Click a date on the calendar to see morning, midday, and evening availability.
            </p>
          </div>
        </UCard>
      </div>
    </div>

    <RequestModal
      v-model="showRequestModal"
      @submitted="schedule.fetchRequests()"
    />

    <!-- Recent Bricks -->
    <div
      v-if="bricks.length > 0"
      class="mt-8"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Recent Bricks
        </h2>
        <UButton
          to="/bricks"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
        >
          View all
        </UButton>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BricksBrickCard
          v-for="brick in bricks.slice(0, 6)"
          :key="brick.id"
          :brick="brick"
          @edit="navigateTo(`/bricks?edit=${brick.id}`)"
        />
      </div>
    </div>

    <!-- Shared CVs -->
    <div
      v-if="savedCVs.length > 0"
      class="mt-8"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Shared CVs
        </h2>
        <UButton
          to="/builder"
          variant="link"
          trailing-icon="i-lucide-plus"
        >
          Create new
        </UButton>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard
          v-for="cv in savedCVs"
          :key="cv.id"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ cv.name }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                /cv/{{ cv.slug }}
              </p>
            </div>
            <UButton
              icon="i-lucide-external-link"
              variant="ghost"
              color="neutral"
              size="xs"
              :to="`/cv/${cv.slug}`"
              target="_blank"
            />
          </div>
        </UCard>
      </div>
    </div>

    <!-- Empty State -->
    <UCard
      v-if="bricks.length === 0 && savedCVs.length === 0"
      class="mt-8 text-center py-12"
    >
      <UIcon
        name="i-lucide-inbox"
        class="w-16 h-16 mx-auto mb-4 text-gray-400"
      />
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No bricks yet
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Start by adding your work experience, education, and projects.
      </p>
      <UButton
        to="/bricks"
        icon="i-lucide-plus"
      >
        Add Your First Brick
      </UButton>
    </UCard>
  </UContainer>
</template>

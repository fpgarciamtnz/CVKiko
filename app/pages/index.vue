<script setup lang="ts">
import { BRICK_TYPE_CONFIG, BRICK_TYPES } from '~/utils/brick-types'

const { bricks, fetchBricks } = useBricks()
const { settings, fetchSettings } = useSettings()
const { savedCVs, fetchCVs } = useSavedCVs()
await Promise.all([
  fetchBricks(),
  fetchSettings(),
  fetchCVs()
])

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
        Bienvenido{{ settings?.name ? `, ${settings.name}` : '' }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Crea CVs personalizados seleccionando los bloques adecuados para cada candidatura.
      </p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <UCard class="text-center">
        <div class="text-3xl font-bold text-primary">
          {{ stats.total }}
        </div>
        <div class="text-sm text-gray-500">
          Bloques Totales
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
              Gestionar Bloques
            </h2>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Agrega experiencias, educacion, proyectos y habilidades como bloques reutilizables.
        </p>
        <UButton
          to="/bricks"
          variant="soft"
          block
        >
          Ir a Bloques
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
              Construir CV
            </h2>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Selecciona bloques y usa IA para crear un CV personalizado para tu puesto objetivo.
        </p>
        <UButton
          to="/builder"
          variant="soft"
          block
        >
          Empezar
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
              Informacion Personal
            </h2>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Configura tu informacion de contacto, resumen y enlaces sociales.
        </p>
        <UButton
          to="/settings"
          variant="soft"
          block
        >
          Editar Configuracion
        </UButton>
      </UCard>
    </div>

    <!-- Recent Bricks -->
    <div
      v-if="bricks.length > 0"
      class="mt-8"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Bloques Recientes
        </h2>
        <UButton
          to="/bricks"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
        >
          Ver todos
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
          CVs Compartidos
        </h2>
        <UButton
          to="/builder"
          variant="link"
          trailing-icon="i-lucide-plus"
        >
          Crear nuevo
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
        Aun no hay bloques
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Empieza agregando experiencia laboral, educacion y proyectos.
      </p>
      <UButton
        to="/bricks"
        icon="i-lucide-plus"
      >
        Agrega tu Primer Bloque
      </UButton>
    </UCard>
  </UContainer>
</template>

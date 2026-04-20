<script setup lang="ts">
const { settings, fetchSettings, updateSettings, loading } = useSettings()
const toast = useToast()

await fetchSettings()

const form = reactive({
  name: settings.value?.name || '',
  email: settings.value?.email || '',
  phone: settings.value?.phone || '',
  location: settings.value?.location || '',
  summary: settings.value?.summary || '',
  linkedIn: settings.value?.linkedIn || '',
  github: settings.value?.github || '',
  website: settings.value?.website || '',
  orcid: settings.value?.orcid || '',
  pronouns: settings.value?.pronouns || '',
  academicTitle: settings.value?.academicTitle || '',
  department: settings.value?.department || '',
  institution: settings.value?.institution || ''
})

// Watch for settings changes and update form
watch(settings, (newSettings) => {
  if (newSettings) {
    form.name = newSettings.name || ''
    form.email = newSettings.email || ''
    form.phone = newSettings.phone || ''
    form.location = newSettings.location || ''
    form.summary = newSettings.summary || ''
    form.linkedIn = newSettings.linkedIn || ''
    form.github = newSettings.github || ''
    form.website = newSettings.website || ''
    form.orcid = newSettings.orcid || ''
    form.pronouns = newSettings.pronouns || ''
    form.academicTitle = newSettings.academicTitle || ''
    form.department = newSettings.department || ''
    form.institution = newSettings.institution || ''
  }
})

async function handleSubmit() {
  try {
    await updateSettings(form)
    toast.add({ title: 'Configuracion guardada', color: 'success' })
  } catch {
    toast.add({ title: 'No se pudo guardar la configuracion', color: 'error' })
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Configuracion
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Tu informacion personal para los encabezados del CV
      </p>
    </div>

    <UCard>
      <form
        class="space-y-6"
        @submit.prevent="handleSubmit"
      >
        <!-- Personal Info -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            Informacion Personal
          </h3>
          <div class="space-y-4">
            <UFormField
              label="Nombre Completo"
              required
            >
              <UInput
                v-model="form.name"
                placeholder="John Doe"
                required
              />
            </UFormField>

            <UFormField label="Pronombres">
              <UInput
                v-model="form.pronouns"
                placeholder="ej. el, ella, elle"
              />
            </UFormField>

            <div class="grid md:grid-cols-2 gap-4">
              <UFormField label="Correo">
                <UInput
                  v-model="form.email"
                  type="email"
                  placeholder="john@example.com"
                />
              </UFormField>
              <UFormField label="Telefono">
                <UInput
                  v-model="form.phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                />
              </UFormField>
            </div>

            <UFormField label="Ubicacion">
              <UInput
                v-model="form.location"
                placeholder="Madrid, Espana"
              />
            </UFormField>
          </div>
        </div>

        <!-- Summary -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            Resumen Profesional
          </h3>
          <UFormField label="Resumen">
            <UTextarea
              v-model="form.summary"
              :rows="4"
              placeholder="Un breve resumen de tu trayectoria profesional y objetivos..."
            />
          </UFormField>
        </div>

        <!-- Academic Profile -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            Perfil Academico
          </h3>
          <p class="text-sm text-gray-500 mb-4">
            Estos campos se muestran al usar el modo Academico
          </p>
          <div class="space-y-4">
            <UFormField
              label="Titulo Academico"
              hint="ej. Profesor Asociado, Investigador Postdoctoral"
            >
              <UInput
                v-model="form.academicTitle"
                placeholder="ej. Profesor Asistente"
                icon="i-lucide-graduation-cap"
              />
            </UFormField>

            <div class="grid md:grid-cols-2 gap-4">
              <UFormField label="Departamento">
                <UInput
                  v-model="form.department"
                  placeholder="ej. Ingenieria Informatica"
                />
              </UFormField>
              <UFormField label="Institucion">
                <UInput
                  v-model="form.institution"
                  placeholder="ej. Universidad de Barcelona"
                />
              </UFormField>
            </div>

            <UFormField
              label="ORCID"
              hint="Tu identificador ORCID (solo numeros)"
            >
              <UInput
                v-model="form.orcid"
                placeholder="ej. 0000-0002-1234-5678"
                icon="i-lucide-fingerprint"
              />
            </UFormField>
          </div>
        </div>

        <!-- Social Links -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            Enlaces Sociales
          </h3>
          <div class="space-y-4">
            <UFormField label="LinkedIn">
              <UInput
                v-model="form.linkedIn"
                type="url"
                placeholder="https://linkedin.com/in/johndoe"
              >
                <template #leading>
                  <UIcon
                    name="i-simple-icons-linkedin"
                    class="w-4 h-4"
                  />
                </template>
              </UInput>
            </UFormField>

            <UFormField label="GitHub">
              <UInput
                v-model="form.github"
                type="url"
                placeholder="https://github.com/johndoe"
              >
                <template #leading>
                  <UIcon
                    name="i-simple-icons-github"
                    class="w-4 h-4"
                  />
                </template>
              </UInput>
            </UFormField>

            <UFormField label="Sitio Web">
              <UInput
                v-model="form.website"
                type="url"
                placeholder="https://johndoe.com"
              >
                <template #leading>
                  <UIcon
                    name="i-lucide-globe"
                    class="w-4 h-4"
                  />
                </template>
              </UInput>
            </UFormField>
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <UButton
            type="submit"
            :loading="loading"
          >
            Guardar Configuracion
          </UButton>
        </div>
      </form>
    </UCard>
  </UContainer>
</template>

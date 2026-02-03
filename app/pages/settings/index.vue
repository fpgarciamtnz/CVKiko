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
  website: settings.value?.website || ''
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
  }
})

async function handleSubmit() {
  try {
    await updateSettings(form)
    toast.add({ title: 'Settings saved', color: 'success' })
  } catch {
    toast.add({ title: 'Failed to save settings', color: 'error' })
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Your personal information for CV headers
      </p>
    </div>

    <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Personal Info -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Personal Information</h3>
          <div class="space-y-4">
            <UFormField label="Full Name" required>
              <UInput
                v-model="form.name"
                placeholder="John Doe"
                required
              />
            </UFormField>

            <div class="grid md:grid-cols-2 gap-4">
              <UFormField label="Email">
                <UInput
                  v-model="form.email"
                  type="email"
                  placeholder="john@example.com"
                />
              </UFormField>
              <UFormField label="Phone">
                <UInput
                  v-model="form.phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                />
              </UFormField>
            </div>

            <UFormField label="Location">
              <UInput
                v-model="form.location"
                placeholder="San Francisco, CA"
              />
            </UFormField>
          </div>
        </div>

        <!-- Summary -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Professional Summary</h3>
          <UFormField label="Summary">
            <UTextarea
              v-model="form.summary"
              :rows="4"
              placeholder="A brief summary of your professional background and career goals..."
            />
          </UFormField>
        </div>

        <!-- Social Links -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Social Links</h3>
          <div class="space-y-4">
            <UFormField label="LinkedIn">
              <UInput
                v-model="form.linkedIn"
                type="url"
                placeholder="https://linkedin.com/in/johndoe"
              >
                <template #leading>
                  <UIcon name="i-simple-icons-linkedin" class="w-4 h-4" />
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
                  <UIcon name="i-simple-icons-github" class="w-4 h-4" />
                </template>
              </UInput>
            </UFormField>

            <UFormField label="Website">
              <UInput
                v-model="form.website"
                type="url"
                placeholder="https://johndoe.com"
              >
                <template #leading>
                  <UIcon name="i-lucide-globe" class="w-4 h-4" />
                </template>
              </UInput>
            </UFormField>
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <UButton type="submit" :loading="loading">
            Save Settings
          </UButton>
        </div>
      </form>
    </UCard>
  </UContainer>
</template>

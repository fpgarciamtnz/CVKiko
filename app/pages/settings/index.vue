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
      <form
        class="space-y-6"
        @submit.prevent="handleSubmit"
      >
        <!-- Personal Info -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            Personal Information
          </h3>
          <div class="space-y-4">
            <UFormField
              label="Full Name"
              required
            >
              <UInput
                v-model="form.name"
                placeholder="John Doe"
                required
              />
            </UFormField>

            <UFormField label="Pronouns">
              <UInput
                v-model="form.pronouns"
                placeholder="e.g., he/him, she/her, they/them"
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
          <h3 class="text-lg font-semibold mb-4">
            Professional Summary
          </h3>
          <UFormField label="Summary">
            <UTextarea
              v-model="form.summary"
              :rows="4"
              placeholder="A brief summary of your professional background and career goals..."
            />
          </UFormField>
        </div>

        <!-- Academic Profile -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            Academic Profile
          </h3>
          <p class="text-sm text-gray-500 mb-4">
            These fields are shown when using Academic CV mode
          </p>
          <div class="space-y-4">
            <UFormField
              label="Academic Title"
              hint="e.g., Associate Professor, Postdoctoral Researcher"
            >
              <UInput
                v-model="form.academicTitle"
                placeholder="e.g., Assistant Professor"
                icon="i-lucide-graduation-cap"
              />
            </UFormField>

            <div class="grid md:grid-cols-2 gap-4">
              <UFormField label="Department">
                <UInput
                  v-model="form.department"
                  placeholder="e.g., Computer Science"
                />
              </UFormField>
              <UFormField label="Institution">
                <UInput
                  v-model="form.institution"
                  placeholder="e.g., Stanford University"
                />
              </UFormField>
            </div>

            <UFormField
              label="ORCID"
              hint="Your ORCID identifier (numbers only)"
            >
              <UInput
                v-model="form.orcid"
                placeholder="e.g., 0000-0002-1234-5678"
                icon="i-lucide-fingerprint"
              />
            </UFormField>
          </div>
        </div>

        <!-- Social Links -->
        <div>
          <h3 class="text-lg font-semibold mb-4">
            Social Links
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

            <UFormField label="Website">
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
            Save Settings
          </UButton>
        </div>
      </form>
    </UCard>
  </UContainer>
</template>

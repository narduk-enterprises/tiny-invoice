<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useSeo({
  robots: 'noindex',
  title: 'Settings — TinyInvoice',
  description: 'Update your business details.',
})
useWebPageSchema({ name: 'Settings — TinyInvoice', description: 'Account and business settings.' })

const { user } = useAuth()
const { updateSettings } = useSettings()

const formState = ref({
  businessName: '',
  businessAddress: '',
})

watch(
  user,
  (u) => {
    if (u) {
      formState.value.businessName = (u.businessName as string) ?? ''
      formState.value.businessAddress = (u.businessAddress as string) ?? ''
    }
  },
  { immediate: true },
)

const saving = ref(false)
const error = ref('')
const success = ref(false)

async function submit() {
  error.value = ''
  success.value = false
  saving.value = true
  try {
    await updateSettings({
      businessName: formState.value.businessName || null,
      businessAddress: formState.value.businessAddress || null,
    })
    success.value = true
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err.data?.message ?? err.message ?? 'Failed to save'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UPage>
    <UPageHeader title="Settings" description="Update your business details for invoices." />
    <UCard class="card-base max-w-lg">
      <div class="p-5">
        <UForm :state="formState" @submit="submit">
          <div class="form-section">
            <UFormField label="Business name (optional)" name="businessName">
              <UInput
                v-model="formState.businessName"
                placeholder="My Freelance Co"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Business address (optional)" name="businessAddress">
              <UTextarea
                v-model="formState.businessAddress"
                placeholder="123 Main St, City, ST 12345"
                :rows="3"
                class="w-full min-h-[5rem]"
              />
            </UFormField>
          </div>
          <UAlert v-if="error" color="error" :title="error" class="text-sm" />
          <UAlert v-if="success" color="success" title="Settings saved." class="text-sm" />
          <div class="form-actions">
            <UButton type="submit" :loading="saving">Save</UButton>
          </div>
        </UForm>
      </div>
    </UCard>
  </UPage>
</template>

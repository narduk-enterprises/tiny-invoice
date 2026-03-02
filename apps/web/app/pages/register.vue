<script setup lang="ts">
import { z } from 'zod'

useSeo({
  title: 'Register — TinyInvoice',
  description: 'Create your TinyInvoice account.',
})
useWebPageSchema({ name: 'Register — TinyInvoice', description: 'Create your account.' })

const { register } = useAuth()
const router = useRouter()

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'At least 8 characters'),
  businessName: z.string().optional(),
  businessAddress: z.string().optional(),
})

const state = ref({
  email: '',
  name: '',
  password: '',
  businessName: '',
  businessAddress: '',
})

const error = ref('')
const pending = ref(false)

async function onSubmit() {
  error.value = ''
  pending.value = true
  try {
    await register({
      email: state.value.email,
      name: state.value.name,
      password: state.value.password,
      businessName: state.value.businessName || undefined,
      businessAddress: state.value.businessAddress || undefined,
    })
    await router.push('/dashboard')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err.data?.message ?? err.message ?? 'Registration failed'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UPage>
    <UPageHeader title="Create account" description="Register for TinyInvoice." />
    <UCard class="max-w-md mx-auto card-base">
      <UForm :schema="schema" :state="state" @submit="onSubmit">
        <div class="space-y-4">
          <UFormField label="Email" name="email" required>
            <UInput v-model="state.email" type="email" placeholder="you@example.com" />
          </UFormField>
          <UFormField label="Your name" name="name" required>
            <UInput v-model="state.name" placeholder="Jane Doe" />
          </UFormField>
          <UFormField label="Password" name="password" required>
            <UInput v-model="state.password" type="password" placeholder="••••••••" />
          </UFormField>
          <UFormField label="Business name (optional)" name="businessName">
            <UInput v-model="state.businessName" placeholder="My Freelance Co" />
          </UFormField>
          <UFormField label="Business address (optional)" name="businessAddress">
            <UTextarea v-model="state.businessAddress" placeholder="123 Main St, City, ST 12345" :rows="2" />
          </UFormField>
          <UAlert v-if="error" color="error" :title="error" class="text-sm" />
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <UButton type="submit" :loading="pending" block>Register</UButton>
            <p class="text-sm text-muted text-center sm:text-left">
              Already have an account?
              <ULink to="/login" class="text-primary font-medium">Log in</ULink>
            </p>
          </div>
        </div>
      </UForm>
    </UCard>
  </UPage>
</template>

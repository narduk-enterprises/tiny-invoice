<script setup lang="ts">
import { z } from 'zod'

useSeo({
  title: 'Register — TinyInvoice',
  description: 'Create your TinyInvoice account.',
})
useWebPageSchema({ name: 'Register — TinyInvoice', description: 'Create your account.' })

const route = useRoute()
const { register } = useAuth()
const router = useRouter()
const toast = useToast()

onMounted(() => {
  nextTick(() => {
    document.querySelector<HTMLInputElement>('[data-autofocus]')?.focus()
  })
})

function isValidRedirect(path: unknown): path is string {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return false
  return true
}

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
    toast.add({ title: 'Account created', color: 'success' })
    const redirect = route.query.redirect
    const target = isValidRedirect(redirect) ? redirect : '/dashboard'
    await router.push(target)
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
    <UPageHeader title="Create account" description="Register for TinyInvoice." class="animate-count-in" />
    <UCard class="max-w-md mx-auto glass-card shadow-elevated animate-count-in" style="animation-delay: 0.05s">
      <div class="p-5">
        <UForm :schema="schema" :state="state" @submit="onSubmit">
          <div class="form-section">
            <UFormField label="Email" name="email" required>
              <UInput v-model="state.email" type="email" placeholder="you@example.com" class="w-full" data-autofocus />
            </UFormField>
            <UFormField label="Your name" name="name" required>
              <UInput v-model="state.name" placeholder="Jane Doe" class="w-full" />
            </UFormField>
            <UFormField label="Password" name="password" required>
              <UInput v-model="state.password" type="password" placeholder="••••••••" class="w-full" />
            </UFormField>
            <UFormField label="Business name (optional)" name="businessName">
              <UInput v-model="state.businessName" placeholder="My Freelance Co" class="w-full" />
            </UFormField>
            <UFormField label="Business address (optional)" name="businessAddress">
              <UTextarea
                v-model="state.businessAddress"
                placeholder="123 Main St, City, ST 12345"
                :rows="3"
                class="w-full min-h-[5rem]"
              />
            </UFormField>
          </div>
          <UAlert v-if="error" color="error" :title="error" class="text-sm" />
          <div class="form-actions">
            <UButton type="submit" :loading="pending" block>Register</UButton>
          </div>
          <p class="text-sm text-muted text-center sm:text-left pt-2">
            Already have an account?
            <ULink to="/login" class="text-primary font-medium">Log in</ULink>
          </p>
        </UForm>
      </div>
    </UCard>
  </UPage>
</template>

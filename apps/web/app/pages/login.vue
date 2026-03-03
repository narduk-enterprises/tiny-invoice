<script setup lang="ts">
import { z } from 'zod'

useSeo({
  title: 'Log in — TinyInvoice',
  description: 'Log in to your TinyInvoice account.',
})
useWebPageSchema({ name: 'Log in — TinyInvoice', description: 'Log in to your account.' })

const route = useRoute()
const { login } = useAuth()
const router = useRouter()
const toast = useToast()

// Pre-fill demo credentials when arriving via "Try demo" (e.g. /login?demo=1)
onMounted(() => {
  if (route.query.demo) {
    fillDemoCredentials()
  }
  nextTick(() => {
    const el = document.querySelector<HTMLInputElement>('[data-autofocus]')
    el?.focus()
  })
})

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

const state = ref({
  email: '',
  password: '',
})

const error = ref('')
const pending = ref(false)

function isValidRedirect(path: unknown): path is string {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return false
  return true
}

async function onSubmit() {
  error.value = ''
  pending.value = true
  try {
    await login(state.value.email, state.value.password)
    toast.add({ title: 'Logged in', color: 'success' })
    const redirect = route.query.redirect
    const target = isValidRedirect(redirect) ? redirect : '/dashboard'
    await router.push(target)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err.data?.message ?? err.message ?? 'Login failed'
  } finally {
    pending.value = false
  }
}

function fillDemoCredentials() {
  state.value = {
    email: 'demo@tinyinvoice.com',
    password: 'demo1234',
  }
}
</script>

<template>
  <UPage>
    <UPageHeader title="Log in" description="Sign in to your account." class="animate-count-in" />
    <UCard class="max-w-md mx-auto glass-card shadow-elevated animate-count-in" style="animation-delay: 0.05s">
      <div class="p-5">
        <p class="text-sm text-muted mb-4">
          Demo: demo@tinyinvoice.com / demo1234
          <UButton variant="link" color="primary" size="xs" class="ml-1" @click="fillDemoCredentials">Fill</UButton>
        </p>
        <UForm :schema="schema" :state="state" @submit="onSubmit">
          <div class="form-section">
            <UFormField label="Email" name="email" required>
              <UInput v-model="state.email" type="email" placeholder="you@example.com" class="w-full" data-autofocus />
            </UFormField>
            <UFormField label="Password" name="password" required>
              <UInput v-model="state.password" type="password" placeholder="••••••••" class="w-full" />
            </UFormField>
          </div>
          <UAlert v-if="error" color="error" :title="error" class="text-sm" />
          <div class="form-actions">
            <UButton type="submit" :loading="pending" block>Log in</UButton>
          </div>
          <p class="text-sm text-muted text-center sm:text-left pt-2">
            Don't have an account?
            <ULink to="/register" class="text-primary font-medium">Register</ULink>
          </p>
        </UForm>
      </div>
    </UCard>
  </UPage>
</template>

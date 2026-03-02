<script setup lang="ts">
import { z } from 'zod'

useSeo({
  title: 'Log in — TinyInvoice',
  description: 'Log in to your TinyInvoice account.',
})
useWebPageSchema({ name: 'Log in — TinyInvoice', description: 'Log in to your account.' })

const { login } = useAuth()
const router = useRouter()

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

async function onSubmit() {
  error.value = ''
  pending.value = true
  try {
    await login(state.value.email, state.value.password)
    await router.push('/dashboard')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err.data?.message ?? err.message ?? 'Login failed'
  } finally {
    pending.value = false
  }
}

function fillDemoCredentials() {
  state.value.email = 'demo@tinyinvoice.com'
  state.value.password = 'demo1234'
}
</script>

<template>
  <UPage>
    <UPageHeader title="Log in" description="Sign in to your account." />
    <UCard class="max-w-md mx-auto card-base">
      <UAlert
        color="primary"
        variant="soft"
        title="Try the demo"
        description="Log in with demo@tinyinvoice.com / demo1234 to explore sample clients, invoices (draft, sent, paid, overdue), and settings."
        class="mb-4"
      />
      <UForm :schema="schema" :state="state" @submit="onSubmit">
        <div class="space-y-4">
          <UFormField label="Email" name="email" required>
            <UInput v-model="state.email" type="email" placeholder="you@example.com" />
          </UFormField>
          <UFormField label="Password" name="password" required>
            <UInput v-model="state.password" type="password" placeholder="••••••••" />
          </UFormField>
          <UAlert v-if="error" color="error" :title="error" class="text-sm" />
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <UButton type="submit" :loading="pending" block>Log in</UButton>
            <UButton
              variant="outline"
              :disabled="pending"
              @click="fillDemoCredentials"
            >
              Fill demo credentials
            </UButton>
          </div>
          <p class="text-sm text-muted text-center sm:text-left">
            Don't have an account?
            <ULink to="/register" class="text-primary font-medium">Register</ULink>
          </p>
        </div>
      </UForm>
    </UCard>
  </UPage>
</template>

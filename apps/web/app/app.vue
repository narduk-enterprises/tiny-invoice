<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const config = useRuntimeConfig().public
const appName = config.appName || 'TinyInvoice'
const { user, fetchUser, logout: doLogout } = useAuth()

async function logout() {
  await doLogout()
  await navigateTo('/')
}

onMounted(() => {
  fetchUser()
})

const colorModeIcon = computed(() => {
  if (colorMode.preference === 'system') return 'i-lucide-monitor'
  return colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'
})

function cycleColorMode() {
  const modes = ['system', 'light', 'dark'] as const
  const idx = modes.indexOf(colorMode.preference as typeof modes[number])
  colorMode.preference = modes[(idx + 1) % modes.length]!
}

const navItems = computed(() => {
  const base = [{ label: 'Home', to: '/', icon: 'i-lucide-home' }]
  if (user.value) {
    return [
      ...base,
      { label: 'Dashboard', to: '/dashboard', icon: 'i-lucide-layout-dashboard' },
      { label: 'Clients', to: '/clients', icon: 'i-lucide-users' },
      { label: 'Invoices', to: '/invoices', icon: 'i-lucide-file-text' },
      { label: 'Settings', to: '/settings', icon: 'i-lucide-settings' },
    ]
  }
  return base
})

const mobileMenuOpen = ref(false)

watch(route, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <UApp>
    <ULink to="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg">Skip to content</ULink>
    <div class="app-shell min-h-screen flex flex-col">
      <div class="sticky top-0 z-50 border-b border-default bg-default/80 backdrop-blur-xl">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2.5 group">
            <div class="size-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
              TI
            </div>
            <span class="font-display font-semibold text-lg hidden sm:block">{{ appName }}</span>
          </NuxtLink>

          <div class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="route.path === item.to
                ? 'text-primary bg-primary/10'
                : 'text-muted hover:text-default hover:bg-elevated'"
            >
              {{ item.label }}
            </NuxtLink>
          </div>

          <div class="flex items-center gap-2">
            <template v-if="user">
              <UButton to="/settings" variant="ghost" color="neutral" icon="i-lucide-user" />
              <UButton variant="outline" color="neutral" class="hidden md:inline-flex" @click="logout">Logout</UButton>
            </template>
            <template v-else>
              <UButton to="/login" variant="ghost" color="neutral">Login</UButton>
              <UButton to="/register" color="primary">Register</UButton>
            </template>
            <UButton
              :icon="colorModeIcon"
              variant="ghost"
              color="neutral"
              aria-label="Toggle color mode"
              @click="cycleColorMode"
            />
            <UButton color="neutral" variant="ghost" class="md:hidden p-2 rounded-lg hover:bg-elevated" aria-label="Toggle menu" @click="mobileMenuOpen = !mobileMenuOpen">
              <UIcon :name="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-5" />
            </UButton>
          </div>
        </div>

        <Transition name="slide-down">
          <div v-if="mobileMenuOpen" class="md:hidden border-t border-default px-4 py-3 space-y-1">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
              :class="route.path === item.to ? 'text-primary bg-primary/10' : 'text-muted hover:text-default hover:bg-elevated'"
            >
              <UIcon :name="item.icon" class="size-4" />
              {{ item.label }}
            </NuxtLink>
            <div v-if="user" class="pt-2 border-t border-default">
              <UButton variant="outline" color="neutral" block @click="logout">Logout</UButton>
            </div>
          </div>
        </Transition>
      </div>

      <div id="main-content" class="flex-1">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NuxtLayout>
            <NuxtPage />
          </NuxtLayout>
        </div>
      </div>

      <div class="border-t border-default py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-center text-sm text-muted">
            {{ appName }} &middot; Nuxt UI 4 &middot; Cloudflare Workers &middot; <NuxtTime :datetime="new Date()" year="numeric" />
          </p>
        </div>
      </div>
    </div>
  </UApp>
</template>

<style>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

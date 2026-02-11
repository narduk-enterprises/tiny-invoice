<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val: boolean) => { colorMode.preference = val ? 'dark' : 'light' }
})

const navItems = [
  { label: 'Dashboard', to: '/', icon: 'i-heroicons-chart-bar-square' },
  { label: 'Opportunities', to: '/opportunities', icon: 'i-heroicons-bolt' },
  { label: 'Scan Logs', to: '/scan-logs', icon: 'i-heroicons-document-magnifying-glass' },
  { label: 'Trades', to: '/trades', icon: 'i-heroicons-arrows-right-left' },
  { label: 'Settings', to: '/settings', icon: 'i-heroicons-cog-6-tooth' },
]

const mobileMenuOpen = ref(false)

watch(route, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <UApp>
    <div class="app-shell">
      <!-- Header -->
      <header class="app-header">
        <div class="header-inner">
          <NuxtLink to="/" class="header-brand">
            <div class="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span class="brand-text">Polymarket Arb</span>
            <span class="brand-tag">BOT</span>
          </NuxtLink>

          <!-- Desktop nav -->
          <nav class="header-nav desktop-nav">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="nav-link"
              :class="{ 'nav-link--active': route.path === item.to }"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>

          <div class="header-actions">
            <USwitch
              v-model="isDark"
              on-icon="i-heroicons-moon"
              off-icon="i-heroicons-sun"
              size="lg"
            />

            <!-- Mobile hamburger -->
            <button class="mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <template v-if="!mobileMenuOpen">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </template>
                <template v-else>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </template>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile nav -->
        <Transition name="slide-down">
          <nav v-if="mobileMenuOpen" class="mobile-nav">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="mobile-nav-link"
              :class="{ 'nav-link--active': route.path === item.to }"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </Transition>
      </header>

      <!-- Main -->
      <main class="app-main">
        <NuxtPage />
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <p>Polymarket Arb Bot &middot; Dry-run Mode &middot; {{ new Date().getFullYear() }}</p>
      </footer>
    </div>
  </UApp>
</template>

<style>
/* ─── Variables ─── */
:root {
  --bg-primary: #0a0e17;
  --bg-secondary: #111827;
  --bg-card: #1a2035;
  --bg-card-hover: #1e2640;
  --border-color: rgba(99, 102, 241, 0.15);
  --border-accent: rgba(99, 102, 241, 0.4);
  --text-primary: #f0f0f5;
  --text-secondary: #94a3b5;
  --text-muted: #6b7280;
  --accent: #6366f1;
  --accent-light: #818cf8;
  --green: #10b981;
  --green-bg: rgba(16, 185, 129, 0.1);
  --red: #ef4444;
  --red-bg: rgba(239, 68, 68, 0.1);
  --yellow: #f59e0b;
  --yellow-bg: rgba(245, 158, 11, 0.1);
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.light-mode {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --bg-card-hover: #f1f5f9;
  --border-color: rgba(99, 102, 241, 0.1);
  --border-accent: rgba(99, 102, 241, 0.3);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* ─── Global ─── */
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

/* ─── Shell ─── */
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 14, 23, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-color);
}

.light-mode .app-header {
  background: rgba(255, 255, 255, 0.85);
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--accent), #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-text {
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
}

.brand-tag {
  font-size: 0.65rem;
  font-weight: 600;
  background: var(--accent);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.header-nav {
  display: flex;
  gap: 0.25rem;
}

.nav-link {
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  transition: var(--transition);
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-card);
}

.nav-link--active {
  color: var(--accent-light) !important;
  background: rgba(99, 102, 241, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
}

.mobile-nav {
  display: none;
  padding: 0.5rem 1.5rem 1rem;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-nav-link {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  transition: var(--transition);
}

.mobile-nav-link:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .desktop-nav { display: none; }
  .mobile-toggle { display: block; }
  .mobile-nav { display: flex; }
}

/* ─── Main ─── */
.app-main {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1.5rem;
}

/* ─── Footer ─── */
.app-footer {
  border-top: 1px solid var(--border-color);
  padding: 1.5rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* ─── Transitions ─── */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>

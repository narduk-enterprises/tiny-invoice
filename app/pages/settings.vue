<script setup lang="ts">
useSeoMeta({
  title: 'Settings — Polymarket Arb Bot',
  description: 'Configure the Polymarket arbitrage bot parameters',
})

const { data: config, refresh } = await useFetch('/api/config')
const saving = ref(false)
const saved = ref(false)
const confirmLive = ref(false)

// Local form state
const form = reactive({
  active: false,
  dryRun: true,
  maxBetUsd: 50,
  minSpreadPct: 1.0,
  minConvictionPct: 75,
  minVolume: 50000,
  minLiquidity: 10000,
  maxDailyTrades: 3,
})

// Sync incoming config to form
watch(config, (c) => {
  if (c) {
    form.active = c.active ?? false
    form.dryRun = c.dryRun ?? true
    form.maxBetUsd = c.maxBetUsd ?? 50
    form.minSpreadPct = c.minSpreadPct ?? 1.0
    form.minConvictionPct = c.minConvictionPct ?? 75
    form.minVolume = c.minVolume ?? 50000
    form.minLiquidity = c.minLiquidity ?? 10000
    form.maxDailyTrades = c.maxDailyTrades ?? 3
  }
}, { immediate: true })

const saveConfig = async () => {
  // If switching from dry-run to live, require confirmation
  if (!form.dryRun && config.value?.dryRun && !confirmLive.value) {
    confirmLive.value = true
    return
  }

  saving.value = true
  confirmLive.value = false
  try {
    await $fetch('/api/config', {
      method: 'PUT',
      body: {
        active: form.active,
        dryRun: form.dryRun,
        maxBetUsd: form.maxBetUsd,
        minSpreadPct: form.minSpreadPct,
        minConvictionPct: form.minConvictionPct,
        minVolume: form.minVolume,
        minLiquidity: form.minLiquidity,
        maxDailyTrades: form.maxDailyTrades,
      }
    })
    await refresh()
    saved.value = true
    setTimeout(() => saved.value = false, 2000)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure the arbitrage bot parameters</p>
      </div>
    </div>

    <div class="settings-grid">
      <!-- Bot Active Toggle -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>Bot Active</h3>
          <p class="setting-desc">When active, the bot scans hourly and auto-trades if not in dry-run mode</p>
        </div>
        <div class="setting-control">
          <USwitch v-model="form.active" size="lg" />
          <span class="setting-value" :class="form.active ? 'text-green' : 'text-muted'">
            {{ form.active ? 'Running' : 'Paused' }}
          </span>
        </div>
      </div>

      <!-- Dry Run Toggle -->
      <div class="setting-card" :class="{ 'setting-card--danger': !form.dryRun }">
        <div class="setting-header">
          <h3>Trading Mode</h3>
          <p class="setting-desc">
            <strong>Dry Run:</strong> Scan only, no real trades. <br>
            <strong>Live:</strong> Execute real trades with real money.
          </p>
        </div>
        <div class="setting-control">
          <USwitch v-model="form.dryRun" size="lg" />
          <span class="setting-value" :class="form.dryRun ? 'text-accent' : 'text-red'">
            {{ form.dryRun ? 'Dry Run (Safe)' : '⚠️ LIVE TRADING' }}
          </span>
        </div>
      </div>

      <!-- Max Bet Size -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>Max Bet Size</h3>
          <p class="setting-desc">Maximum USD amount per trade position</p>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <span class="input-prefix">$</span>
            <input
              v-model.number="form.maxBetUsd"
              type="number"
              min="1"
              max="10000"
              step="10"
              class="settings-input"
            />
          </div>
        </div>
      </div>

      <!-- Max Daily Trades -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>Max Daily Trades</h3>
          <p class="setting-desc">Maximum number of trades per 24-hour window. Prevents over-trading.</p>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <input
              v-model.number="form.maxDailyTrades"
              type="number"
              min="1"
              max="20"
              step="1"
              class="settings-input"
            />
            <span class="input-suffix">/ day</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Scanner Settings -->
    <h2 class="section-title">Scanner Filters</h2>
    <p class="section-desc">Controls which markets and opportunities the scanner will consider</p>

    <div class="settings-grid">
      <!-- Min Spread Threshold -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>Min Spread (Arbitrage)</h3>
          <p class="setting-desc">Only flag arbitrage opportunities with a spread above this percentage</p>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <input
              v-model.number="form.minSpreadPct"
              type="number"
              min="0"
              max="50"
              step="0.1"
              class="settings-input"
            />
            <span class="input-suffix">%</span>
          </div>
        </div>
      </div>

      <!-- Min Conviction Threshold -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>Min Conviction (Prob. of Positive Return)</h3>
          <p class="setting-desc">
            Flag high-conviction opportunities when our formula estimates this probability of positive return. Considers market price, volume, liquidity, and time-to-resolution.
          </p>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <input
              v-model.number="form.minConvictionPct"
              type="number"
              min="50"
              max="99"
              step="1"
              class="settings-input"
            />
            <span class="input-suffix">%</span>
          </div>
        </div>
      </div>

      <!-- Min Volume -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>Min Market Volume</h3>
          <p class="setting-desc">Skip markets with total trading volume below this threshold. Higher volume = more efficient pricing.</p>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <span class="input-prefix">$</span>
            <input
              v-model.number="form.minVolume"
              type="number"
              min="0"
              max="10000000"
              step="10000"
              class="settings-input"
            />
          </div>
        </div>
      </div>

      <!-- Min Liquidity -->
      <div class="setting-card">
        <div class="setting-header">
          <h3>Min Market Liquidity</h3>
          <p class="setting-desc">Skip markets with available liquidity below this. Ensures clean entry/exit without slippage.</p>
        </div>
        <div class="setting-control">
          <div class="input-group">
            <span class="input-prefix">$</span>
            <input
              v-model.number="form.minLiquidity"
              type="number"
              min="0"
              max="1000000"
              step="5000"
              class="settings-input"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation warning for live trading -->
    <Transition name="slide-down">
      <div v-if="confirmLive" class="confirm-banner">
        <div class="confirm-icon">⚠️</div>
        <div>
          <strong>Enable live trading?</strong>
          <p>This will execute real trades with real money on Polymarket. Make sure you have sufficient balance and understand the risks.</p>
        </div>
        <div class="confirm-actions">
          <UButton color="error" @click="saveConfig">Yes, enable live trading</UButton>
          <UButton variant="ghost" @click="confirmLive = false; form.dryRun = true">Cancel</UButton>
        </div>
      </div>
    </Transition>

    <!-- Save button -->
    <div class="save-bar">
      <UButton
        color="primary"
        size="lg"
        :loading="saving"
        @click="saveConfig"
      >
        {{ saved ? '✓ Saved!' : 'Save Settings' }}
      </UButton>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
}
.page-subtitle {
  color: var(--text-secondary);
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0.5rem 0 0;
}
.section-desc {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0.15rem 0 0;
}

/* ─── Settings Grid ─── */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
}

.setting-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: var(--transition);
}
.setting-card:hover {
  border-color: var(--border-accent);
}
.setting-card--danger {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.03);
}

.setting-header {
  margin-bottom: 1rem;
}
.setting-header h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}
.setting-desc {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin: 0;
  line-height: 1.5;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.setting-value {
  font-size: 0.8rem;
  font-weight: 600;
}

/* ─── Input ─── */
.input-group {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.input-prefix,
.input-suffix {
  padding: 0.5rem 0.75rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
}
.settings-input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  font-family: 'JetBrains Mono', monospace;
  width: 120px;
  outline: none;
}
.settings-input:focus {
  box-shadow: none;
}

/* ─── Confirm banner ─── */
.confirm-banner {
  background: var(--red-bg);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--radius);
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}
.confirm-icon {
  font-size: 1.5rem;
}
.confirm-banner p {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
}
.confirm-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  width: 100%;
}

/* ─── Save bar ─── */
.save-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
}

/* ─── Helpers ─── */
.text-muted { color: var(--text-muted); }
.text-accent { color: var(--accent-light); }
.text-green { color: var(--green); }
.text-red { color: var(--red); }
</style>

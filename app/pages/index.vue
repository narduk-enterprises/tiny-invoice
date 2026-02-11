<script setup lang="ts">
useSeoMeta({
  title: 'Dashboard — Polymarket Arb Bot',
  description: 'Real-time arbitrage scanner for Polymarket prediction markets',
})

const { data: stats, refresh: refreshStats } = await useFetch('/api/stats')
const { data: portfolio, refresh: refreshPortfolio } = await useFetch('/api/portfolio')
const { data: opps } = await useFetch('/api/opportunities', { query: { limit: 5 } })

// Auto-refresh every 30s
const refreshInterval = ref<any>(null)
const refreshAll = () => { refreshStats(); refreshPortfolio() }
onMounted(() => {
  refreshInterval.value = setInterval(refreshAll, 30_000)
})
onUnmounted(() => clearInterval(refreshInterval.value))

const triggerScan = async () => {
  scanning.value = true
  try {
    scanResult.value = await $fetch('/api/scan', { method: 'POST' })
    await refreshStats()
  } finally {
    scanning.value = false
  }
}

const scanning = ref(false)
const scanResult = ref<any>(null)

const formatPnl = (v: number) => {
  const sign = v >= 0 ? '+' : ''
  return `${sign}$${v.toFixed(2)}`
}

const formatTime = (iso: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="dashboard">
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Polymarket arbitrage scanner overview</p>
      </div>
      <UButton
        color="primary"
        size="lg"
        :loading="scanning"
        @click="triggerScan"
      >
        <template #leading>
          <UIcon name="i-heroicons-play" />
        </template>
        Run Scan
      </UButton>
    </div>

    <!-- Scan result banner -->
    <Transition name="slide-down">
      <div v-if="scanResult" class="scan-banner" :class="scanResult.success ? 'scan-banner--ok' : 'scan-banner--err'">
        <span v-if="scanResult.success">
          ✅ Scanned {{ scanResult.marketsScanned }} markets — found {{ scanResult.opportunitiesFound }} opportunities
          ({{ scanResult.durationMs }}ms)
        </span>
        <span v-else>❌ Scan failed: {{ scanResult.error }}</span>
        <button class="scan-dismiss" @click="scanResult = null">&times;</button>
      </div>
    </Transition>

    <!-- Stats cards -->
    <div class="stats-grid" v-if="stats">
      <!-- Portfolio value card (hero) -->
      <div class="stat-card stat-card--hero">
        <div class="stat-label">
          Portfolio Value
          <span v-if="portfolio?.status === 'connected'" class="status-dot status-dot--live" title="Live from Polymarket"></span>
          <span v-else-if="portfolio?.status === 'disconnected'" class="status-dot status-dot--off" title="Not connected"></span>
          <span v-else class="status-dot status-dot--err" title="API error"></span>
        </div>
        <template v-if="portfolio?.status === 'connected' && portfolio.portfolioValue != null">
          <div class="stat-value stat-value--lg" :class="stats.netPnl >= 0 ? 'stat-value--green' : 'stat-value--red'">
            ${{ portfolio.portfolioValue.toFixed(2) }}
          </div>
          <div class="portfolio-meta">
            <span class="text-muted" v-if="portfolio.positionCount">{{ portfolio.positionCount }} positions</span>
            <span :class="stats.netPnl >= 0 ? 'text-green' : 'text-red'">
              PnL: {{ formatPnl(stats.netPnl) }}
            </span>
            <span class="text-muted" v-if="stats.totalTrades">
              {{ stats.winCount }}W / {{ stats.lossCount }}L
            </span>
          </div>
        </template>
        <template v-else-if="portfolio?.status === 'disconnected'">
          <div class="stat-value stat-value--lg stat-value--muted">Not Connected</div>
          <div class="portfolio-meta">
            <span class="text-muted">{{ portfolio.reason }}</span>
          </div>
        </template>
        <template v-else>
          <div class="stat-value stat-value--lg stat-value--muted">{{ portfolio?.portfolioValue != null ? `$${portfolio.portfolioValue.toFixed(2)}` : 'Unavailable' }}</div>
          <div class="portfolio-meta">
            <span class="text-muted">{{ portfolio?.reason || 'Loading...' }}</span>
          </div>
        </template>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Scans</div>
        <div class="stat-value">{{ stats.totalScans }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Opportunities Found</div>
        <div class="stat-value stat-value--accent">{{ stats.totalOpportunities }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Trades</div>
        <div class="stat-value">{{ stats.totalTrades }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Net P&L</div>
        <div class="stat-value" :class="stats.netPnl >= 0 ? 'stat-value--green' : 'stat-value--red'">
          {{ formatPnl(stats.netPnl) }}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Markets Tracked</div>
        <div class="stat-value">{{ stats.activeMarkets }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Bot Status</div>
        <div class="stat-value">
          <span class="status-badge" :class="stats.config?.active ? 'status-badge--active' : 'status-badge--paused'">
            {{ stats.config?.active ? 'Active' : 'Paused' }}
          </span>
          <span class="status-badge" :class="stats.config?.dryRun ? 'status-badge--dry' : 'status-badge--live'">
            {{ stats.config?.dryRun ? 'Dry Run' : 'Live' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Last scan info -->
    <div class="section-card" v-if="stats?.lastScan">
      <div class="section-header">
        <h2>Last Scan</h2>
        <span class="text-muted">{{ formatTime(stats.lastScan.createdAt) }}</span>
      </div>
      <div class="last-scan-grid">
        <div><span class="text-muted">Markets:</span> {{ stats.lastScan.marketsScanned }}</div>
        <div><span class="text-muted">Opportunities:</span> {{ stats.lastScan.opportunitiesFound }}</div>
        <div><span class="text-muted">Duration:</span> {{ stats.lastScan.durationMs }}ms</div>
        <div v-if="stats.lastScan.error"><span class="text-muted">Error:</span> <span class="text-red">{{ stats.lastScan.error }}</span></div>
      </div>
    </div>

    <!-- Recent opportunities -->
    <div class="section-card">
      <div class="section-header">
        <h2>Recent Opportunities</h2>
        <NuxtLink to="/opportunities" class="section-link">View all →</NuxtLink>
      </div>

      <div v-if="!opps?.length" class="empty-state">
        <p>No arbitrage opportunities detected yet. Run a scan to get started.</p>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Market</th>
              <th>YES</th>
              <th>NO</th>
              <th>Spread</th>
              <th>Profit / $100</th>
              <th>Detected</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="opp in opps" :key="opp.id">
              <td class="cell-question">{{ opp.question }}</td>
              <td>{{ (opp.yesPrice * 100).toFixed(1) }}¢</td>
              <td>{{ (opp.noPrice * 100).toFixed(1) }}¢</td>
              <td class="text-accent">{{ (opp.spread * 100).toFixed(2) }}%</td>
              <td class="text-green">${{ opp.expectedProfit?.toFixed(2) }}</td>
              <td class="text-muted">{{ formatTime(opp.detectedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
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

/* ─── Scan banner ─── */
.scan-banner {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 500;
}
.scan-banner--ok {
  background: var(--green-bg);
  color: var(--green);
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.scan-banner--err {
  background: var(--red-bg);
  color: var(--red);
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.scan-dismiss {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  opacity: 0.6;
}
.scan-dismiss:hover { opacity: 1; }

/* ─── Stats ─── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.25rem;
  transition: var(--transition);
}
.stat-card:hover {
  border-color: var(--border-accent);
  background: var(--bg-card-hover);
}
.stat-card--hero {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.06) 100%);
  border-color: var(--border-accent);
}

.stat-value--lg {
  font-size: 2rem;
}

.portfolio-meta {
  display: flex;
  gap: 1.25rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  flex-wrap: wrap;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stat-value--accent { color: var(--accent-light); }
.stat-value--green { color: var(--green); }
.stat-value--red { color: var(--red); }
.stat-value--muted { color: var(--text-muted); font-size: 1.2rem; }

/* ─── Status badges ─── */
.status-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.03em;
}
.status-badge--active { background: var(--green-bg); color: var(--green); }
.status-badge--paused { background: var(--yellow-bg); color: var(--yellow); }
.status-badge--dry { background: rgba(99, 102, 241, 0.1); color: var(--accent-light); }
.status-badge--live { background: var(--red-bg); color: var(--red); }

/* ─── Status dots (portfolio connection) ─── */
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: 6px;
  vertical-align: middle;
}
.status-dot--live {
  background: var(--green);
  box-shadow: 0 0 4px var(--green);
  animation: pulse-dot 2s ease-in-out infinite;
}
.status-dot--off { background: var(--text-muted); }
.status-dot--err { background: var(--red); }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ─── Section card ─── */
.section-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.section-header h2 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}
.section-link {
  color: var(--accent-light);
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
}
.section-link:hover { text-decoration: underline; }

/* ─── Last scan grid ─── */
.last-scan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  font-size: 0.875rem;
}

/* ─── Data table ─── */
.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.data-table th {
  text-align: left;
  padding: 0.75rem 0.5rem;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border-color);
}
.data-table td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: var(--bg-card-hover); }

.cell-question {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ─── Helpers ─── */
.text-muted { color: var(--text-muted); }
.text-accent { color: var(--accent-light); }
.text-green { color: var(--green); }
.text-red { color: var(--red); }

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>

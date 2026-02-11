<script setup lang="ts">
const route = useRoute()
const id = computed(() => route.params.id as string)

useSeoMeta({
  title: 'Opportunity Detail — Polymarket Arb Bot',
})

const { data: opp, error } = await useFetch(`/api/opportunities/${id.value}`)

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const statusConfig: Record<string, { label: string; icon: string; color: string }> = {
  traded: { label: 'Traded', icon: '✅', color: 'var(--green)' },
  eligible: { label: 'Eligible', icon: '🟢', color: 'var(--green)' },
  cooldown: { label: 'Cooldown', icon: '⏳', color: '#facc15' },
  daily_limit: { label: 'Daily Limit', icon: '🚫', color: '#ef4444' },
  dry_run: { label: 'Dry Run', icon: '🧪', color: 'var(--accent-light)' },
  inactive: { label: 'Inactive', icon: '⏸️', color: 'var(--text-muted)' },
}

const currentStatus = computed(() => {
  if (!opp.value) return statusConfig.inactive
  return statusConfig[opp.value.tradeStatus] || statusConfig.inactive
})

const qualityClass = (score: number) => {
  if (score >= 7) return 'quality-high'
  if (score >= 4) return 'quality-mid'
  return 'quality-low'
}
</script>

<template>
  <div class="detail-page">
    <div class="page-header">
      <UButton variant="ghost" to="/opportunities" class="back-btn">
        <template #leading><UIcon name="i-heroicons-arrow-left" /></template>
        Opportunities
      </UButton>
    </div>

    <div v-if="error" class="error-card">
      <p>{{ error.statusMessage || 'Opportunity not found' }}</p>
      <UButton to="/opportunities">Back to list</UButton>
    </div>

    <template v-else-if="opp">
      <!-- Trade Status Banner -->
      <div class="status-banner" :style="{ borderColor: currentStatus.color + '40' }">
        <span class="status-icon">{{ currentStatus.icon }}</span>
        <div class="status-text">
          <strong :style="{ color: currentStatus.color }">{{ currentStatus.label }}</strong>
          <p>{{ opp.tradeReason }}</p>
        </div>
        <div class="daily-counter">
          <span class="counter-value">{{ opp.dailyTradesUsed }}/{{ opp.dailyTradeLimit }}</span>
          <span class="counter-label">Daily trades</span>
        </div>
      </div>

      <!-- Market Info -->
      <div class="section-card">
        <h2 class="section-title">{{ opp.question }}</h2>
        <div class="meta-row">
          <span class="type-badge" :class="opp.type === 'arbitrage' ? 'type-badge--arb' : 'type-badge--hc'">
            {{ opp.type === 'arbitrage' ? '⚡ Arbitrage' : '🎯 High Conviction' }}
          </span>
          <span class="text-muted">Detected {{ formatDate(opp.detectedAt) }}</span>
          <a
            v-if="opp.slug"
            :href="`https://polymarket.com/event/${opp.slug}`"
            target="_blank"
            class="external-link"
          >
            View on Polymarket ↗
          </a>
        </div>
      </div>

      <!-- Pricing Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">YES Price</div>
          <div class="stat-value font-mono text-green">{{ ((opp.yesPrice || 0) * 100).toFixed(1) }}¢</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">NO Price</div>
          <div class="stat-value font-mono text-red">{{ ((opp.noPrice || 0) * 100).toFixed(1) }}¢</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Cost</div>
          <div class="stat-value font-mono">{{ ((opp.totalCost || 0) * 100).toFixed(1) }}¢</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Spread</div>
          <div class="stat-value font-mono" :class="(opp.spreadPct || 0) > 0 ? 'text-green' : ''">
            {{ (opp.spreadPct || 0).toFixed(2) }}%
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Prob. of Positive Return</div>
          <div class="stat-value font-mono text-accent">
            {{ opp.conviction ? (opp.conviction * 100).toFixed(1) + '%' : '—' }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Dominant Side</div>
          <div class="stat-value">
            <span v-if="opp.dominantSide" class="side-badge" :class="opp.dominantSide === 'YES' ? 'side-yes' : 'side-no'">
              {{ opp.dominantSide }}
            </span>
            <span v-else>Both</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Potential / $100</div>
          <div class="stat-value font-mono text-green">${{ (opp.expectedProfit || 0).toFixed(2) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Quality Score</div>
          <div class="stat-value font-mono">
            <span v-if="opp.qualityScore" class="quality-badge" :class="qualityClass(opp.qualityScore || 0)">
              {{ (opp.qualityScore || 0).toFixed(1) }}
            </span>
            <span v-else>—</span>
          </div>
        </div>
      </div>

      <!-- Market Data (if available) -->
      <div v-if="opp.market" class="section-card">
        <h3 class="subsection-title">Market Data</h3>
        <div class="kv-grid">
          <div class="kv-item">
            <span class="kv-label">Volume</span>
            <span class="kv-value font-mono">${{ (opp.market.volume || 0).toLocaleString() }}</span>
          </div>
          <div class="kv-item">
            <span class="kv-label">Liquidity</span>
            <span class="kv-value font-mono">${{ (opp.market.liquidity || 0).toLocaleString() }}</span>
          </div>
          <div class="kv-item">
            <span class="kv-label">End Date</span>
            <span class="kv-value">{{ opp.market.endDate ? formatDate(opp.market.endDate) : '—' }}</span>
          </div>
          <div class="kv-item">
            <span class="kv-label">Market ID</span>
            <span class="kv-value font-mono text-muted" style="font-size: 0.75rem">{{ opp.marketId }}</span>
          </div>
        </div>
      </div>

      <!-- Related Trades -->
      <div class="section-card">
        <h3 class="subsection-title">Trade History</h3>
        <div v-if="!opp.relatedTrades?.length" class="empty-mini">
          No trades have been placed on this market.
        </div>
        <div v-else class="trade-list">
          <div v-for="trade in opp.relatedTrades" :key="trade.id" class="trade-item">
            <div class="trade-side">
              <span class="side-badge" :class="trade.side === 'YES' ? 'side-yes' : 'side-no'">
                {{ trade.side }}
              </span>
            </div>
            <div class="trade-details">
              <span class="font-mono">${{ (trade.amount || 0).toFixed(2) }}</span>
              <span class="text-muted">@</span>
              <span class="font-mono">{{ ((trade.price || 0) * 100).toFixed(1) }}¢</span>
            </div>
            <div class="trade-status">
              <span class="trade-status-badge" :class="'trade-status--' + trade.status">
                {{ trade.status }}
              </span>
            </div>
            <div class="trade-time text-muted">{{ formatDate(trade.executedAt) }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>



<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-header {
  display: flex;
  align-items: center;
}

.back-btn {
  font-weight: 600;
}

/* ─── Status Banner ─── */
.status-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
}
.status-icon { font-size: 1.5rem; }
.status-text { flex: 1; }
.status-text strong {
  font-size: 0.95rem;
  display: block;
  margin-bottom: 0.15rem;
}
.status-text p {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.45;
}

.daily-counter {
  text-align: center;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.5rem 1rem;
}
.counter-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.25rem;
  font-weight: 800;
  display: block;
}
.counter-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ─── Section Cards ─── */
.section-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.5rem;
}
.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  line-height: 1.4;
}
.subsection-title {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0 0 1rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.82rem;
}

.external-link {
  color: var(--accent-light);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 600;
}
.external-link:hover { text-decoration: underline; }

/* ─── Stats Grid ─── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
}
.stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.35rem;
}
.stat-value {
  font-size: 1.15rem;
  font-weight: 800;
}

/* ─── KV Grid ─── */
.kv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
.kv-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.kv-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}
.kv-value {
  font-size: 0.9rem;
  font-weight: 600;
}

/* ─── Trade History ─── */
.empty-mini {
  color: var(--text-muted);
  font-size: 0.85rem;
  padding: 1rem 0;
  text-align: center;
}
.trade-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.trade-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
}
.trade-item:last-child { border-bottom: none; }

.trade-details { flex: 1; }
.trade-time { font-size: 0.78rem; }

.trade-status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: capitalize;
}
.trade-status--filled { background: var(--green-bg); color: var(--green); }
.trade-status--pending { background: rgba(234, 179, 8, 0.15); color: #facc15; }
.trade-status--failed { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.trade-status--simulated { background: rgba(99, 102, 241, 0.15); color: var(--accent-light); }

/* ─── Error ─── */
.error-card {
  text-align: center;
  padding: 3rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
}

/* ─── Shared ─── */
.type-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 5px;
  white-space: nowrap;
}
.type-badge--arb { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.type-badge--hc { background: rgba(234, 179, 8, 0.15); color: #facc15; }

.side-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}
.side-yes { background: rgba(34, 197, 94, 0.15); color: var(--green); }
.side-no { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.quality-badge {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 5px;
}
.quality-high { background: rgba(34, 197, 94, 0.15); color: var(--green); }
.quality-mid { background: rgba(234, 179, 8, 0.15); color: #facc15; }
.quality-low { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }

.font-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
.text-muted { color: var(--text-muted); }
.text-accent { color: var(--accent-light); }
.text-green { color: var(--green); }
.text-red { color: #ef4444; }
</style>

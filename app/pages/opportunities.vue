<script setup lang="ts">
useSeoMeta({
  title: 'Opportunities — Polymarket Arb Bot',
  description: 'Detected arbitrage, multi-outcome, and tail-end sweep opportunities across Polymarket prediction markets',
})

const { data: opportunities, refresh } = await useFetch('/api/opportunities', { query: { limit: 100 } })

const formatTime = (iso: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Auto-refresh
const refreshInterval = ref<any>(null)
onMounted(() => {
  refreshInterval.value = setInterval(() => refresh(), 30_000)
})
onUnmounted(() => clearInterval(refreshInterval.value))

// Type filter
const typeFilter = ref<'all' | 'arbitrage' | 'high_conviction' | 'multi_outcome_arb' | 'tail_end_sweep'>('all')
const filteredOpps = computed(() => {
  if (!opportunities.value) return []
  if (typeFilter.value === 'all') return opportunities.value
  return opportunities.value.filter((o: any) => o.type === typeFilter.value)
})

// Type badge helpers
const typeBadgeClass = (type: string) => {
  switch (type) {
    case 'arbitrage': return 'type-badge--arb'
    case 'high_conviction': return 'type-badge--hc'
    case 'multi_outcome_arb': return 'type-badge--mo'
    case 'tail_end_sweep': return 'type-badge--te'
    default: return 'type-badge--arb'
  }
}
const typeBadgeLabel = (type: string) => {
  switch (type) {
    case 'arbitrage': return '⚡ Arb'
    case 'high_conviction': return '🎯 HC'
    case 'multi_outcome_arb': return '🎲 Multi'
    case 'tail_end_sweep': return '🏁 Sweep'
    default: return type
  }
}

// Quality score color class
const qualityClass = (score: number) => {
  if (score >= 7) return 'quality-high'
  if (score >= 4) return 'quality-mid'
  return 'quality-low'
}
</script>

<template>
  <div class="opps-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Opportunities</h1>
        <p class="page-subtitle">Arbitrage &amp; high-conviction opportunities detected by the scanner</p>
      </div>
      <div class="header-actions">
        <div class="type-filter">
          <button
            :class="['filter-btn', { active: typeFilter === 'all' }]"
            @click="typeFilter = 'all'"
          >All</button>
          <button
            :class="['filter-btn', { active: typeFilter === 'arbitrage' }]"
            @click="typeFilter = 'arbitrage'"
          >⚡ Arbitrage</button>
          <button
            :class="['filter-btn', { active: typeFilter === 'high_conviction' }]"
            @click="typeFilter = 'high_conviction'"
          >🎯 High Conviction</button>
          <button
            :class="['filter-btn', { active: typeFilter === 'multi_outcome_arb' }]"
            @click="typeFilter = 'multi_outcome_arb'"
          >🎲 Multi-Outcome</button>
          <button
            :class="['filter-btn', { active: typeFilter === 'tail_end_sweep' }]"
            @click="typeFilter = 'tail_end_sweep'"
          >🏁 Tail-End</button>
        </div>
        <UButton variant="soft" @click="refresh()">
          <template #leading>
            <UIcon name="i-heroicons-arrow-path" />
          </template>
          Refresh
        </UButton>
      </div>
    </div>

    <div class="section-card">
      <div v-if="!filteredOpps?.length" class="empty-state">
        <div class="empty-icon">{{ typeFilter === 'high_conviction' ? '🎯' : '⚡' }}</div>
        <p>No {{ typeFilter === 'all' ? '' : typeFilter === 'arbitrage' ? 'arbitrage' : 'high-conviction' }} opportunities found yet.</p>
        <p class="text-muted">Run a scan from the Dashboard to detect opportunities.</p>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Market</th>
              <th>YES</th>
              <th>NO</th>
              <th>Conviction</th>
              <th>Quality</th>
              <th>Side</th>
              <th>Potential / $100</th>
              <th>Extra</th>
              <th>Traded</th>
              <th>Detected</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="opp in filteredOpps"
              :key="opp.id"
              class="clickable-row"
              @click="navigateTo(`/opportunities/${opp.id}`)"
            >
              <td>
                <span class="type-badge" :class="typeBadgeClass(opp.type)">
                  {{ typeBadgeLabel(opp.type) }}
                </span>
              </td>
              <td class="cell-question">
                {{ opp.eventTitle || opp.question }}
                <span v-if="opp.outcomeCount" class="outcome-count">
                  ({{ opp.outcomeCount }} outcomes)
                </span>
              </td>
              <td class="font-mono">
                <template v-if="opp.type === 'multi_outcome_arb'">Σ {{ ((opp.yesPrice || 0) * 100).toFixed(1) }}¢</template>
                <template v-else>{{ ((opp.yesPrice || 0) * 100).toFixed(1) }}¢</template>
              </td>
              <td class="font-mono">
                <template v-if="opp.type === 'multi_outcome_arb'">—</template>
                <template v-else>{{ ((opp.noPrice || 0) * 100).toFixed(1) }}¢</template>
              </td>
              <td class="font-mono" :class="{ 'text-accent': (opp.conviction || 0) > 0.9 }">
                {{ opp.conviction ? (opp.conviction * 100).toFixed(1) + '%' : '—' }}
              </td>
              <td class="font-mono">
                <span v-if="opp.qualityScore" class="quality-score" :class="qualityClass(opp.qualityScore)">
                  {{ opp.qualityScore.toFixed(1) }}
                </span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span v-if="opp.dominantSide" class="side-badge" :class="opp.dominantSide === 'YES' ? 'side-yes' : 'side-no'">
                  {{ opp.dominantSide }}
                </span>
                <span v-else class="text-muted">Both</span>
              </td>
              <td class="text-green font-mono">${{ (opp.expectedProfit || 0).toFixed(2) }}</td>
              <td class="font-mono">
                <span v-if="opp.annualizedReturn" class="annualized-tag">{{ opp.annualizedReturn }}% APY</span>
                <span v-else-if="opp.daysToResolution" class="days-tag">{{ opp.daysToResolution }}d</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span class="traded-badge" :class="opp.traded ? 'traded-badge--yes' : 'traded-badge--no'">
                  {{ opp.traded ? 'Yes' : 'No' }}
                </span>
              </td>
              <td class="text-muted">{{ formatTime(opp.detectedAt) }}</td>
              <td class="cell-arrow">→</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.opps-page {
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
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.type-filter {
  display: flex;
  gap: 2px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 3px;
}
.filter-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.filter-btn:hover { color: var(--text-primary); }
.filter-btn.active {
  background: var(--accent);
  color: #fff;
}

.section-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.table-wrap { overflow-x: auto; }

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
  white-space: nowrap;
}
.data-table td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: var(--bg-card-hover); }

.cell-question {
  max-width: 350px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }

.type-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 5px;
  white-space: nowrap;
}
.type-badge--arb { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.type-badge--hc { background: rgba(234, 179, 8, 0.15); color: #facc15; }
.type-badge--mo { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
.type-badge--te { background: rgba(34, 197, 94, 0.15); color: var(--green); }

.outcome-count {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-left: 0.25rem;
}

.annualized-tag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(34, 197, 94, 0.15);
  color: var(--green);
}
.days-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(107, 114, 128, 0.15);
  color: var(--text-muted);
}

.side-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}
.side-yes { background: rgba(34, 197, 94, 0.15); color: var(--green); }
.side-no { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.traded-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}
.traded-badge--yes { background: var(--green-bg); color: var(--green); }
.traded-badge--no { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}
.empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.empty-state p { margin: 0.25rem 0; }

.text-muted { color: var(--text-muted); }
.text-accent { color: var(--accent-light); }
.text-green { color: var(--green); }

.clickable-row { cursor: pointer; }
.clickable-row:hover { background: var(--bg-card-hover); }

.cell-arrow {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.quality-score {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.quality-high { background: rgba(34, 197, 94, 0.15); color: var(--green); }
.quality-mid { background: rgba(234, 179, 8, 0.15); color: #facc15; }
.quality-low { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
</style>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useHead({ title: 'Scan Logs — Polymarket Arb Bot' })

const { data: logs, refresh, status } = useFetch('/api/scan-logs')
const expandedId = ref<number | null>(null)

function toggle(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

function fmtDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Scan Logs</h1>
        <p class="text-sm text-gray-400 mt-1">Debug breakdown of each scan — see why markets were accepted or rejected</p>
      </div>
      <UButton icon="i-lucide-refresh-cw" label="Refresh" variant="soft" :loading="status === 'pending'" @click="refresh()" />
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending' && !logs" class="text-center py-12">
      <UIcon name="i-lucide-loader-circle" class="animate-spin text-3xl text-primary mb-2" />
      <p class="text-gray-400">Loading scan logs…</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!logs?.length" class="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
      <UIcon name="i-lucide-search-x" class="text-4xl text-gray-600 mb-3" />
      <p class="text-gray-400">No scan logs yet. Run a scan from the dashboard to generate logs.</p>
    </div>

    <!-- Log Entries -->
    <div v-else class="space-y-3">
      <div
        v-for="log in logs"
        :key="log.id"
        class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all"
      >
        <!-- Summary Row (clickable) -->
        <button
          class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
          @click="toggle(log.id)"
        >
          <div class="flex items-center gap-4 flex-1">
            <!-- Status indicator -->
            <div
              :class="[
                'w-2.5 h-2.5 rounded-full',
                log.error ? 'bg-red-500' : log.opportunitiesFound > 0 ? 'bg-green-500' : 'bg-yellow-500'
              ]"
            />

            <!-- Date -->
            <span class="text-sm font-medium">{{ fmtTime(log.createdAt) }}</span>

            <!-- Stats badges -->
            <div class="flex items-center gap-2 flex-wrap">
              <UBadge variant="subtle" color="neutral">
                {{ log.marketsScanned }} markets
              </UBadge>
              <UBadge
                variant="subtle"
                :color="log.opportunitiesFound > 0 ? 'success' : 'warning'"
              >
                {{ log.opportunitiesFound }} found
              </UBadge>
              <UBadge variant="subtle" color="neutral">
                {{ fmtDuration(log.durationMs || 0) }}
              </UBadge>
              <UBadge v-if="log.error" variant="subtle" color="error">
                Error
              </UBadge>
            </div>
          </div>

          <UIcon
            :name="expandedId === log.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="text-gray-500"
          />
        </button>

        <!-- Expanded Details -->
        <div v-if="expandedId === log.id" class="px-5 pb-5 border-t border-gray-800">
          <!-- Error display -->
          <div v-if="log.error" class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p class="text-red-400 text-sm font-mono">{{ log.error }}</p>
          </div>

          <!-- Debug details -->
          <div v-if="log.details" class="mt-4 space-y-5">
            <!-- Rejection Breakdown -->
            <div>
              <h3 class="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <UIcon name="i-lucide-filter-x" />
                Market Rejection Breakdown
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-white">{{ log.details.totalMarkets }}</p>
                  <p class="text-xs text-gray-400">Total Markets</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-green-400">{{ log.details.passed }}</p>
                  <p class="text-xs text-gray-400">Passed Filters</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-red-400">{{ log.details.rejectedVolume }}</p>
                  <p class="text-xs text-gray-400">Low Volume</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-red-400">{{ log.details.rejectedLiquidity }}</p>
                  <p class="text-xs text-gray-400">Low Liquidity</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-orange-400">{{ log.details.rejectedTimeTooSoon }}</p>
                  <p class="text-xs text-gray-400">Ending Too Soon</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-orange-400">{{ log.details.rejectedTimeTooFar }}</p>
                  <p class="text-xs text-gray-400">Too Far Out</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-yellow-400">{{ log.details.rejectedInvalidPrice }}</p>
                  <p class="text-xs text-gray-400">Invalid Price</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-yellow-400">{{ log.details.rejectedNoSpread }}</p>
                  <p class="text-xs text-gray-400">No Spread</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-yellow-400">{{ log.details.rejectedSpreadTooLow }}</p>
                  <p class="text-xs text-gray-400">Spread Too Low</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-purple-400">{{ log.details.rejectedNoEdge }}</p>
                  <p class="text-xs text-gray-400">No Edge (&lt;2%)</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-purple-400">{{ log.details.rejectedPriceTooLow }}</p>
                  <p class="text-xs text-gray-400">Price Too Low (&lt;60¢)</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-blue-400">{{ log.details.rejectedBelowConviction }}</p>
                  <p class="text-xs text-gray-400">Below Conviction</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-blue-400">{{ log.details.rejectedPureArbitrage }}</p>
                  <p class="text-xs text-gray-400">Pure Arb (separate)</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-3 text-center">
                  <p class="text-xl font-bold text-gray-500">{{ log.details.rejectedZeroQuality }}</p>
                  <p class="text-xs text-gray-400">Zero Quality</p>
                </div>
              </div>
            </div>

            <!-- Top Near-Miss Candidates -->
            <div v-if="log.details.topCandidates?.length">
              <h3 class="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <UIcon name="i-lucide-target" />
                Top Near-Miss Candidates
              </h3>
              <div class="space-y-2">
                <div
                  v-for="(c, i) in log.details.topCandidates"
                  :key="i"
                  class="bg-gray-800 rounded-lg px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">{{ c.question }}</p>
                    <div class="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>Dominant: {{ (c.dominant * 100).toFixed(0) }}¢</span>
                      <span>Vol: ${{ (c.volume / 1000).toFixed(0) }}k</span>
                      <span>Liq: ${{ (c.liquidity / 1000).toFixed(0) }}k</span>
                      <span v-if="c.prob">P(+): {{ (c.prob * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                  <UBadge variant="subtle" color="warning" class="shrink-0">
                    {{ c.reason }}
                  </UBadge>
                </div>
              </div>
            </div>
          </div>

          <!-- No debug details -->
          <div v-else-if="!log.error" class="mt-4 text-sm text-gray-500">
            No debug details available for this scan (older scan).
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

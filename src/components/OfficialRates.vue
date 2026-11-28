<template>
  <div class="relative z-10 border-b border-white/10 px-4 py-2 text-xs text-blue-100/80" aria-live="polite">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span>{{ t('referenceRates') }}</span>
      <span v-for="entry in rates" :key="entry.code">1 {{ entry.code }} = {{ Number(entry.rate.toPrecision(5)) }} {{ trip.baseCurrency }}</span>
      <span v-if="updatedDate">{{ t('updatedAt') }}: {{ updatedDate }}</span>
      <button :disabled="loading" @click="$emit('refresh')" class="underline hover:text-white disabled:opacity-50">
        {{ t(loading ? 'loadingRates' : 'refreshRates') }}
      </button>
    </div>
    <p v-if="status" class="mt-1 text-amber-200">{{ t(status) }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SUPPORTED_CURRENCIES } from '../config/currencies'
import { getOfficialRate } from '../lib/fx'
const props = defineProps({ trip: Object, t: Function, loading: Boolean, status: String })
defineEmits(['refresh'])
const rates = computed(() => SUPPORTED_CURRENCIES
  .filter(code => code !== props.trip.baseCurrency && getOfficialRate(code, props.trip) !== null)
  .map(code => ({ code, ...props.trip.fxRates[code] })))
const updatedDate = computed(() => [...new Set(rates.value
  .map(entry => entry.officialDate || entry.updatedAt?.slice(0, 10)).filter(Boolean))].sort().join(', '))
</script>

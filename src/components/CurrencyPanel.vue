<template>
  <div class="p-4 text-white space-y-4">
    <h2 class="text-lg font-semibold">{{ t('currencyPanel') }}</h2>
    <div>
      <label class="block text-sm mb-1">{{ t('baseCurrency') }}</label>
      <select :value="trip.baseCurrency" :disabled="expenses.length > 0" @change="$emit('base', $event.target.value)" class="bg-slate-800 border border-white/20 rounded-lg px-3 py-2">
        <option v-for="code in codes" :key="code">{{ code }}</option>
      </select>
      <p v-if="expenses.length" class="text-xs text-white/60 mt-1">{{ t('baseLocked') }}</p>
    </div>
    <div>
      <div class="text-sm mb-2">{{ t('enabledCurrencies') }}</div>
      <div class="flex flex-wrap gap-3">
        <label v-for="code in codes" :key="code" class="text-sm"><input type="checkbox" :checked="trip.currencies.includes(code)" :disabled="code === trip.baseCurrency || expenses.some(e => e.currency === code)" @change="$emit('toggle', code)" /> {{ code }}</label>
      </div>
      <p class="text-xs text-white/60 mt-1">{{ t('currencyInUse') }}</p>
    </div>
    <div class="space-y-3">
      <div v-for="code in trip.currencies.filter(c => c !== trip.baseCurrency)" :key="code" class="bg-white/5 border border-white/10 rounded-lg p-3">
        <div class="flex justify-between"><strong>{{ code }}</strong><span class="text-xs bg-indigo-500/30 rounded px-2 py-1">{{ trip.fxRates[code] ? t(trip.fxRates[code].source) : t('missingRate') }}<span v-if="stale && trip.fxRates[code]?.source === 'official'"> · {{ t('stale') }}</span></span></div>
        <p class="text-sm mt-1">1 {{ code }} = {{ trip.fxRates[code]?.rate?.toPrecision(6) || '—' }} {{ trip.baseCurrency }}</p>
        <p v-if="trip.fxRates[code]" class="text-xs text-white/60">{{ t('updatedAt') }} {{ trip.fxRates[code].updatedAt?.slice(0, 16).replace('T', ' ') }} <span v-if="trip.fxRates[code].officialDate">· {{ t('officialDate') }} {{ trip.fxRates[code].officialDate }}</span></p>
        <div class="flex gap-2 mt-2">
          <input v-model="direct[code]" type="number" step="any" min="0" :placeholder="t('directRate')" class="min-w-0 flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white" />
          <button @click="saveDirect(code)" class="bg-indigo-600 rounded px-3 py-1 text-sm">{{ t('saveRate') }}</button>
        </div>
        <div class="text-xs mt-3">{{ t('actualExchange') }}: {{ trip.baseCurrency }} → {{ code }}</div>
        <div class="flex gap-2 mt-1">
          <input v-model="actual[code].base" type="number" min="0" :placeholder="trip.baseCurrency" class="min-w-0 w-1/3 bg-white/10 border border-white/20 rounded px-2 py-1" />
          <span>→</span>
          <input v-model="actual[code].foreign" type="number" min="0" :placeholder="code" class="min-w-0 w-1/3 bg-white/10 border border-white/20 rounded px-2 py-1" />
          <button @click="saveActual(code)" class="bg-indigo-600 rounded px-3 py-1 text-sm">{{ t('saveRate') }}</button>
        </div>
      </div>
    </div>
    <button @click="$emit('refresh')" :disabled="loading" class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg py-2 disabled:opacity-50">{{ loading ? t('loadingRates') : t('refreshRates') }}</button>
    <p v-if="status" class="text-sm text-amber-200">{{ status }}</p>
    <button v-if="expenses.length" @click="$emit('apply')" class="text-sm underline text-blue-200">{{ t('applyRates') }}</button>
    <p class="text-xs text-white/60">{{ t('referenceRates') }}</p>
  </div>
</template>
<script setup>
import { reactive } from 'vue'
import { SUPPORTED_CURRENCIES } from '../config/currencies'
import { deriveActualRate } from '../lib/fx'
const props = defineProps({ trip: Object, expenses: Array, t: Function, loading: Boolean, status: String, stale: Boolean })
const emit = defineEmits(['base', 'toggle', 'rate', 'refresh', 'apply'])
const codes = SUPPORTED_CURRENCIES
const direct = reactive({})
const actual = reactive(Object.fromEntries(codes.map(code => [code, { base: '', foreign: '' }])))
function saveDirect(code) {
  const rate = Number(direct[code])
  if (rate > 0 && Number.isFinite(rate)) { emit('rate', code, rate); direct[code] = '' }
  else alert(props.t('invalidRate'))
}
function saveActual(code) {
  try { emit('rate', code, deriveActualRate(actual[code].base, actual[code].foreign)); actual[code] = { base: '', foreign: '' } }
  catch { alert(props.t('invalidRate')) }
}
</script>

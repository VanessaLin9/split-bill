<template>
  <div class="p-4">
    <div class="flex items-center gap-2 mb-4">
      <div class="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 class="text-lg text-white font-semibold">{{ t('settlementSummary') }}</h2>
    </div>

    <div class="mb-3">
      <label class="text-sm text-white/80 mr-2">{{ t('displayCurrency') }}</label>
      <select :value="displayCurrency" @change="$emit('update:displayCurrency', $event.target.value)" class="bg-slate-800 border border-white/20 text-white rounded px-2 py-1">
        <option v-for="code in trip.currencies" :key="code" :disabled="code !== trip.baseCurrency && !trip.fxRates[code]?.rate">{{ code }}</option>
      </select>
    </div>
    <div v-if="expenses.length === 0" class="text-center py-8 bg-white/5 rounded-xl border border-white/10">
      <div class="text-white/60">{{ t('noExpenses') }}</div>
    </div>

    <div v-else class="space-y-4">
      <div class="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
        <div class="text-center mb-3">
          <div class="flex items-center justify-center gap-1 text-purple-200 mb-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span class="font-medium text-sm">{{ t('totalExpenses') }}</span>
          </div>
          <div class="text-2xl font-bold text-white">{{ money(totalExpenses) }}</div>
        </div>

      </div>

      <div>
        <h4 class="text-white/90 font-medium mb-3" :class="leftAlign ? 'text-left' : ''">{{ t('shouldPay') }}</h4>
        <div class="space-y-2">
          <div
            v-for="member in members"
            :key="member.id"
            class="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <span class="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2 py-1 rounded text-sm">
              {{ member.name }}
            </span>
            <span class="text-white font-medium text-sm">{{ money(expenseBreakdown[member.id] || 0) }}</span>
          </div>
        </div>
      </div>

      <div class="border-t border-white/20 pt-4">
        <h4 class="text-white/90 font-medium mb-3">{{ t('finalSettlement') }}</h4>
        <div v-if="Object.keys(finalSettlements).length === 0" class="text-center py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
          <div class="text-green-300 font-medium text-sm">{{ t('allSettled') }}</div>
        </div>

        <div
  v-for="(settlements, debtor) in finalSettlements"
  :key="debtor"
  class="p-3 m-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-400/20 flex items-stretch"
>
  <!-- 欠款人標頭列 -->
  <div class="flex items-center justify-between gap-2 px-2 py-1 w-2/5 bg-blue-500/20 text-blue-200 border border-blue-400/30 rounded">
    <span class="text-xs text-white">
      {{ memberNames[debtor] || debtor }}
    </span>
    <span class="text-white/30 text-xs">{{ t('owes') }}</span>
  </div>

  <!-- 欠誰多少，獨立成清單 -->
  <ul class="space-y-2 px-2 w-full">
    <li
      v-for="item in settlements"
      :key="debtor + '->' + item.to"
      class="flex justify-between items-center"
    >
      <span class="bg-green-500/20 text-green-200 border border-green-400/30 px-2 py-1 rounded text-xs ml-4">
        {{ memberNames[item.to] || item.to }}
      </span>
      <span class="bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
        {{ money(item.amount) }}
      </span>
    </li>
  </ul>
</div>


      </div>
    </div>
  </div>
</template>

<script setup>
import { formatMoney, toDisplay } from '../lib/money'
const props = defineProps({ members: Array, expenses: Array, totalExpenses: Number, perPersonAverage: Number,
  expenseBreakdown: Object, finalSettlements: Object, memberNames: Object, trip: Object, displayCurrency: String, t: Function, leftAlign: Boolean })
defineEmits(['update:displayCurrency'])
const money = amount => formatMoney(toDisplay(amount, props.displayCurrency, props.trip), props.displayCurrency)
</script>

<template>
  <div class="p-4">
    <div class="flex items-center gap-2 mb-4">
      <div class="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 class="text-lg text-white font-semibold">{{ t('expenseDetails') }}</h2>
    </div>

    <div v-if="expenses.length === 0" class="text-center py-8 bg-white/5 rounded-xl border border-white/10">
      <div class="text-white/60">{{ t('noExpenses') }}</div>
    </div>

    <div v-else :class="grid ? 'grid grid-cols-3 gap-x-2 gap-y-3 items-stretch' : 'space-y-3'">
      <div
        v-for="(expense, index) in expenses"
        :key="index"
        class="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-2">
            <span class="bg-cyan-500/20 text-cyan-200 px-2 py-1 rounded text-xs">#{{ index + 1 }}</span>
            <span class="bg-green-500/20 text-green-200 px-2 py-1 rounded text-sm font-semibold">
              ${{ expense.amount }}{{ t('yuan') }}
            </span>
          </div>
          <button
            @click="$emit('remove', index)"
            class="text-red-400 hover:text-red-300 p-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div class="text-white font-medium mb-2">
          {{ expense.description || t('untitled') }}
        </div>

        <div class="text-sm text-white/70 mb-3">
          {{ t('paidBy') }}: 
          <span class="text-blue-300">{{ expense.paidBy }}</span>
        </div>

        <div>
          <div class="text-xs text-white/50 mb-1" :class="grid ? 'text-left' : ''">{{ t('participants') }}:</div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="participant in expense.sharedWith"
              :key="participant"
              class="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-xs"
            >
              {{ participant }}
            </span>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-white/10">
          <div class="text-xs text-white/50 mb-1">{{ t('split') }}:</div>
          <div class="text-xs text-white/70">
            <span v-for="person in expense.sharedWith" :key="person">
              {{ person }} → {{ expense.paidBy }}: ${{ (expense.amount / expense.sharedWith.length).toFixed(2) }}{{ t('yuan') }}
              <br />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Expense = {
  amount: number
  paidBy: string
  description: string
  sharedWith: string[]
}

const props = defineProps<{
  expenses: Expense[]
  t: (key: string) => string
  grid?: boolean
}>()

defineEmits<{
  (e: 'remove', index: number): void
}>()
</script>



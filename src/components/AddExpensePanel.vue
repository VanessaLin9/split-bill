<template>
  <div class="p-4">
    <div class="flex items-center gap-2 mb-4">
      <div class="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h2 class="text-lg text-white font-semibold ">{{ t('addExpense') }}</h2>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-white/90 text-sm mb-2 text-left">{{ t('amount') }}</label>
        <input
          :value="amount"
          @input="$emit('update:amount', Number(($event.target as HTMLInputElement).value))"
          type="number"
          placeholder="0.00"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-right text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
      </div>

      <div>
        <label class="block text-white/90 text-sm mb-2 text-left">{{ t('payer') }}</label>
        <select
          :value="paidBy"
          @change="$emit('update:paidBy', ($event.target as HTMLSelectElement).value)"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option disabled value="">{{ t('selectPayer') }}</option>
          <option v-for="member in members" :key="member" :value="member" class="text-gray-900">{{ member }}</option>
        </select>
      </div>

      <div>
        <label class="block text-white/90 text-sm mb-2 text-left">{{ t('description') }}</label>
        <input
          :value="description"
          @input="$emit('update:description', ($event.target as HTMLInputElement).value)"
          type="text"
          :placeholder="t('description')"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
      </div>

      <div>
        <label class="block text-white/90 text-sm mb-2 text-left">{{ t('participants') }}</label>
        <div class="space-y-2">
          <label
            v-for="member in members"
            :key="member"
            class="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
          >
            <input
              type="checkbox"
              :value="member"
              :checked="sharedWith.includes(member)"
              @change="$emit('toggle-participant', member)"
              class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
            />
            <span class="text-white">{{ member }}</span>
          </label>
        </div>
      </div>

      <button
        @click="$emit('submit')"
        class="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {{ t('addExpenseButton') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  members: string[]
  amount: number | ''
  paidBy: string
  description: string
  sharedWith: string[]
  t: (key: string) => string
}>()

defineEmits<{
  (e: 'update:amount', val: number): void
  (e: 'update:paidBy', val: string): void
  (e: 'update:description', val: string): void
  (e: 'toggle-participant', member: string): void
  (e: 'submit'): void
}>()
</script>



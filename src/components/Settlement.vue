<template>
  <section class="bg-white p-4 rounded shadow">
    <h2 class="text-lg font-semibold mb-2">💰 結帳明細</h2>
    <div v-if="expenses.length === 0" class="text-gray-500">尚無記帳資料</div>
    <div v-else class="space-y-3 text-sm">
      <div v-for="(e, idx) in expenses" :key="idx">
        <div class="font-semibold">
          {{ e.description || '未命名' }} - ${{ e.amount }}（{{ e.paidBy }} 付款）
        </div>
        <ul class="ml-4 list-disc">
          <li v-for="person in e.sharedWith" :key="person">
            {{ person }} ➜ {{ e.paidBy }}：${{ (e.amount / e.sharedWith.length).toFixed(2) }}
          </li>
        </ul>
      </div>
      <hr class="my-3 border-t-2 border-gray-300" />
      <div class="font-bold text-base">總結：</div>
      <ul class="ml-4 list-disc">
        <li v-for="(amount, key) in summary()" :key="key">
          {{ key.split('->')[0] }} ➜ {{ key.split('->')[1] }}：${{ amount.toFixed(2) }}
        </li>
      </ul>
    </div>
  </section>
</template>
<script setup>
const props = defineProps({
  expenses: Array,
  summary: Function
})
</script> 
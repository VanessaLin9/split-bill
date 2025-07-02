<template>
  <section class="bg-white p-4 rounded shadow">
    <h2 class="text-lg font-semibold mb-2">📋 消費明細</h2>
    <table class="w-full text-sm table-auto border">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-2 py-1">#</th>
          <th class="border px-2 py-1">金額</th>
          <th class="border px-2 py-1">付款人</th>
          <th class="border px-2 py-1">用途</th>
          <th class="border px-2 py-1">分帳對象</th>
          <th class="border px-2 py-1">刪除</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(e, idx) in expenses" :key="idx">
          <td class="border px-2 py-1">{{ idx + 1 }}</td>
          <td class="border px-2 py-1">{{ e.amount }}</td>
          <td class="border px-2 py-1">{{ e.paidBy }}</td>
          <td class="border px-2 py-1">{{ e.description }}</td>
          <td class="border px-2 py-1">{{ e.sharedWith.join(', ') }}</td>
          <td class="border px-2 py-1 text-center">
            <button @click="$emit('remove-expense', idx)" class="text-red-500">❌</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
<script setup>
const props = defineProps({
  expenses: Array
})
</script> 
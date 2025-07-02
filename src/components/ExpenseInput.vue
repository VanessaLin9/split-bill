<template>
  <section class="bg-white p-4 rounded shadow">
    <h2 class="text-lg font-semibold mb-2">🧾 新增花費</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input v-model="localExpense.amount" type="number" placeholder="金額" class="border p-2 rounded" />
      <select v-model="localExpense.paidBy" class="border p-2 rounded">
        <option disabled value="">誰付款？</option>
        <option v-for="member in members" :key="member" :value="member">{{ member }}</option>
      </select>
      <input v-model="localExpense.description" type="text" placeholder="用途" class="border p-2 rounded md:col-span-2" />
      <div class="md:col-span-2">
        <label class="font-medium block mb-1">分帳對象：</label>
        <div class="flex flex-wrap gap-2">
          <label v-for="member in members" :key="member" class="flex items-center gap-1">
            <input type="checkbox" :value="member" v-model="localExpense.sharedWith" />
            {{ member }}
          </label>
        </div>
      </div>
    </div>
    <button @click="emitAddExpense" class="mt-4 bg-green-500 text-white px-4 py-2 rounded">➕ 新增記帳</button>
  </section>
</template>
<script setup>
import { reactive, watch } from 'vue'
const props = defineProps({
  members: Array,
  newExpense: Object
})
const emit = defineEmits(['add-expense'])
const localExpense = reactive({ ...props.newExpense })
watch(() => props.newExpense, val => Object.assign(localExpense, val))
function emitAddExpense() {
  emit('add-expense', { ...localExpense })
  Object.assign(localExpense, { amount: '', paidBy: '', description: '', sharedWith: [] })
}
</script> 
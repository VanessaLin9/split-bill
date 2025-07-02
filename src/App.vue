<template>
  <div class="min-h-screen p-4 bg-gray-50">
    <h1 class="text-2xl font-bold mb-4">朋友出遊分帳</h1>

    <!-- Layout: 左側主要 + 右側結算 -->
    <div class="flex flex-col md:flex-row gap-4">
      
      <!-- 左側內容 -->
      <div class="flex-1 space-y-6">
        <!-- 成員管理 -->
        <section class="bg-gray-300 p-4 rounded shadow">
          <h2 class="text-lg font-semibold mb-2">👥 成員管理</h2>
          <!-- 成員清單 -->
          <div class="flex flex-wrap gap-2 mb-2">
            <div
              v-for="member in members"
              :key="member"
              class="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded"
            >
              {{ member }}
              <button @click="removeMember(member)" class="ml-2 text-red-500 hover:text-red-700">❌</button>
            </div>
          </div>
          <div class="flex gap-2">
            <input v-model="newMember" type="text" placeholder="輸入新成員" class="border p-2 flex-1 rounded" />
            <button @click="addMember" class="bg-blue-500 text-white px-4 py-2 rounded">新增</button>
          </div>
        </section>

        <!-- 記帳輸入 -->
        <section class="bg-gray-300 p-4 rounded shadow">
          <h2 class="text-lg font-semibold mb-2">🧾 新增花費</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input v-model="newExpense.amount" type="number" placeholder="金額" class="border p-2 rounded" />
            <select v-model="newExpense.paidBy" class="border p-2 rounded">
              <option disabled value="">誰付款？</option>
              <option v-for="member in members" :key="member" :value="member">{{ member }}</option>
            </select>
            <input v-model="newExpense.description" type="text" placeholder="用途" class="border p-2 rounded md:col-span-2" />
            <div class="md:col-span-2">
              <label class="font-medium block mb-1">分帳對象：</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="member in members" :key="member" class="flex items-center gap-1">
                  <input type="checkbox" :value="member" v-model="newExpense.sharedWith" />
                  {{ member }}
                </label>
              </div>
            </div>
          </div>
          <button @click="addExpense" class="mt-4 bg-green-500 text-white px-4 py-2 rounded">➕ 新增記帳</button>
        </section>

        <!-- 消費明細 -->
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
                  <button @click="removeExpense(idx)" class="text-red-500">❌</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <!-- 右側結帳結果 -->
      <div class="md:w-[400px] space-y-4">
        <section class="bg-gray-100 p-4 rounded shadow">
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
              <!-- 結帳結果（依付款人 group 顯示） -->
              <div v-for="(items, payer) in groupedSummary()" :key="payer" class="mb-6">
                <div class="font-semibold mb-2 text-left">👤 {{ payer }} 需付款：</div>
                <table class="w-full table-auto text-sm border border-gray-300">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="border px-2 py-1 text-left">收款人</th>
                      <th class="border px-2 py-1 text-right">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in items" :key="item.to">
                      <td class="border px-2 py-1">➜ {{ item.to }}</td>
                      <td class="border px-2 py-1 text-right">${{ item.amount.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const members = ref(['小明', '小美', '小華'])
const newMember = ref('')
const expenses = ref([])

const newExpense = ref({
  amount: '',
  paidBy: '',
  description: '',
  sharedWith: [],
})

const addMember = () => {
  if (newMember.value.trim() && !members.value.includes(newMember.value)) {
    members.value.push(newMember.value.trim())
    newMember.value = ''
  }
}

const removeMember = (target) => {
  // 檢查是否已在帳務中使用
  const isUsed = expenses.value.some(e =>
    e.paidBy === target || e.sharedWith.includes(target)
  )
  if (isUsed) {
    alert(`無法刪除「${target}」，因為已經在記帳紀錄中出現過。`)
    return
  }

  // 否則直接刪除
  members.value = members.value.filter(m => m !== target)
}

const addExpense = () => {
  if (!newExpense.value.amount || !newExpense.value.paidBy || newExpense.value.sharedWith.length === 0) return
  expenses.value.push({ ...newExpense.value })
  newExpense.value = { amount: '', paidBy: '', description: '', sharedWith: [] }
}

const removeExpense = (idx) => {
  expenses.value.splice(idx, 1)
}

const summary = () => {
  const rawMap = {}

  // 累積每一筆債務
  for (const e of expenses.value) {
    const share = e.amount / e.sharedWith.length
    for (const person of e.sharedWith) {
      if (person !== e.paidBy) {
        const key = `${person}->${e.paidBy}`
        rawMap[key] = (rawMap[key] || 0) + share
      }
    }
  }

  // 建立簡化後的結果（抵銷雙向）
  const finalMap = {}

  for (const [key, amount] of Object.entries(rawMap)) {
    const [from, to] = key.split('->')
    const reverseKey = `${to}->${from}`

    if (finalMap[reverseKey]) {
      // 若已有反向債務，進行抵銷
      const diff = finalMap[reverseKey] - amount
      if (diff > 0) {
        finalMap[reverseKey] = diff
      } else if (diff < 0) {
        finalMap[key] = -diff
        delete finalMap[reverseKey]
      } else {
        delete finalMap[reverseKey]
      }
    } else {
      // 尚無反向債務，直接加入
      finalMap[key] = amount
    }
  }

  return finalMap
}

const groupedSummary = () => {
  const raw = summary()
  const result = {}

  for (const key in raw) {
    const [from, to] = key.split('->')
    if (!result[from]) result[from] = []
    result[from].push({ to, amount: raw[key] })
  }

  return result
}
</script>

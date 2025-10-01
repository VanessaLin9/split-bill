<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
    <!-- 背景裝飾元素 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
    </div>

    <!-- 桌面版 Header -->
    <header v-if="isDesktop" class="relative z-10 bg-gradient-to-r from-slate-800/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                <svg class="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div class="absolute -inset-2 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-2xl blur-lg"></div>
            </div>
            <div>
              <h1 class="text-2xl bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent font-bold">
                {{ t('title') }}
              </h1>
              <p class="text-sm text-blue-200/70">Smart expense tracking</p>
            </div>
          </div>
          
          <button
            @click="toggleLanguage"
            class="flex items-center gap-3 border border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 px-4 py-2 rounded-lg"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span class="font-medium">{{ language === 'zh' ? 'English' : '中文' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 手機版 Header -->
    <header v-else class="bg-gradient-to-r from-slate-800/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-xl border-b border-white/10 shadow-xl">
      <div class="px-4 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h1 class="text-lg bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent font-bold">
                {{ t('title') }}
              </h1>
            </div>
          </div>
          
          <button
            @click="toggleLanguage"
            class="border border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm text-sm px-3 py-2 rounded-lg flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {{ language === 'zh' ? 'EN' : '中文' }}
          </button>
        </div>
      </div>
    </header>

    <!-- 手機版內容 -->
    <div v-if="!isDesktop" class="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900">
      <!-- 手機版摘要欄 -->
      <div class="bg-white/10 backdrop-blur-xl border-b border-white/20 px-4 py-3">
        <div class="flex justify-between items-center">
          <div class="text-white">
            <div class="text-sm text-white/70">Total Expenses</div>
            <div class="text-xl font-bold">${{ totalExpenses.toFixed(2) }}</div>
          </div>
          <div class="text-white text-right">
            <div class="text-sm text-white/70">Members</div>
            <div class="text-xl font-bold">{{ members.length }}</div>
          </div>
        </div>
      </div>

      <!-- 手機版分頁導航 -->
      <div class="bg-white/5 border-b border-white/10 p-1">
        <div class="flex justify-around">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'flex-1 h-16 flex flex-col items-center justify-center gap-1 rounded-none transition-all',
              activeTab === tab.key
                ? `${tab.activeClass} text-white border-b-2 ${tab.borderClass}`
                : 'bg-transparent text-white/70'
            ]"
          >
            <component :is="tab.icon" class="w-5 h-5" />
            <span class="text-xs">{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- 分頁內容 -->
      <div class="flex-1 overflow-hidden p-4">
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl h-full overflow-y-auto">
          <!-- 成員管理頁 -->
          <MembersPanel
            v-if="activeTab === 'members'"
            :members="members"
            :newMember="newMember"
            :t="t"
            @update:newMember="val => (newMember = val)"
            @add-member="addMember"
            @remove-member="removeMember"
          />

          <!-- 新增花費頁 -->
          <AddExpensePanel
            v-else-if="activeTab === 'add'"
            :members="members"
            :amount="newExpense.amount"
            :paidBy="newExpense.paidBy"
            :description="newExpense.description"
            :sharedWith="newExpense.sharedWith"
            :t="t"
            @update:amount="val => (newExpense.amount = val)"
            @update:paidBy="val => (newExpense.paidBy = val)"
            @update:description="val => (newExpense.description = val)"
            @toggle-participant="member => {
              const idx = newExpense.sharedWith.indexOf(member)
              if (idx === -1) newExpense.sharedWith.push(member)
              else newExpense.sharedWith.splice(idx, 1)
            }"
            @submit="addExpense"
          />

          <!-- 消費明細頁 -->
          <ExpensesPanel
            v-else-if="activeTab === 'expenses'"
            :expenses="expenses"
            :t="t"
            @remove="removeExpense"
          />

          <!-- 結算明細頁 -->
          <SettlementPanel
            v-else-if="activeTab === 'settlement'"
            :members="members"
            :expenses="expenses"
            :totalExpenses="totalExpenses"
            :perPersonAverage="perPersonAverage"
            :expenseBreakdown="expenseBreakdown"
            :finalSettlements="finalSettlements"
            :t="t"
          />
        </div>
      </div>
    </div>

    <!-- 桌面版內容 -->
    <div v-else class="p-6">
      <div class="bg-white/10 backdrop-blur-xl border-b border-white/20 px-4 py-3 lg:px-6 lg:py-4">
        <div class="flex justify-between items-center">
          <div class="text-white">
            <div class="text-sm text-white/70">Total Expenses</div>
            <div class="text-xl font-bold">${{ totalExpenses.toFixed(2) }}</div>
          </div>
          <div class="text-white text-right">
            <div class="text-sm text-white/70">Members</div>
            <div class="text-xl font-bold">{{ members.length }}</div>
          </div>
        </div>
      </div>


      <!-- 分頁內容 -->
      <div class="flex-1 overflow-hidden p-4 grid grid-cols-3 gap-2">
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl">
          <MembersPanel
            :members="members"
            :newMember="newMember"
            :t="t"
            @update:newMember="val => (newMember = val)"
            @add-member="addMember"
            @remove-member="removeMember"
          />
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl">
          <AddExpensePanel
            :members="members"
            :amount="newExpense.amount"
            :paidBy="newExpense.paidBy"
            :description="newExpense.description"
            :sharedWith="newExpense.sharedWith"
            :t="t"
            @update:amount="val => (newExpense.amount = val)"
            @update:paidBy="val => (newExpense.paidBy = val)"
            @update:description="val => (newExpense.description = val)"
            @toggle-participant="member => {
              const idx = newExpense.sharedWith.indexOf(member)
              if (idx === -1) newExpense.sharedWith.push(member)
              else newExpense.sharedWith.splice(idx, 1)
            }"
            @submit="addExpense"
          />
        </div>  

        <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl">
          <SettlementPanel
            :members="members"
            :expenses="expenses"
            :totalExpenses="totalExpenses"
            :perPersonAverage="perPersonAverage"
            :expenseBreakdown="expenseBreakdown"
            :finalSettlements="finalSettlements"
            :t="t"
            leftAlign
          />
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl col-span-3">
          <ExpensesPanel
            :expenses="expenses"
            :t="t"
            grid
            @remove="removeExpense"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import MembersPanel from './components/MembersPanel.vue'
import AddExpensePanel from './components/AddExpensePanel.vue'
import ExpensesPanel from './components/ExpensesPanel.vue'
import SettlementPanel from './components/SettlementPanel.vue'
import { translations } from './config/translation'
import { tabs } from './config/tabs'
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 響應式狀態
const members = ref(['小明', '小美', '小華'])
const newMember = ref('')
const expenses = ref([])
const newExpense = ref({
  amount: '',
  paidBy: '',
  description: '',
  sharedWith: [],
})

// 語言相關
const language = ref('zh')
const isDesktop = ref(false)
const activeTab = ref('members')

// 計算屬性
const totalExpenses = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + expense.amount, 0)
})

const perPersonAverage = computed(() => {
  return members.value.length > 0 ? totalExpenses.value / members.value.length : 0
})

// 計算每人應付總額
const expenseBreakdown = computed(() => {
  const breakdown = {}
  expenses.value.forEach(expense => {
    const splitAmount = expense.amount / expense.sharedWith.length
    expense.sharedWith.forEach(participant => {
      breakdown[participant] = (breakdown[participant] || 0) + splitAmount
    })
  })
  return breakdown
})

// 計算每人實際付款
const payments = computed(() => {
  const paymentMap = {}
  expenses.value.forEach(expense => {
    paymentMap[expense.paidBy] = (paymentMap[expense.paidBy] || 0) + expense.amount
  })
  return paymentMap
})

// 最終結算計算
const finalSettlements = computed(() => {
  const balances = {}
  
  // 計算每人淨餘額 (付款 - 應付)
  members.value.forEach(member => {
    const paid = payments.value[member] || 0
    const owes = expenseBreakdown.value[member] || 0
    balances[member] = paid - owes
  })

  const settlements = []
  const creditors = Object.entries(balances).filter(([, balance]) => balance > 0)
  const debtors = Object.entries(balances).filter(([, balance]) => balance < 0)

  // 簡單結算算法
  creditors.forEach(([creditor, creditAmount]) => {
    let remainingCredit = creditAmount
    
    debtors.forEach(([debtor, debtAmount]) => {
      if (remainingCredit > 0 && debtAmount < 0) {
        const settlementAmount = Math.min(remainingCredit, Math.abs(debtAmount))
        if (settlementAmount > 0.01) {
          settlements.push({
            from: debtor,
            to: creditor,
            amount: settlementAmount
          })
          remainingCredit -= settlementAmount
          debtors.find(d => d[0] === debtor)[1] += settlementAmount
        }
      }
    })
  })

  return settlements
})

// 翻譯函數
const t = (key) => {
  return translations[language.value][key] || key
}

// 方法
const toggleLanguage = () => {
  language.value = language.value === 'zh' ? 'en' : 'zh'
}

const addMember = () => {
  if (newMember.value.trim() && !members.value.includes(newMember.value)) {
    members.value.push(newMember.value.trim())
    newMember.value = ''
  }
}

const removeMember = (target) => {
  const isUsed = expenses.value.some(e =>
    e.paidBy === target || e.sharedWith.includes(target)
  )
  if (isUsed) {
    alert(`無法刪除「${target}」，因為已經在記帳紀錄中出現過。`)
    return
  }
  members.value = members.value.filter(m => m !== target)
}

// 響應式檢測
const checkScreenSize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// 暫時保留的原有方法（之後會重構）
const addExpense = () => {
  if (!newExpense.value.amount || !newExpense.value.paidBy || newExpense.value.sharedWith.length === 0) {
    alert(t('pleaseSelectParticipants'))
    return
  }
  
  expenses.value.push({
    amount: Number(newExpense.value.amount),
    paidBy: newExpense.value.paidBy,
    description: newExpense.value.description,
    sharedWith: [...newExpense.value.sharedWith]
  })
  
  // 清空表單
  newExpense.value = {
    amount: '',
    paidBy: '',
    description: '',
    sharedWith: [],
  }
}

const removeExpense = (idx) => {
  expenses.value.splice(idx, 1)
}
</script>

<style scoped>
/* Vue 特有的樣式綁定 */
.tab-icon {
  transition: all 0.2s ease;
}
</style>
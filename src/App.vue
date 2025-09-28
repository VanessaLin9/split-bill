<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
    <!-- 背景裝飾元素 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
    </div>

    <!-- 桌面版 Header -->
    <header v-if="isDesktop" class="relative z-10 bg-gradient-to-r from-slate-800/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div v-if="activeTab === 'members'" class="p-4">
            <div class="flex items-center gap-2 mb-4">
              <div class="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h2 class="text-lg text-white font-semibold">{{ t('memberManagement') }}</h2>
            </div>
            
            <!-- 新增成員 -->
            <div class="flex gap-2 mb-4">
              <input
                v-model="newMember"
                type="text"
                :placeholder="t('memberName')"
                class="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                @keyup.enter="addMember"
              />
              <button
                @click="addMember"
                class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            <!-- 成員列表 -->
            <div class="space-y-2">
              <div
                v-for="member in members"
                :key="member"
                class="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 border border-white/10"
              >
                <span class="text-white">{{ member }}</span>
                <button
                  @click="removeMember(member)"
                  class="text-red-400 hover:text-red-300 p-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 其他頁面暫時顯示原有內容 -->
          <div v-else-if="activeTab === 'add'" class="p-4">
            <div class="flex items-center gap-2 mb-4">
              <div class="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 class="text-lg text-white font-semibold">{{ t('addExpense') }}</h2>
            </div>
            <!-- 原有的新增花費表單 -->
            <!-- TODO: 下一步會重構這部分 -->
          </div>

          <!-- 其他頁面類似處理 -->
        </div>
      </div>
    </div>

    <!-- 桌面版內容 -->
    <div v-else class="p-4">
      <!-- TODO: 桌面版布局將在第3步處理 -->
      <div class="text-white text-center py-20">
        桌面版佈局 - 將在下一步實現
      </div>
    </div>
  </div>
</template>

<script setup>
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

// 翻譯對照表
const translations = {
  zh: {
    title: '朋友出遊分帳',
    memberManagement: '成員管理',
    addMember: '新增成員',
    memberName: '成員姓名',
    addExpense: '新增花費',
  },
  en: {
    title: 'Friends Trip Bill Split',
    memberManagement: 'Member Management',
    addMember: 'Add Member',
    memberName: 'Member Name',
    addExpense: 'Add Expense',
  }
}

// 分頁配置
const tabs = [
  {
    key: 'members',
    label: 'Members',
    icon: 'svg', // 這裡用字符串，實際會用組件
    activeClass: 'bg-blue-500/20',
    borderClass: 'border-blue-400'
  },
  {
    key: 'add',
    label: 'Add',
    icon: 'svg',
    activeClass: 'bg-indigo-500/20',
    borderClass: 'border-indigo-400'
  },
  {
    key: 'expenses',
    label: 'Expenses',
    icon: 'svg',
    activeClass: 'bg-cyan-500/20',
    borderClass: 'border-cyan-400'
  },
  {
    key: 'settlement',
    label: 'Split',
    icon: 'svg',
    activeClass: 'bg-purple-500/20',
    borderClass: 'border-purple-400'
  }
]

// 計算屬性
const totalExpenses = computed(() => {
  return expenses.value.reduce((sum, expense) => sum + expense.amount, 0)
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
  if (!newExpense.value.amount || !newExpense.value.paidBy || newExpense.value.sharedWith.length === 0) return
  expenses.value.push({ ...newExpense.value })
  newExpense.value = { amount: '', paidBy: '', description: '', sharedWith: [] }
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
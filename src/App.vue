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
          <div v-else-if="activeTab === 'add'" class="p-4">
            <div class="flex items-center gap-2 mb-4">
              <div class="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 class="text-lg text-white font-semibold">{{ t('addExpense') }}</h2>
            </div>
            
            <div class="space-y-4">
              <!-- 金額輸入 -->
              <div>
                <label class="block text-white/90 text-sm mb-2">{{ t('amount') }}</label>
                <input
                  v-model.number="newExpense.amount"
                  type="number"
                  placeholder="0.00"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-right text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <!-- 付款人 -->
              <div>
                <label class="block text-white/90 text-sm mb-2">{{ t('payer') }}</label>
                <select
                  v-model="newExpense.paidBy"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option disabled value="">{{ t('selectPayer') }}</option>
                  <option v-for="member in members" :key="member" :value="member" class="text-gray-900">{{ member }}</option>
                </select>
              </div>

              <!-- 項目說明 -->
              <div>
                <label class="block text-white/90 text-sm mb-2">{{ t('description') }}</label>
                <input
                  v-model="newExpense.description"
                  type="text"
                  :placeholder="t('description')"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <!-- 分帳成員 -->
              <div>
                <label class="block text-white/90 text-sm mb-2">{{ t('participants') }}</label>
                <div class="space-y-2">
                  <label
                    v-for="member in members"
                    :key="member"
                    class="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="member"
                      v-model="newExpense.sharedWith"
                      class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span class="text-white">{{ member }}</span>
                  </label>
                </div>
              </div>

              <!-- 新增按鈕 -->
              <button
                @click="addExpense"
                class="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {{ t('addExpenseButton') }}
              </button>
            </div>
          </div>

          <!-- 消費明細頁 -->
          <div v-else-if="activeTab === 'expenses'" class="p-4">
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

            <div v-else class="space-y-3">
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
                    @click="removeExpense(index)"
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
                  <div class="text-xs text-white/50 mb-1">{{ t('participants') }}:</div>
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

                <!-- 分攤明細 -->
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

          <!-- 結算明細頁 -->
          <div v-else-if="activeTab === 'settlement'" class="p-4">
            <div class="flex items-center gap-2 mb-4">
              <div class="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 class="text-lg text-white font-semibold">{{ t('settlementSummary') }}</h2>
            </div>

            <div v-if="expenses.length === 0" class="text-center py-8 bg-white/5 rounded-xl border border-white/10">
              <div class="text-white/60">{{ t('noExpenses') }}</div>
            </div>

            <div v-else class="space-y-4">
              <!-- 總覽統計 -->
              <div class="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                <div class="text-center mb-3">
                  <div class="flex items-center justify-center gap-1 text-purple-200 mb-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span class="font-medium text-sm">{{ t('totalExpenses') }}</span>
                  </div>
                  <div class="text-2xl font-bold text-white">${{ totalExpenses.toFixed(2) }}{{ t('yuan') }}</div>
                </div>
                <div class="text-center">
                  <div class="flex items-center justify-center gap-1 text-pink-200 mb-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span class="font-medium text-sm">{{ t('perPerson') }}</span>
                  </div>
                  <div class="text-xl font-semibold text-white">${{ perPersonAverage.toFixed(2) }}{{ t('yuan') }}</div>
                </div>
              </div>

              <!-- 個人應付 -->
              <div>
                <h4 class="text-white/90 font-medium mb-3">{{ t('shouldPay') }}</h4>
                <div class="space-y-2">
                  <div
                    v-for="member in members"
                    :key="member"
                    class="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <span class="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2 py-1 rounded text-sm">
                      {{ member }}
                    </span>
                    <span class="text-white font-medium text-sm">${{ (expenseBreakdown[member] || 0).toFixed(2) }}{{ t('yuan') }}</span>
                  </div>
                </div>
              </div>

              <!-- 最終結算 -->
              <div class="border-t border-white/20 pt-4">
                <h4 class="text-white/90 font-medium mb-3">Final Settlement</h4>
                <div v-if="finalSettlements.length === 0" class="text-center py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
                  <div class="text-green-300 font-medium text-sm">All settled!</div>
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="(settlement, index) in finalSettlements"
                    :key="index"
                    class="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-400/20"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-1 text-xs">
                        <span class="bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2 py-1 rounded text-xs">
                          {{ settlement.from }}
                        </span>
                        <span class="text-white/70 text-xs">{{ t('owes') }}</span>
                        <span class="bg-green-500/20 text-green-200 border border-green-400/30 px-2 py-1 rounded text-xs">
                          {{ settlement.to }}
                        </span>
                      </div>
                    </div>
                    <div class="text-center">
                      <span class="bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
                        ${{ settlement.amount.toFixed(2) }}{{ t('yuan') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
          <!-- 新增花費頁 -->
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
              <!-- 金額輸入 -->
              <div>
                <label class="block text-white/90 text-sm mb-2 text-left">{{ t('amount') }}</label>
                <input
                  v-model.number="newExpense.amount"
                  type="number"
                  placeholder="0.00"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-right text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <!-- 付款人 -->
              <div>
                <label class="block text-white/90 text-sm mb-2 text-left">{{ t('payer') }}</label>
                <select
                  v-model="newExpense.paidBy"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option disabled value="">{{ t('selectPayer') }}</option>
                  <option v-for="member in members" :key="member" :value="member" class="text-gray-900">{{ member }}</option>
                </select>
              </div>

              <!-- 項目說明 -->
              <div>
                <label class="block text-white/90 text-sm mb-2 text-left">{{ t('description') }}</label>
                <input
                  v-model="newExpense.description"
                  type="text"
                  :placeholder="t('description')"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <!-- 分帳成員 -->
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
                      v-model="newExpense.sharedWith"
                      class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span class="text-white">{{ member }}</span>
                  </label>
                </div>
              </div>

              <!-- 新增按鈕 -->
              <button
                @click="addExpense"
                class="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {{ t('addExpenseButton') }}
              </button>
            </div>
          </div>
        </div>  



        <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl">
          <!-- 結算明細頁 -->
          <div class="p-4">
            <div class="flex items-center gap-2 mb-4">
              <div class="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 class="text-lg text-white font-semibold">{{ t('settlementSummary') }}</h2>
            </div>

            <div v-if="expenses.length === 0" class="text-center py-8 bg-white/5 rounded-xl border border-white/10">
              <div class="text-white/60">{{ t('noExpenses') }}</div>
            </div>

            <div v-else class="space-y-4">
              <!-- 總覽統計 -->
              <div class="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                <div class="text-center mb-3">
                  <div class="flex items-center justify-center gap-1 text-purple-200 mb-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span class="font-medium text-sm">{{ t('totalExpenses') }}</span>
                  </div>
                  <div class="text-2xl font-bold text-white">${{ totalExpenses.toFixed(2) }}{{ t('yuan') }}</div>
                </div>
                <div class="text-center">
                  <div class="flex items-center justify-center gap-1 text-pink-200 mb-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span class="font-medium text-sm">{{ t('perPerson') }}</span>
                  </div>
                  <div class="text-xl font-semibold text-white">${{ perPersonAverage.toFixed(2) }}{{ t('yuan') }}</div>
                </div>
              </div>

              <!-- 個人應付 -->
              <div>
                <h4 class="text-white/90 font-medium mb-3 text-left">{{ t('shouldPay') }}</h4>
                <div class="space-y-2">
                  <div
                    v-for="member in members"
                    :key="member"
                    class="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <span class="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2 py-1 rounded text-sm">
                      {{ member }}
                    </span>
                    <span class="text-white font-medium text-sm">${{ (expenseBreakdown[member] || 0).toFixed(2) }}{{ t('yuan') }}</span>
                  </div>
                </div>
              </div>

              <!-- 最終結算 -->
              <div class="border-t border-white/20 pt-4">
                <h4 class="text-white/90 font-medium mb-3">Final Settlement</h4>
                <div v-if="finalSettlements.length === 0" class="text-center py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30">
                  <div class="text-green-300 font-medium text-sm">All settled!</div>
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="(settlement, index) in finalSettlements"
                    :key="index"
                    class="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-400/20"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-1 text-xs">
                        <span class="bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2 py-1 rounded text-xs">
                          {{ settlement.from }}
                        </span>
                        <span class="text-white/70 text-xs">{{ t('owes') }}</span>
                        <span class="bg-green-500/20 text-green-200 border border-green-400/30 px-2 py-1 rounded text-xs">
                          {{ settlement.to }}
                        </span>
                      </div>
                    </div>
                    <div class="text-center">
                      <span class="bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
                        ${{ settlement.amount.toFixed(2) }}{{ t('yuan') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl col-span-3">
          <!-- 消費明細頁 -->
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

            <div v-else class="grid grid-cols-3 gap-x-2 gap-y-3 items-stretch">
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
                    @click="removeExpense(index)"
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
                  <div class="text-xs text-white/50 mb-1 text-left">{{ t('participants') }}:</div>
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

                <!-- 分攤明細 -->
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
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import MembersPanel from './components/MembersPanel.vue'
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
    amount: '金額',
    payer: '付款人',
    selectPayer: '誰付款？',
    description: '項目說明',
    participants: '分帳成員',
    addExpenseButton: '新增花費',
    expenseDetails: '消費明細',
    noExpenses: '目前沒有消費記錄',
    untitled: '未命名',
    paidBy: '付款人',
    split: '分攤明細',
    settlementSummary: '結帳明細',
    totalExpenses: '總花費',
    perPerson: '每人平均',
    shouldPay: '應付',
    owes: '欠',
    yuan: '元',
    pleaseSelectParticipants: '請選擇分帳成員'
  },
  en: {
    title: 'Friends Trip Bill Split',
    memberManagement: 'Member Management',
    addMember: 'Add Member',
    memberName: 'Member Name',
    addExpense: 'Add Expense',
    amount: 'Amount',
    payer: 'Payer',
    selectPayer: 'Who paid?',
    description: 'Description',
    participants: 'Split Among',
    addExpenseButton: 'Add Expense',
    expenseDetails: 'Expense Details',
    noExpenses: 'No expenses recorded yet',
    untitled: 'Untitled',
    paidBy: 'Paid by',
    split: 'Split Details',
    settlementSummary: 'Settlement Summary',
    totalExpenses: 'Total Expenses',
    perPerson: 'Per Person',
    shouldPay: 'Should Pay',
    owes: 'owes',
    yuan: ''
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
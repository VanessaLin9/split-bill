<template>
  <div class="p-4">
    <div class="flex items-center gap-2 mb-4">
      <div class="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      </div>
      <h2 class="text-lg text-white font-semibold">{{ t('memberManagement') }}</h2>
    </div>

    <div class="flex gap-2 mb-4">
      <input
        :value="newMember"
        @input="$emit('update:newMember', ($event.target as HTMLInputElement).value)"
        type="text"
        :placeholder="t('memberName')"
        class="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        @keyup.enter="$emit('add-member')"
      />
      <button
        @click="$emit('add-member')"
        class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>

    <div class="space-y-2">
      <div
        v-for="member in members"
        :key="member"
        class="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 border border-white/10"
      >
        <span class="text-white">{{ member }}</span>
        <button
          @click="$emit('remove-member', member)"
          class="text-red-400 hover:text-red-300 p-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  members: string[]
  newMember: string
  t: (key: string) => string
}>()

defineEmits<{
  (e: 'update:newMember', val: string): void
  (e: 'add-member'): void
  (e: 'remove-member', member: string): void
}>()
</script>



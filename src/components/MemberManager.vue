<template>
  <section class="bg-white p-4 rounded shadow">
    <h2 class="text-lg font-semibold mb-2">👥 成員管理</h2>
    <div class="flex flex-wrap gap-2 mb-2">
      <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded" v-for="member in members" :key="member">{{ member }}</span>
    </div>
    <div class="flex gap-2">
      <input v-model="localNewMember" type="text" placeholder="輸入新成員" class="border p-2 flex-1 rounded" />
      <button @click="emitAddMember" class="bg-blue-500 text-white px-4 py-2 rounded">新增</button>
    </div>
  </section>
</template>
<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  members: Array,
  newMember: String
})
const emit = defineEmits(['add-member'])
const localNewMember = ref(props.newMember)
watch(() => props.newMember, val => localNewMember.value = val)
function emitAddMember() {
  emit('add-member', localNewMember.value)
  localNewMember.value = ''
}
</script> 
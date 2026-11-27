import { ref, computed } from 'vue'
import { defaultTrip, loadTrip, makeId, saveTrip } from '../lib/storage'

const data = ref(loadTrip())
const members = computed(() => data.value.trip.members)
const expenses = computed(() => data.value.trip.expenses)

function persist() {
  data.value.trip.updatedAt = new Date().toISOString()
  saveTrip(data.value)
}

export function useTrip() {
  function addMember(name) {
    const clean = name.trim()
    if (!clean || members.value.some(member => member.name === clean)) return false
    members.value.push({ id: makeId(), name: clean })
    persist()
    return true
  }
  function removeMember(id) {
    if (expenses.value.some(e => e.paidBy === id || e.sharedWith.includes(id))) return false
    const index = members.value.findIndex(member => member.id === id)
    if (index < 0) return false
    members.value.splice(index, 1)
    persist()
    return true
  }
  function addExpense({ amount, paidBy, description, sharedWith }) {
    const number = Number(amount)
    const ids = new Set(members.value.map(member => member.id))
    if (amount === '' || amount === null || !Number.isFinite(number) || number <= 0 ||
        !ids.has(paidBy) || !Array.isArray(sharedWith) || !sharedWith.length ||
        sharedWith.some(id => !ids.has(id))) return false
    expenses.value.push({ id: makeId(), amount: number, paidBy,
      sharedWith: [...new Set(sharedWith)], description: description || '',
      createdAt: new Date().toISOString() })
    persist()
    return true
  }
  function removeExpense(id) {
    const index = expenses.value.findIndex(expense => expense.id === id)
    if (index < 0) return
    expenses.value.splice(index, 1)
    persist()
  }
  function restoreDefaults() {
    data.value = defaultTrip()
    saveTrip(data.value)
  }
  return { data, members, expenses, addMember, removeMember, addExpense, removeExpense, restoreDefaults }
}

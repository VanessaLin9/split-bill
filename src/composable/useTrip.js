import { ref, computed } from 'vue'
import { CURRENCIES, SUPPORTED_CURRENCIES } from '../config/currencies'
import { getOfficialRate } from '../lib/fx'
import { defaultTrip, loadTrip, makeId, saveTrip } from '../lib/storage'

const data = ref(loadTrip())
const members = computed(() => data.value.trip.members)
const expenses = computed(() => data.value.trip.expenses)
const trip = computed(() => data.value.trip)
const valid = value => Number.isFinite(value) && value > 0
function persist() {
  data.value.trip.updatedAt = new Date().toISOString()
  saveTrip(data.value)
}
export function useTrip() {
  function addMember(name) {
    const clean = name.trim()
    if (!clean || members.value.some(member => member.name === clean)) return false
    members.value.push({ id: makeId(), name: clean }); persist(); return true
  }
  function removeMember(id) {
    if (expenses.value.some(e => e.paidBy === id || e.sharedWith.includes(id))) return false
    const index = members.value.findIndex(member => member.id === id)
    if (index < 0) return false
    members.value.splice(index, 1); persist(); return true
  }
  function addExpense({ amount, paidBy, description, sharedWith, currency }) {
    const number = Number(amount)
    const ids = new Set(members.value.map(member => member.id))
    const factor = 10 ** CURRENCIES[currency]
    const rate = getOfficialRate(currency, trip.value)
    if (amount === '' || amount === null || !valid(number) || !Number.isInteger(Math.round(number * factor * 1e8) / 1e8) || !valid(rate) ||
      !SUPPORTED_CURRENCIES.includes(currency) || !ids.has(paidBy) ||
      !Array.isArray(sharedWith) || !sharedWith.length || sharedWith.some(id => !ids.has(id))) return false
    expenses.value.push({ id: makeId(), amount: number, currency, fxRate: rate,
      fxSource: currency === trip.value.baseCurrency ? 'base' : 'official',
      amountInBase: Number((number * rate).toPrecision(10)), paidBy,
      sharedWith: [...new Set(sharedWith)], description: description || '', createdAt: new Date().toISOString() })
    persist(); return true
  }
  function removeExpense(id) {
    const index = expenses.value.findIndex(expense => expense.id === id)
    if (index < 0) return
    expenses.value.splice(index, 1); persist()
  }
  function applyOfficialRates(result) {
    let changed = false
    for (const code of SUPPORTED_CURRENCIES) {
      if (code === trip.value.baseCurrency || !valid(result.rates[code])) continue
      trip.value.fxRates[code] = { rate: result.rates[code], source: 'official',
        updatedAt: result.fetchedAt, officialDate: result.date }
      changed = true
    }
    if (changed) persist()
    return changed
  }
  function restoreDefaults() { data.value = defaultTrip(); saveTrip(data.value) }
  return { data, trip, members, expenses, addMember, removeMember, addExpense, removeExpense,
    applyOfficialRates, restoreDefaults }
}

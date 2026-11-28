import { ref, computed } from 'vue'
import { CURRENCIES } from '../config/currencies'
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
  function addExpense({ amount, paidBy, description, sharedWith, currency, overrideRate }) {
    const number = Number(amount)
    const ids = new Set(members.value.map(member => member.id))
    const rateEntry = trip.value.fxRates[currency]
    const factor = 10 ** CURRENCIES[currency]
    const override = overrideRate !== '' && overrideRate !== null && overrideRate !== undefined
    const rate = currency === trip.value.baseCurrency ? 1 : override ? Number(overrideRate) : rateEntry?.rate
    if (amount === '' || amount === null || !valid(number) || !Number.isInteger(Math.round(number * factor * 1e8) / 1e8) || !valid(rate) ||
      !(currency in CURRENCIES) || !trip.value.currencies.includes(currency) ||
      (currency === trip.value.baseCurrency && override) || !ids.has(paidBy) ||
      !Array.isArray(sharedWith) || !sharedWith.length || sharedWith.some(id => !ids.has(id))) return false
    expenses.value.push({ id: makeId(), amount: number, currency, fxRate: rate,
      fxSource: currency === trip.value.baseCurrency ? 'base' : override ? 'override' : rateEntry.source,
      amountInBase: Number((number * rate).toPrecision(10)), paidBy,
      sharedWith: [...new Set(sharedWith)], description: description || '', createdAt: new Date().toISOString() })
    persist(); return true
  }
  function removeExpense(id) {
    const index = expenses.value.findIndex(expense => expense.id === id)
    if (index < 0) return
    expenses.value.splice(index, 1); persist()
  }
  function setBaseCurrency(code) {
    if (expenses.value.length || !(code in CURRENCIES)) return false
    trip.value.baseCurrency = code
    trip.value.currencies = [...new Set([code, ...trip.value.currencies])]
    trip.value.fxRates = {}
    persist(); return true
  }
  function toggleCurrency(code) {
    if (!(code in CURRENCIES) || code === trip.value.baseCurrency || expenses.value.some(e => e.currency === code)) return false
    const index = trip.value.currencies.indexOf(code)
    if (index < 0) trip.value.currencies.push(code)
    else trip.value.currencies.splice(index, 1)
    persist(); return true
  }
  function setRate(code, rate, source = 'manual', officialDate) {
    const number = Number(rate)
    if (code === trip.value.baseCurrency || !trip.value.currencies.includes(code) || !valid(number)) return false
    trip.value.fxRates[code] = { rate: number, source, updatedAt: new Date().toISOString(),
      ...(officialDate ? { officialDate } : {}) }
    persist(); return true
  }
  function applyOfficialRates(result, overwriteManual = false) {
    let changed = false
    for (const code of trip.value.currencies) {
      if (code === trip.value.baseCurrency || !valid(result.rates[code]) ||
        (trip.value.fxRates[code]?.source === 'manual' && !overwriteManual)) continue
      trip.value.fxRates[code] = { rate: result.rates[code], source: 'official',
        updatedAt: result.fetchedAt, officialDate: result.date }
      changed = true
    }
    if (changed) persist()
    return changed
  }
  function applyCurrentRatesToExpenses() {
    for (const expense of expenses.value) {
      if (expense.fxSource === 'override') continue
      const entry = trip.value.fxRates[expense.currency]
      const rate = expense.currency === trip.value.baseCurrency ? 1 : entry?.rate
      if (!valid(rate)) continue
      expense.fxRate = rate
      expense.fxSource = entry?.source || 'base'
      expense.amountInBase = Number((expense.amount * rate).toPrecision(10))
    }
    persist()
  }
  function restoreDefaults() { data.value = defaultTrip(); saveTrip(data.value) }
  return { data, trip, members, expenses, addMember, removeMember, addExpense, removeExpense,
    setBaseCurrency, toggleCurrency, setRate, applyOfficialRates, applyCurrentRatesToExpenses, restoreDefaults }
}

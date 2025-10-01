import { ref } from 'vue'

export function useExpenses() {
  const expenses = ref(JSON.parse(localStorage.getItem('expenses') || '[]'))

  const addExpense = (payload) => {
    const { amount, paidBy, description, sharedWith } = payload
    if (!amount || !paidBy || !sharedWith || sharedWith.length === 0) {
      return false
    }
    expenses.value.push({
      amount: Number(amount),
      paidBy,
      description,
      sharedWith: [...sharedWith]
    })
    localStorage.setItem('expenses', JSON.stringify(expenses.value))
    return true
  }

  const removeExpense = (index) => {
    expenses.value.splice(index, 1)
    localStorage.setItem('expenses', JSON.stringify(expenses.value))
  }

  const clearExpenses = () => {
    expenses.value = []
    localStorage.setItem('expenses', JSON.stringify(expenses.value))
  }

  return {
    expenses,
    addExpense,
    removeExpense,
    clearExpenses,
  }
}

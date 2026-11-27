export function getTotal(expenses) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0)
}

export function getOwedBreakdown(expenses) {
  const owed = {}
  for (const expense of expenses) {
    const share = expense.amount / expense.sharedWith.length
    for (const id of expense.sharedWith) owed[id] = (owed[id] || 0) + share
  }
  return owed
}

export function getFinalSettlements(expenses) {
  const balances = new Map()
  for (const expense of expenses) {
    const share = expense.amount / expense.sharedWith.length
    for (const debtor of expense.sharedWith) {
      if (debtor === expense.paidBy) continue
      const pair = [debtor, expense.paidBy].sort()
      const key = JSON.stringify(pair)
      const direction = debtor === pair[0] ? 1 : -1
      balances.set(key, (balances.get(key) || 0) + direction * share)
    }
  }
  const grouped = {}
  for (const [key, balance] of balances) {
    const amount = Math.round(Math.abs(balance) * 100) / 100
    if (!amount) continue
    const [a, b] = JSON.parse(key)
    const from = balance > 0 ? a : b
    const to = balance > 0 ? b : a
    ;(grouped[from] ??= []).push({ from, to, amount })
  }
  return grouped
}

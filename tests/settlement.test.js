import { describe, expect, it } from 'vitest'
import { getTotal, getOwedBreakdown, getFinalSettlements } from '../src/lib/settlement'
import { roundToCurrency, toDisplay } from '../src/lib/money'
const expense = (amount, paidBy, sharedWith, rate = 1) => ({ amount, paidBy, sharedWith, amountInBase: amount * rate, fxRate: rate })
describe('settlement', () => {
  it('uses base amounts for mixed currencies and override snapshots', () => {
    const expenses = [expense(50000, 'a', ['a', 'b'], 0.024), expense(1000, 'b', ['a', 'b'])]
    expect(getTotal(expenses)).toBe(2200)
    expect(getOwedBreakdown(expenses)).toEqual({ a: 1100, b: 1100 })
    expect(getFinalSettlements(expenses)).toEqual({ b: [{ from: 'b', to: 'a', amount: 100 }] })
    const trip = { baseCurrency: 'TWD', fxRates: { KRW: { rate: 0.024 } } }
    const twd = roundToCurrency(100, 'TWD')
    const krw = roundToCurrency(toDisplay(100, 'KRW', trip), 'KRW')
    expect(Math.abs(krw - toDisplay(twd, 'KRW', trip))).toBeLessThanOrEqual(1)
    expenses[0].fxRate = 0.03 // a changed trip rate cannot alter amountInBase
    expect(getTotal(expenses)).toBe(2200)
  })
  it('keeps unrounded balances until display', () => {
    expect(getFinalSettlements([expense(10, 'a', ['b']), expense(4.555, 'b', ['a'])]).b[0].amount).toBeCloseTo(5.445)
  })
  it('nets fully settled pairs to empty', () => {
    expect(getFinalSettlements([expense(10, 'a', ['b']), expense(10, 'b', ['a'])])).toEqual({})
  })
})

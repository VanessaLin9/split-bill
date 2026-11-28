import { describe, expect, it } from 'vitest'
import { roundToCurrency, roundShares, splitAmount, formatMoney } from '../src/lib/money'
import { CURRENCIES, SUPPORTED_CURRENCIES } from '../src/config/currencies'
describe('money', () => {
  it('rounds by currency minor digits', () => {
    expect(roundToCurrency(1.6, 'TWD')).toBe(2)
    expect(roundToCurrency(1.6, 'KRW')).toBe(2)
    expect(roundToCurrency(1.234, 'USD')).toBe(1.23)
  })
  it.each([['TWD', 100, [34, 33, 33]], ['KRW', 10000, [3334, 3333, 3333]], ['USD', 10, [3.34, 3.33, 3.33]]])('splits %s exactly', (code, amount, expected) => {
    expect(splitAmount(amount, 3, code)).toEqual(expected)
  })
  it('formats all supported currencies', () => {
    for (const code of SUPPORTED_CURRENCIES) expect(() => formatMoney(1234.56, code)).not.toThrow()
  })
})

describe('roundShares', () => {
  it.each(['TWD', 'KRW', 'USD'])('preserves the rounded total in %s minor units', code => {
    const factor = 10 ** CURRENCIES[code]
    for (const amounts of [[100 / 3, 100 / 3, 100 / 3], [2 / 3, 2 / 3, 2 / 3], [1.2, 2.7, 3.4]]) {
      const rounded = roundShares(amounts, code)
      const units = rounded.map(amount => Math.round(amount * factor))
      expect(units.reduce((sum, amount) => sum + amount, 0))
        .toBe(Math.round(roundToCurrency(amounts.reduce((sum, amount) => sum + amount, 0), code) * factor))
      for (const amount of rounded) expect(amount).toBe(roundToCurrency(amount, code))
    }
  })
  it('allocates by largest remainder and breaks equal remainders by input order', () => {
    const amounts = [1.8, 2.7, 3.4]
    expect(roundShares(amounts, 'TWD')).toEqual([2, 3, 3])
    expect(amounts).toEqual([1.8, 2.7, 3.4])
    const equalShares = [1 / 3, 1 / 3, 1 / 3]
    for (let i = 0; i < 3; i++) {
      expect(roundShares(equalShares, 'TWD')).toEqual([1, 0, 0])
      expect(roundShares(equalShares, 'KRW')).toEqual([1, 0, 0])
      expect(roundShares(equalShares, 'USD')).toEqual([0.34, 0.33, 0.33])
    }
    expect(roundShares([2 / 3, 2 / 3, 2 / 3], 'TWD')).toEqual([1, 1, 0])
  })
  it.each(['TWD', 'KRW', 'USD'])('handles empty, zero and single-member shares in %s', code => {
    expect(roundShares([], code)).toEqual([])
    expect(roundShares([0, 0, 0], code)).toEqual([0, 0, 0])
    expect(roundShares([0], code)).toEqual([0])
    expect(roundShares([12.345], code)).toEqual([roundToCurrency(12.345, code)])
  })
})

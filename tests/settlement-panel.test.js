import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import SettlementPanel from '../src/components/SettlementPanel.vue'
import { formatMoney } from '../src/lib/money'
import { getTotal, getOwedBreakdown, getFinalSettlements } from '../src/lib/settlement'

async function renderPanel(displayCurrency, fxRates = { KRW: { rate: 0.024, source: 'official' }, USD: { rate: 32, source: 'official' } }) {
  const members = ['a', 'b', 'c'].map(id => ({ id, name: id }))
  const expenses = [{ amount: 2, amountInBase: 2, currency: 'TWD', paidBy: 'a', sharedWith: ['a', 'b', 'c'] }]
  return renderToString(createSSRApp(SettlementPanel, {
    members, expenses, trip: { baseCurrency: 'TWD', currencies: ['TWD', 'KRW', 'USD'], fxRates },
    displayCurrency, totalExpenses: getTotal(expenses), expenseBreakdown: getOwedBreakdown(expenses),
    finalSettlements: getFinalSettlements(expenses), memberNames: { a: 'a', b: 'b', c: 'c' }, t: key => key,
  }))
}

function shouldPayAmounts(html) {
  const section = html.split('shouldPay')[1].split('finalSettlement')[0]
  return [...section.matchAll(/<span[^>]*>([^<]*)<\/span>/g)]
    .filter((_, index) => index % 2 === 1).map(match => match[1])
}

describe('SettlementPanel', () => {
  it.each([
    ['TWD', [1, 1, 0], 2, 1],
    ['KRW', [28, 28, 27], 83, 28],
    ['USD', [0.02, 0.02, 0.02], 0.06, 0.02],
  ])('allocates shares after conversion to %s and rounds payments individually', async (code, shares, total, payment) => {
    const html = await renderPanel(code)
    expect(shouldPayAmounts(html)).toEqual(shares.map(amount => formatMoney(amount, code)))
    expect(html.split('shouldPay')[0]).toContain(formatMoney(total, code))
    const payments = html.split('finalSettlement')[1]
    expect(payments.split(formatMoney(payment, code))).toHaveLength(3)
  })

  it('falls back to base currency when the requested display currency has no rate', async () => {
    const html = await renderPanel('KRW', {})
    expect(shouldPayAmounts(html)).toEqual([1, 1, 0].map(amount => formatMoney(amount, 'TWD')))
    expect(html.split('shouldPay')[0]).toContain(formatMoney(2, 'TWD'))
    expect(html.split('finalSettlement')[1].split(formatMoney(1, 'TWD'))).toHaveLength(3)
  })
})

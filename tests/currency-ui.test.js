import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import AddExpensePanel from '../src/components/AddExpensePanel.vue'
import ExpensesPanel from '../src/components/ExpensesPanel.vue'
import OfficialRates from '../src/components/OfficialRates.vue'
import { translations } from '../src/config/translation'
import { SUPPORTED_CURRENCIES } from '../src/config/currencies'
import { tabs } from '../src/config/tabs'
import { formatMoney } from '../src/lib/money'

const t = language => key => translations[language][key]
const render = (component, props) => renderToString(createSSRApp(component, props))
const trip = { baseCurrency: 'TWD', currencies: ['TWD', 'KRW'], fxRates: {
  KRW: { rate: 0.025, source: 'official', updatedAt: '2026-11-28T12:00:00Z', officialDate: '2026-11-27' },
} }
const expense = { id: 'one', amount: 50000, currency: 'KRW', fxRate: 0.02326,
  fxSource: 'official', amountInBase: 1163, paidBy: 'a', sharedWith: ['a', 'b'] }
const expenseProps = { trip, memberNames: { a: 'A', b: 'B' } }

describe('simplified currency UI', () => {
  it.each(['zh', 'en'])('shows only the entered amount as primary, with an approximate TWD line in %s', async language => {
    const html = await render(ExpensesPanel, { ...expenseProps, expenses: [expense], t: t(language) })
    const header = html.split('<button')[0]
    expect(header).toContain(formatMoney(50000, 'KRW'))
    expect(header).not.toContain('NT$')
    // Uses the saved snapshot (1163), not the refreshed rate (1250).
    const approximate = t(language)('approximateAmount').replace('{amount}', formatMoney(1163, 'TWD'))
    expect(html).toContain(`<p class="text-xs text-blue-200 mb-2">${approximate}</p>`)
    expect(html).not.toContain(formatMoney(1250, 'TWD'))
    expect(html).not.toContain('1 KRW =')
    expect(html).toContain(`A → A: ${formatMoney(25000, 'KRW')}`)
    expect(html).toContain(`B → A: ${formatMoney(25000, 'KRW')}`)
  })

  it('shows no estimate for TWD, even when the trip base is not TWD', async () => {
    const html = await render(ExpensesPanel, { ...expenseProps, t: t('en'),
      trip: { ...trip, baseCurrency: 'KRW', fxRates: {} },
      expenses: [{ ...expense, currency: 'TWD', amount: 1000, amountInBase: 40000 }],
    })
    expect(html).toContain(formatMoney(1000, 'TWD'))
    expect(html).not.toContain('approx.')
    expect(html).not.toContain('<p ')
  })

  it('converts a saved base amount to TWD using official rates for an existing non-TWD base', async () => {
    const html = await render(ExpensesPanel, { ...expenseProps, t: t('en'), expenses: [expense],
      trip: { baseCurrency: 'USD', fxRates: { TWD: { rate: 1 / 32, source: 'official' } } },
    })
    expect(html).toContain(`approx. ${formatMoney(expense.amountInBase * 32, 'TWD')}`)
  })

  it('does not invent an approximate TWD amount if conversion has no official rate', async () => {
    const html = await render(ExpensesPanel, { ...expenseProps, t: t('en'), expenses: [expense],
      trip: { baseCurrency: 'KRW', fxRates: {} },
    })
    expect(html).toContain(t('en')('approximateTwdUnavailable'))
    expect(html).not.toContain('NT$')
  })

  it.each(['zh', 'en'])('offers every supported currency and blocks submission without an official rate in %s', async language => {
    const props = { members: [], amount: '', paidBy: '', description: '', sharedWith: [],
      currency: 'USD', trip, t: t(language) }
    const html = await render(AddExpensePanel, props)
    for (const code of SUPPORTED_CURRENCIES) expect(html).toContain(`<option>${code}</option>`)
    expect(html).toContain(t(language)('noRateForExpense'))
    expect(html).toMatch(/<button[^>]*\sdisabled(?:[=>\s])/)
    const baseHtml = await render(AddExpensePanel, { ...props, currency: 'TWD' })
    expect(baseHtml).not.toMatch(/<button[^>]*\sdisabled(?:[=>\s])/)
    const officialHtml = await render(AddExpensePanel, { ...props, currency: 'KRW' })
    expect(officialHtml).not.toMatch(/<button[^>]*\sdisabled(?:[=>\s])/)
    expect(officialHtml).not.toContain(t(language)('noRateForExpense'))
  })

  it('shows a compact reference rate, date, refresh, and translated stale status', async () => {
    const html = await render(OfficialRates, { trip, t: t('en'), status: 'staleRates', loading: false })
    expect(html).toContain('1 KRW = 0.025 TWD')
    expect(html).toContain('Updated: 2026-11-27')
    expect(html).toContain(t('en')('staleRates'))
    expect(html).toContain(t('en')('referenceRates'))
    expect(html).toContain(t('en')('refreshRates'))
  })

  it('keeps the four main mobile tabs', () => {
    expect(tabs.map(tab => tab.key)).toEqual(['members', 'add', 'expenses', 'settlement'])
  })
})

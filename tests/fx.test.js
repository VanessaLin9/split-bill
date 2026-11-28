import { describe, expect, it, vi } from 'vitest'
import { fetchOfficialRates, FX_CACHE_KEY } from '../src/lib/fx'
const date = new Date('2026-11-27T12:00:00Z')
const storage = () => { const map = new Map(); return { getItem: key => map.get(key) || null, setItem: (key, value) => map.set(key, value) } }
const response = json => ({ ok: true, json: async () => json })
const rows = ['KRW', 'USD', 'JPY', 'EUR'].map(quote => ({ base: 'TWD', quote, rate: quote === 'KRW' ? 40 : 2, date: '2026-11-27' }))
const fallback = { date: '2026-11-27', twd: { krw: 40, usd: 2, jpy: 4, eur: 3 } }
describe('official rates', () => {
  it('uses Frankfurter v2 and inverts quote per base', async () => {
    const fetcher = vi.fn(async () => response(rows))
    const result = await fetchOfficialRates('TWD', { fetcher, storage: storage(), now: date })
    expect(fetcher.mock.calls[0][0]).toContain('api.frankfurter.dev/v2/rates')
    expect(result.rates.KRW).toBe(0.025)
  })
  it('falls back to jsDelivr, then pages.dev', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('down')).mockRejectedValueOnce(new Error('down')).mockResolvedValue(response(fallback))
    const result = await fetchOfficialRates('TWD', { fetcher, storage: storage(), now: date })
    expect(fetcher.mock.calls[1][0]).toContain('cdn.jsdelivr.net')
    expect(fetcher.mock.calls[2][0]).toContain('latest.currency-api.pages.dev')
    expect(result.rates.KRW).toBe(0.025)
  })
  it('uses jsDelivr when Frankfurter fails', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValue(response(fallback))
    expect((await fetchOfficialRates('TWD', { fetcher, storage: storage(), now: date })).provider).toContain('jsDelivr')
  })
  it('uses same-day cache without refetch and stale cache after failures', async () => {
    const store = storage()
    await fetchOfficialRates('TWD', { fetcher: async () => response(rows), storage: store, now: date })
    const fetcher = vi.fn().mockRejectedValue(new Error('down'))
    expect((await fetchOfficialRates('TWD', { fetcher, storage: store, now: date })).cached).toBe(true)
    expect(fetcher).not.toHaveBeenCalled()
    const stale = await fetchOfficialRates('TWD', { fetcher, storage: store, force: true, now: date })
    expect(stale.stale).toBe(true)
    expect(stale.date).toBe('2026-11-27')
    expect(JSON.parse(store.getItem(FX_CACHE_KEY)).TWD.rates.KRW).toBe(0.025)
  })
  it('errors without cache; rejects invalid and incomplete rates', async () => {
    const fetcher = vi.fn().mockResolvedValue(response([{ base: 'TWD', quote: 'KRW', rate: 0 }]))
    await expect(fetchOfficialRates('TWD', { fetcher, storage: storage(), now: date })).rejects.toThrow()
    expect(fetcher).toHaveBeenCalledTimes(3)
  })
})

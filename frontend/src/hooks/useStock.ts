import { useState, useCallback } from 'react'
import { fetchStock, generateInsights, fetchStockInfo } from '../api/stocks'
import type { MonthlyBar } from '../types'

export interface StockInfo {
  name: string
  sector: string
  market_cap: number
  pe_ratio: number
  "52w_high": number
  "52w_low": number
  currency: string
}

function getErrorMessage(error: any) {
  const responseData = error?.response?.data
  if (typeof responseData === 'string' && responseData.trim()) return responseData
  if (typeof responseData?.detail === 'string' && responseData.detail.trim()) return responseData.detail
  if (typeof error?.message === 'string' && error.message.trim()) return error.message
  return 'Failed to fetch data'
}

export function useStock() {
  const [data, setData] = useState<MonthlyBar[]>([])
  const [ticker, setTicker] = useState('')
  const [info, setInfo] = useState<StockInfo | null>(null)
  const [aiInsights, setAiInsights] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (
    t: string, period = '1y', source = 'yahoo'
  ) => {
    setLoading(true)
    setError(null)
    setAiInsights('')
    setInfo(null)
    try {
      const res = await fetchStock(t, period, source)
      setData(res.data)
      setTicker(t)

      // fetch company info + AI insights in parallel
      setAiLoading(true)
      const [infoRes, insightRes] = await Promise.allSettled([
        fetchStockInfo(t),
        generateInsights(t, res.data),
      ])
      if (infoRes.status === 'fulfilled') setInfo(infoRes.value)
      if (insightRes.status === 'fulfilled') setAiInsights(insightRes.value.insights)
    } catch (e: any) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
      setAiLoading(false)
    }
  }, [])

  return { data, ticker, info, aiInsights, loading, aiLoading, error, load }
}

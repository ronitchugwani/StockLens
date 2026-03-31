import { useState, useCallback } from 'react'
import { compareStocks } from '../api/stocks'

export interface CompareData {
  [ticker: string]: {
    month: string
    close: number
    open: number
    high: number
    low: number
    vol: number
  }[]
}

export function useCompare() {
  const [data, setData] = useState<CompareData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (tickers: string[], period = '1y') => {
    setLoading(true)
    setError(null)
    try {
      const res = await compareStocks(tickers, period)
      setData(res.data)
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Failed to fetch comparison data')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, load }
}

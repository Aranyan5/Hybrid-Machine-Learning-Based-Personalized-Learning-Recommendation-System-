import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/services/api'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useApi<T>(url: string, dependencies: any[] = []) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }))
        const response = await apiClient.get<T>(url)
        setState({ data: response.data, loading: false, error: null })
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        })
      }
    }

    fetchData()
  }, dependencies)

  return state
}

export function useMutation<T>(fn: (...args: any[]) => Promise<T>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true)
        setError(null)
        const result = await fn(...args)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [fn]
  )

  return { mutate, loading, error }
}

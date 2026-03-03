import axios, { AxiosInstance, AxiosError } from 'axios'
import { APIResponse } from '@/types'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

class APIClient {
  private client: AxiosInstance

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('learner_id')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, params?: Record<string, any>) {
    const response = await this.client.get<APIResponse<T>>(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: Record<string, any>) {
    const response = await this.client.post<APIResponse<T>>(url, data)
    return response.data
  }

  async put<T>(url: string, data?: Record<string, any>) {
    const response = await this.client.put<APIResponse<T>>(url, data)
    return response.data
  }

  async delete<T>(url: string) {
    const response = await this.client.delete<APIResponse<T>>(url)
    return response.data
  }
}

export const apiClient = new APIClient(API_BASE_URL)

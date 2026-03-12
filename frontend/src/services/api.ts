import axios from 'axios'
import type { Attendance, Employee } from '../types/hrms'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const hrmsApi = {
  async listEmployees() {
    const { data } = await api.get<Employee[]>('/employees')
    return data
  },

  async createEmployee(payload: {
    employee_id: string
    full_name: string
    email: string
    department: string
  }) {
    const { data } = await api.post<Employee>('/employees', payload)
    return data
  },

  async deleteEmployee(employeeId: number) {
    await api.delete(`/employees/${employeeId}`)
  },

  async markAttendance(payload: {
    employee_id: number
    date: string
    status: 'Present' | 'Absent'
  }) {
    const { data } = await api.post<Attendance>('/attendance', payload)
    return data
  },

  async listAttendance(employeeId: number) {
    const { data } = await api.get<Attendance[]>('/attendance', {
      params: { employee_id: employeeId }
    })
    return data
  }
}

export function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail || 'Request failed.'
  }
  return 'Something went wrong.'
}

export type Employee = {
  id: number
  employee_id: string
  full_name: string
  email: string
  department: string
}

export type Attendance = {
  id: number
  employee_id: number
  date: string
  status: 'Present' | 'Absent'
}

export type Summary = {
  total_employees: number
  present_today: number
  absent_today: number
  total_departments: number
}

export type ApiError = {
  detail: string
}

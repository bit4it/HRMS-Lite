import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { hrmsApi, parseApiError } from '../services/api'
import type { Employee } from '../types/hrms'

const initialForm = {
  employee_id: '',
  full_name: '',
  email: '',
  department: '',
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function fetchEmployees() {
    setLoading(true)
    try {
      const data = await hrmsApi.listEmployees()
      setEmployees(data)
    } catch (e) {
      setError(parseApiError(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await hrmsApi.createEmployee(form)
      setForm(initialForm)
      setSuccess('Employee added successfully.')
      await fetchEmployees()
    } catch (e) {
      setError(parseApiError(e))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This will also remove all their attendance records.`)) return
    setError('')
    setSuccess('')
    try {
      await hrmsApi.deleteEmployee(id)
      setSuccess('Employee deleted successfully.')
      await fetchEmployees()
    } catch (e) {
      setError(parseApiError(e))
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Employees</h2>
        <p>Add, view and manage your workforce</p>
      </div>

      <div className="two-col">
        {/* Add Form */}
        <div className="card">
          <div className="card-header">
            <h3>Add New Employee</h3>
          </div>

          {error && <div className="msg msg-error">{error}</div>}
          {success && <div className="msg msg-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input
                required
                placeholder="e.g. EMP001"
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                required
                placeholder="e.g. John Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                required
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                required
                placeholder="e.g. Engineering"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Employee'}
            </button>
          </form>
        </div>

        {/* Employee List */}
        <div className="card">
          <div className="card-header">
            <h3>All Employees</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
              {employees.length} total
            </span>
          </div>

          {loading ? (
            <p className="loader">Loading employees...</p>
          ) : employees.length === 0 ? (
            <p className="msg-empty">No employees found. Add one to get started.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 600, color: '#6366f1', fontSize: '0.82rem' }}>
                      {emp.employee_id}
                    </td>
                    <td style={{ fontWeight: 500 }}>{emp.full_name}</td>
                    <td style={{ color: '#64748b', fontSize: '0.84rem' }}>{emp.email}</td>
                    <td>
                      <span className="dept-tag">{emp.department}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(emp.id, emp.full_name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

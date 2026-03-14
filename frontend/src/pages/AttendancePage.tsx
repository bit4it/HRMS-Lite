import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { hrmsApi, parseApiError } from '../services/api'
import type { Attendance, Employee } from '../types/hrms'

const today = new Date().toISOString().slice(0, 10)

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [date, setDate] = useState(today)
  const [statusValue, setStatusValue] = useState<'Present' | 'Absent'>('Present')
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadEmployees() {
      setLoadingEmployees(true)
      try {
        const data = await hrmsApi.listEmployees()
        setEmployees(data)
        if (data.length > 0) setSelectedEmployeeId(data[0].id)
      } catch (e) {
        setError(parseApiError(e))
      } finally {
        setLoadingEmployees(false)
      }
    }
    loadEmployees()
  }, [])

  useEffect(() => {
    if (!selectedEmployeeId) {
      setAttendanceList([])
      return
    }
    async function loadAttendance() {
      setLoadingAttendance(true)
      try {
        const data = await hrmsApi.listAttendance(selectedEmployeeId!)
        setAttendanceList(data)
      } catch (e) {
        setError(parseApiError(e))
        setAttendanceList([])
      } finally {
        setLoadingAttendance(false)
      }
    }
    loadAttendance()
  }, [selectedEmployeeId])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedEmployeeId) return

    if (date > today) {
      setError('Cannot mark attendance for a future date.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await hrmsApi.markAttendance({
        employee_id: selectedEmployeeId,
        date,
        status: statusValue,
      })
      setSuccess('Attendance marked successfully.')
      const data = await hrmsApi.listAttendance(selectedEmployeeId)
      setAttendanceList(data)
    } catch (e) {
      setError(parseApiError(e))
    } finally {
      setSubmitting(false)
    }
  }

  const selectedEmployee = employees.find((emp) => emp.id === selectedEmployeeId)
  const presentCount = attendanceList.filter((a) => a.status === 'Present').length
  const absentCount = attendanceList.filter((a) => a.status === 'Absent').length

  return (
    <div>
      <div className="page-header">
        <h2>Attendance</h2>
        <p>Track and manage daily employee attendance</p>
      </div>

      <div className="two-col">
        {/* Mark Attendance Form */}
        <div className="card">
          <div className="card-header">
            <h3>Mark Attendance</h3>
          </div>

          {error && <div className="msg msg-error">{error}</div>}
          {success && <div className="msg msg-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Employee</label>
              {loadingEmployees ? (
                <select disabled>
                  <option>Loading employees...</option>
                </select>
              ) : (
                <select
                  value={selectedEmployeeId ?? ''}
                  onChange={(e) => {
                    setError('')
                    setSuccess('')
                    setSelectedEmployeeId(Number(e.target.value))
                  }}
                  disabled={employees.length === 0}
                >
                  {employees.length === 0 ? (
                    <option value="">No employees available</option>
                  ) : (
                    employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.employee_id})
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                required
                value={date}
                max={today}
                onChange={(e) => {
                  setError('')
                  setDate(e.target.value)
                }}
              />
              {date === today && (
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Today</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value as 'Present' | 'Absent')}
              >
                <option value="Present">✓ Present</option>
                <option value="Absent">✗ Absent</option>
              </select>
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={!selectedEmployee || submitting || employees.length === 0}
            >
              {submitting ? 'Saving...' : 'Mark Attendance'}
            </button>
          </form>
        </div>

        {/* Attendance Records */}
        <div className="card">
          <div className="card-header">
            <h3>
              {selectedEmployee ? `${selectedEmployee.full_name}'s Records` : 'Attendance Records'}
            </h3>
            {selectedEmployee && attendanceList.length > 0 && (
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="badge badge-present">{presentCount}P</span>
                <span className="badge badge-absent">{absentCount}A</span>
              </div>
            )}
          </div>

          {loadingAttendance ? (
            <p className="loader">Loading records...</p>
          ) : attendanceList.length === 0 ? (
            <p className="msg-empty">No attendance records found for this employee.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((record) => (
                  <tr key={record.id}>
                    <td style={{ color: '#374151' }}>{formatDisplayDate(record.date)}</td>
                    <td>
                      <span
                        className={
                          record.status === 'Present' ? 'badge badge-present' : 'badge badge-absent'
                        }
                      >
                        {record.status}
                      </span>
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

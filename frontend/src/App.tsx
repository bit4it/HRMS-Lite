import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import Loader from './components/Loader'
import SectionCard from './components/SectionCard'
import StatusMessage from './components/StatusMessage'
import { hrmsApi, parseApiError } from './services/api'
import type { Attendance, Employee } from './types/hrms'

const initialEmployeeForm = {
  employee_id: '',
  full_name: '',
  email: '',
  department: ''
}

const today = new Date().toISOString().slice(0, 10)

function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([])

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)

  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [submittingEmployee, setSubmittingEmployee] = useState(false)
  const [submittingAttendance, setSubmittingAttendance] = useState(false)

  const [employeeForm, setEmployeeForm] = useState(initialEmployeeForm)
  const [attendanceDate, setAttendanceDate] = useState(today)
  const [attendanceStatus, setAttendanceStatus] = useState<'Present' | 'Absent'>('Present')

  const [employeeError, setEmployeeError] = useState('')
  const [attendanceError, setAttendanceError] = useState('')
  const [uiMessage, setUiMessage] = useState('')

  const selectedEmployee = useMemo(
    () => employees.find((item) => item.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId]
  )

  async function fetchEmployees() {
    setLoadingEmployees(true)
    setEmployeeError('')
    try {
      const data = await hrmsApi.listEmployees()
      setEmployees(data)
      if (data.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(data[0].id)
      }
      if (data.length === 0) {
        setSelectedEmployeeId(null)
      }
    } catch (error) {
      setEmployeeError(parseApiError(error))
    } finally {
      setLoadingEmployees(false)
    }
  }

  async function fetchAttendance(employeeId: number) {
    setLoadingAttendance(true)
    setAttendanceError('')
    try {
      const data = await hrmsApi.listAttendance(employeeId)
      setAttendanceList(data)
    } catch (error) {
      setAttendanceError(parseApiError(error))
      setAttendanceList([])
    } finally {
      setLoadingAttendance(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (!selectedEmployeeId) {
      setAttendanceList([])
      return
    }
    fetchAttendance(selectedEmployeeId)
  }, [selectedEmployeeId])

  async function handleCreateEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmittingEmployee(true)
    setEmployeeError('')
    setUiMessage('')

    try {
      const created = await hrmsApi.createEmployee(employeeForm)
      setEmployeeForm(initialEmployeeForm)
      setUiMessage('Employee added successfully.')
      await fetchEmployees()
      setSelectedEmployeeId(created.id)
    } catch (error) {
      setEmployeeError(parseApiError(error))
    } finally {
      setSubmittingEmployee(false)
    }
  }

  async function handleDeleteEmployee(employeeId: number) {
    if (!confirm('Delete this employee?')) return

    setEmployeeError('')
    setUiMessage('')
    try {
      await hrmsApi.deleteEmployee(employeeId)
      setUiMessage('Employee deleted successfully.')
      await fetchEmployees()
    } catch (error) {
      setEmployeeError(parseApiError(error))
    }
  }

  async function handleMarkAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedEmployeeId) return

    setSubmittingAttendance(true)
    setAttendanceError('')
    setUiMessage('')

    try {
      await hrmsApi.markAttendance({
        employee_id: selectedEmployeeId,
        date: attendanceDate,
        status: attendanceStatus
      })
      setUiMessage('Attendance marked successfully.')
      await fetchAttendance(selectedEmployeeId)
    } catch (error) {
      setAttendanceError(parseApiError(error))
    } finally {
      setSubmittingAttendance(false)
    }
  }

  return (
    <main className="container">
      <header className="header">
        <h1>HRMS Lite</h1>
        <p>Employee and attendance management</p>
      </header>

      <div className="grid">
        <SectionCard title="Employee Management">
          <form className="form-grid" onSubmit={handleCreateEmployee}>
            <label>
              Employee ID
              <input
                required
                value={employeeForm.employee_id}
                onChange={(e) => setEmployeeForm({ ...employeeForm, employee_id: e.target.value })}
              />
            </label>
            <label>
              Full Name
              <input
                required
                value={employeeForm.full_name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, full_name: e.target.value })}
              />
            </label>
            <label>
              Email Address
              <input
                required
                type="email"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
              />
            </label>
            <label>
              Department
              <input
                required
                value={employeeForm.department}
                onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
              />
            </label>
            <button disabled={submittingEmployee} type="submit">
              {submittingEmployee ? 'Saving...' : 'Add Employee'}
            </button>
          </form>

          {employeeError && <StatusMessage variant="error" message={employeeError} />}
          {uiMessage && <StatusMessage variant="success" message={uiMessage} />}

          {loadingEmployees ? (
            <Loader />
          ) : employees.length === 0 ? (
            <StatusMessage variant="empty" message="No employees found." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.employee_id}</td>
                    <td>{employee.full_name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.department}</td>
                    <td>
                      <button className="danger" onClick={() => handleDeleteEmployee(employee.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>

        <SectionCard title="Attendance Management">
          <form className="form-grid" onSubmit={handleMarkAttendance}>
            <label>
              Employee
              <select
                value={selectedEmployeeId ?? ''}
                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                disabled={employees.length === 0}
              >
                {employees.length === 0 ? (
                  <option value="">No employee available</option>
                ) : (
                  employees.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.full_name} ({item.employee_id})
                    </option>
                  ))
                )}
              </select>
            </label>

            <label>
              Date
              <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} required />
            </label>

            <label>
              Status
              <select
                value={attendanceStatus}
                onChange={(e) => setAttendanceStatus(e.target.value as 'Present' | 'Absent')}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </label>

            <button type="submit" disabled={!selectedEmployee || submittingAttendance}>
              {submittingAttendance ? 'Saving...' : 'Mark Attendance'}
            </button>
          </form>

          {attendanceError && <StatusMessage variant="error" message={attendanceError} />}

          {selectedEmployee && <p className="hint">Showing attendance for: {selectedEmployee.full_name}</p>}

          {loadingAttendance ? (
            <Loader />
          ) : attendanceList.length === 0 ? (
            <StatusMessage variant="empty" message="No attendance records found." />
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
                    <td>{record.date}</td>
                    <td>
                      <span className={record.status === 'Present' ? 'badge present' : 'badge absent'}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      </div>
    </main>
  )
}

export default App

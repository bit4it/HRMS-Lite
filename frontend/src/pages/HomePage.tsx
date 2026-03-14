import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { hrmsApi, parseApiError } from '../services/api'
import type { Employee, Summary } from '../types/hrms'

const today = new Date().toISOString().slice(0, 10)

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function HomePage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [empData, sumData] = await Promise.all([
          hrmsApi.listEmployees(),
          hrmsApi.getSummary(),
        ])
        setRecentEmployees(empData.slice(0, 6))
        setSummary(sumData)
      } catch (e) {
        setError(parseApiError(e))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const attendanceRate =
    summary && summary.total_employees > 0
      ? Math.round((summary.present_today / summary.total_employees) * 100)
      : 0

  const rateColor =
    attendanceRate >= 75 ? '#16a34a' : attendanceRate >= 50 ? '#d97706' : '#dc2626'

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome back — {formatDate(today)}</p>
      </div>

      {error && <div className="msg msg-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon indigo">
            <UsersIcon />
          </div>
          <div className="stat-info">
            <h3>{loading ? '—' : summary?.total_employees ?? 0}</h3>
            <p>Total Employees</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <CheckIcon />
          </div>
          <div className="stat-info">
            <h3>{loading ? '—' : summary?.present_today ?? 0}</h3>
            <p>Present Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <XIcon />
          </div>
          <div className="stat-info">
            <h3>{loading ? '—' : summary?.absent_today ?? 0}</h3>
            <p>Absent Today</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <BriefcaseIcon />
          </div>
          <div className="stat-info">
            <h3>{loading ? '—' : summary?.total_departments ?? 0}</h3>
            <p>Departments</p>
          </div>
        </div>
      </div>

      <div className="recent-grid">
        <div className="card">
          <div className="card-header">
            <h3>Recent Employees</h3>
            <Link to="/employees" style={{ fontSize: '0.82rem', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
              View all →
            </Link>
          </div>
          {loading ? (
            <p className="loader">Loading...</p>
          ) : recentEmployees.length === 0 ? (
            <p className="msg-empty">No employees yet. <Link to="/employees" style={{ color: '#6366f1' }}>Add one →</Link></p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Emp ID</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {recentEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 500 }}>{emp.full_name}</td>
                    <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{emp.employee_id}</td>
                    <td><span className="dept-tag">{emp.department}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Today's Attendance Rate</h3>
            <Link to="/attendance" style={{ fontSize: '0.82rem', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
              Mark attendance →
            </Link>
          </div>
          <div className="rate-display">
            <div className="rate-number" style={{ color: loading ? '#94a3b8' : rateColor }}>
              {loading ? '—' : `${attendanceRate}%`}
            </div>
            <p className="rate-label">
              {loading
                ? 'Loading...'
                : summary
                ? `${summary.present_today} present out of ${summary.total_employees} employees`
                : 'No data'}
            </p>
            {!loading && summary && summary.total_employees > 0 && (
              <div style={{ marginTop: 16, width: '100%', maxWidth: 260 }}>
                <div style={{ background: '#f1f5f9', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${attendanceRate}%`,
                      height: '100%',
                      background: rateColor,
                      borderRadius: 999,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

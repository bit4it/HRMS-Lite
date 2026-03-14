import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import AttendancePage from './pages/AttendancePage'
import EmployeesPage from './pages/EmployeesPage'
import HomePage from './pages/HomePage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App

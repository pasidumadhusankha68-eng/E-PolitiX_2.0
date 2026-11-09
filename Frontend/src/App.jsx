import { Routes, Route, Outlet } from 'react-router-dom'
import Landing from './pages/landing.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Resources from './pages/Resources.jsx'
import Gallery from './pages/Gallery.jsx'
import Progress from './pages/Progress.jsx'
import AdminGuard from './components/admin/AdminGuard'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminStudentView from './pages/admin/AdminStudentView'
import AdminResources from './pages/admin/AdminResources'
import AdminExams from './pages/admin/AdminExams'
import AdminResults from './pages/admin/AdminResults'
import AdminClasses from './pages/admin/AdminClasses'
import StudentGuard from './components/StudentGuard'

function App() {
  return (
    <div className="w-full overflow-x-clip scroll-sky">
      <Routes>
        {/* public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* student pages (admins are redirected to /admin/dashboard) */}
        <Route element={<StudentGuard />}>
          <Route path="/home" element={<Home />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/progress" element={<Progress />} />
        </Route>

        {/* admin pages (students are redirected to /home) */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </AdminGuard>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/students/:id" element={<AdminStudentView />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="exams" element={<AdminExams />} />
          <Route path="results" element={<AdminResults />} />
          <Route path="classes" element={<AdminClasses />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
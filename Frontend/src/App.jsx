import { Routes, Route } from 'react-router-dom'
import Landing from './pages/landing.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Resources from './pages/Resources.jsx'
import Gallery from './pages/Gallery.jsx'
import AdminGuard from './components/admin/AdminGuard'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminResources from './pages/admin/AdminResources'
import AdminExams from './pages/admin/AdminExams'
import AdminResults from './pages/admin/AdminResults'
import AdminClasses from './pages/admin/AdminClasses'

function App() {
  return (
    <div className="w-full overflow-x-clip">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
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
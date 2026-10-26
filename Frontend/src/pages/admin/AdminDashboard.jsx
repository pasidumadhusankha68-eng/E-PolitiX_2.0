import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import mainLogo from '../../img/main_logo.svg'


const statCards = [
  { label: 'Total Users', value: '1,248', change: '+12%', icon: '👥', color: 'text-sky-600', bg: 'bg-sky-50' },
  { label: 'Classes', value: '24', change: '+3 this week', icon: '🏫', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Exams', value: '18', change: '+2 pending', icon: '📝', color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Results', value: '842', change: '+45 graded', icon: '📊', color: 'text-rose-600', bg: 'bg-rose-50' },
]

const recentActivities = [
  { user: 'Kamal Perera', action: 'uploaded Mathematics Guide', time: '2 min ago', type: 'resource' },
  { user: 'Nimali Silva', action: 'completed Midterm Exam', time: '15 min ago', type: 'exam' },
  { user: 'Sunil Rao', action: 'enrolled in Grade 10', time: '1 hour ago', type: 'class' },
  { user: 'Admin', action: 'published Final Science results', time: '3 hours ago', type: 'result' },
]

export default function AdminDashboard() {
  return (
    <section className="w-full bg-white/95 h-screen ">
      <div className="w-1/5 h-screen border-r bg-white shadow-md p-8">
        <div className="border-b ">
          <img src={mainLogo} alt="E-PolitiX Logo" className="h-12 w-auto mb-8" />
        </div>
        <nav className="text-black flex flex-col gap-3 pt-10">
          <Link
          to="/admin/dashboard" className="p-4 border-b hover:bg-slate-50 rounded-sm"
          >Dashboard</Link>
          <Link
          to="/admin/users" className="p-4 border-b hover:bg-slate-50 rounded-sm"
          >Users</Link>
          <Link
          to="/admin/exams" className="p-4 border-b hover:bg-slate-50 rounded-sm"
          >Exams</Link>
          <Link
          to="/admin/resources" className="p-4 border-b hover:bg-slate-50 rounded-sm"
          >Resources</Link>
          <Link
          to="/admin/results" className="p-4 border-b hover:bg-slate-50 rounded-sm hover:border-b-0"
          >Results</Link>
          <Link
          to="/admin/classes" className="p-4 border-b hover:bg-slate-50 rounded-sm"
          >Classes</Link>
          <Link
            to="/register"
            className="border border-black/10 hover:bg-red-200 text-black font-light px-5 py-2 mt-20 rounded-lg transition-all tracking-widest shadow-[0_5px_6px_-5px_rgba(249,115,22,0.6)] hover:shadow-[0_7px_8px_-6px_rgba(249,115,22,0.4)] flex align-middle justify-center"
            aria-label="Register"
          >
            Logout
          </Link>
        </nav>
      </div>
    </section>
  )
}
function QuickAction({ label, icon, to }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-sky-200 transition-all cursor-pointer group">
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium text-slate-900">{label}</span>
      <span className="ml-auto text-xs text-slate-400 group-hover:text-sky-600">Open</span>
    </div>
  )
}

function LinkToAll({ children, className }) {
  return (
    <a href="#" className={className}>
      {children}
    </a>
  )
}

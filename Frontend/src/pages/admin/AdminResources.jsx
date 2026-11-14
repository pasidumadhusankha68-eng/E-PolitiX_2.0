import { Link } from 'react-router-dom'

export default function AdminResources() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      
      <div className="text-center space-y-20">
        <Link
          to="/admin/dashboard"
          className="px-6 py-3 text-white/80 font-mono font-bold rounded-lg hover:text-white transition-colors text-xl"
        >
          &larr; Back to the Dashboard
        </Link>
        <h1 className="font-mono text-black text-5xl tracking-widest">
          UNDER CONSTRUCTION ... COMMING SOON
        </h1>
        
      </div>
    </div>
  )
}

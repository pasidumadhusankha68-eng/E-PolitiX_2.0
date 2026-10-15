import { Routes, Route } from 'react-router-dom'
import Landing from './pages/landing.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Resources from './pages/Resources.jsx'
import Gallery from './pages/Gallery.jsx'

function App() {
  return (
    <div className="max-w-screen overflow-x-hidden">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </div>
  )
}

export default App
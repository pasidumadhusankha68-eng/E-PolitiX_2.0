import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { validateEmail, validatePassword } from '../utils/validation'
import loginBg from '../img/login_bg.png'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setEmailError('')
    setPasswordError('')

    if (!validateEmail(email)) {
      setEmailError('Invalid email format')
      return
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be 8-12 chars with uppercase, lowercase, number, and special char')
      return
    }

    const user = {
      email,
      fullName: 'John Doe',
    }
    localStorage.setItem('user', JSON.stringify(user))
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 min-h-screen flex items-center justify-center p-[1%] hidden lg:flex">
        <img src={loginBg} alt="E-PolitiX" className="w-full h-auto max-w-full" />
      </div>

      <div className="w-full lg:w-1/2 bg-slate-50 min-h-screen flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8" style={{ marginTop: '5vh' }}>
            <Logo size="3xl" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className={`w-full px-4 py-2.5 border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                  emailError ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={`w-full px-4 py-2.5 border rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent pr-12 ${
                    passwordError ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-600 hover:text-sky-700 font-medium underline">
              Register
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  )
}
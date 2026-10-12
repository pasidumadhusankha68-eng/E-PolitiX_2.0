import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import InputField from '../components/InputField'
import SelectField from '../components/SelectField'
import FileUploadField from '../components/FileUploadField'
import { validateEmail, validateMobile, validateNIC, validatePassword, institutes } from '../utils/validation'
import regBg from '../img/reg_bg.png'
import logingBg from '../img/login_bg.png'

const initialFormData = {
  fullName: '',
  nameWithInitials: '',
  homeAddress: '',
  alYear: '',
  school: '',
  institute: '',
  gender: '',
  nic: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  nicFront: null,
  nicBack: null,
  profilePhoto: null,
}

const initialErrors = {
  fullName: '',
  nameWithInitials: '',
  homeAddress: '',
  alYear: '',
  school: '',
  institute: '',
  gender: '',
  nic: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  nicFront: '',
  nicBack: '',
  profilePhoto: '',
}

export default function Register() {
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState(initialErrors)
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, formData[name])
  }

  const validateField = (name, value) => {
    let error = ''

    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required'
        break
      case 'nameWithInitials':
        if (!value.trim()) error = 'Name with initials is required'
        break
      case 'homeAddress':
        if (!value.trim()) error = 'Home address is required'
        break
      case 'alYear':
        if (!value.trim()) error = 'A/L Year is required'
        break
      case 'school':
        if (!value.trim()) error = 'School is required'
        break
      case 'institute':
        if (!value) error = 'Institute is required'
        break
      case 'gender':
        if (!value) error = 'Gender is required'
        break
      case 'nic':
        if (!value.trim()) error = 'NIC number is required'
        else if (!validateNIC(value)) error = 'Invalid NIC format (e.g., 123456789V or 123456789012)'
        break
      case 'email':
        if (!value.trim()) error = 'Email is required'
        else if (!validateEmail(value)) error = 'Invalid email format'
        break
      case 'mobile':
        if (!value.trim()) error = 'Mobile number is required'
        else if (!validateMobile(value)) error = 'Mobile must start with 07 and be 10 digits'
        break
      case 'password':
        if (!value) error = 'Password is required'
        else if (!validatePassword(value)) error = 'Password must be 8-12 chars with uppercase, lowercase, number, special char'
        break
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password'
        else if (value !== formData.password) error = 'Passwords do not match'
        break
      case 'nicFront':
        if (!value) error = 'NIC front photo is required'
        break
      case 'nicBack':
        if (!value) error = 'NIC back photo is required'
        break
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
    return !error
  }

  const validateAll = () => {
    let isValid = true
    const newErrors = {}
    const newTouched = {}

    Object.keys(initialFormData).forEach((key) => {
      newTouched[key] = true
      const error = validateField(key, formData[key])
      if (!error) isValid = false
    })

    setErrors(newErrors)
    setTouched(newTouched)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const allValid = Object.keys(initialFormData).every((key) => 
      validateField(key, formData[key])
    )

    if (!allValid) return

    setIsSubmitting(true)
    
    // Log form data (excluding file objects for cleaner console)
    const logData = { ...formData }
    Object.keys(logData).forEach((key) => {
      if (logData[key] instanceof File) {
        logData[key] = { name: logData[key].name, size: logData[key].size, type: logData[key].type }
      }
    })
    
    console.log('Registration Form Data:', logData)
    
    setIsSubmitting(false)
    alert('Registration submitted! Check console for data.')
  }

return (
    <div className="min-h-screen flex">
      <div className="w-1/2 min-h-screen flex items-center justify-center  hidden lg:flex">
        <img src={regBg} alt="E-PolitiX" className="w-full h-auto max-w-full" />
      </div>

      <div className="w-full lg:w-1/2 bg-slate-50 min-h-screen flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8" style={{ marginTop: '5vh' }}>
            <Logo size="2xl" />
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Registration</h2>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <InputField
              label="Full Name"
              name="fullName"
              placeholder="Kamal Perera Silva"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.fullName ? errors.fullName : ''}
              required
            />

            <InputField
              label="Name with Initials"
              name="nameWithInitials"
              placeholder="K. P. Silva"
              value={formData.nameWithInitials}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.nameWithInitials ? errors.nameWithInitials : ''}
              required
            />

            <InputField
              label="Home Address"
              name="homeAddress"
              placeholder="Enter your home address"
              value={formData.homeAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.homeAddress ? errors.homeAddress : ''}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="A/L Year"
                name="alYear"
                placeholder="2026"
                value={formData.alYear}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.alYear ? errors.alYear : ''}
                required
              />

              <InputField
                label="School"
                name="school"
                placeholder="Your school name"
                value={formData.school}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.school ? errors.school : ''}
                required
              />
            </div>

<div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Institute"
                name="institute"
                options={institutes}
                value={formData.institute}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.institute ? errors.institute : ''}
                required
                showPlaceholder={false}
              />

              <SelectField
                label="Gender"
                name="gender"
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.gender ? errors.gender : ''}
                required
                showPlaceholder={false}
              />
            </div>

            <InputField
              label="NIC Number"
              name="nic"
              placeholder="123456789V or 123456789012"
              value={formData.nic}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.nic ? errors.nic : ''}
              required
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : ''}
              required
            />

            <InputField
              label="Mobile Number"
              name="mobile"
              placeholder="07xxxxxxxx"
              value={formData.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.mobile ? errors.mobile : ''}
              required
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="Enter Strong Passsword"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : ''}
              required
            />

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword ? errors.confirmPassword : ''}
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-sky-600 text-white font-medium rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already Registered?{' '}
            <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium underline">
              Login
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  )
}
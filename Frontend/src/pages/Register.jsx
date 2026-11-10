import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import Logo from '../components/Logo'
import InputField from '../components/InputField'
import SelectField from '../components/SelectField'
import { validateEmail, validateMobile, validateNIC, validatePassword } from '../utils/validation'
import regBg from '../img/reg_bg.png'

// NIC photo / profile photo fields are left out on purpose: the backend has no
// file upload endpoint yet. Add them back when that exists.
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
}

const initialErrors = Object.fromEntries(Object.keys(initialFormData).map((k) => [k, '']))

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState(initialErrors)
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [institutes, setInstitutes] = useState([])

  // Load the institute list from the database
  useEffect(() => {
    api('/institutes')
      .then((rows) =>
        setInstitutes(rows.map((r) => ({ value: String(r.id), label: r.name })))
      )
      .catch(() => setServerError('Could not load institutes. Is the server running?'))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
        else if (value.trim().length < 2) error = 'Full name is too short'
        break
      case 'nameWithInitials':
        if (!value.trim()) error = 'Name with initials is required'
        else if (value.trim().length < 2) error = 'Name with initials is too short'
        break
      case 'homeAddress':
        if (!value.trim()) error = 'Home address is required'
        else if (value.trim().length < 3) error = 'Home address is too short'
        break
      case 'alYear':
        if (!value.trim()) error = 'A/L Year is required'
        else if (!/^\d{4}$/.test(value.trim())) error = 'Enter a 4-digit year, e.g. 2028'
        else if (Number(value) < 2000 || Number(value) > 2100) error = 'Enter a year between 2000 and 2100'
        break
      case 'school':
        if (!value.trim()) error = 'School is required'
        else if (value.trim().length < 2) error = 'School name is too short'
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
      default:
        break
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
    return !error
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    // Check every field (no early exit) so all errors show at once
    let valid = true
    const allTouched = {}
    for (const key of Object.keys(initialFormData)) {
      allTouched[key] = true
      if (!validateField(key, formData[key])) valid = false
    }
    setTouched(allTouched)
    if (!valid) return

    setIsSubmitting(true)
    try {
      await api('/auth/register', {
        method: 'POST',
        body: {
          full_name: formData.fullName.trim(),
          name_with_initials: formData.nameWithInitials.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          mobile: formData.mobile.trim(),
          nic: formData.nic.trim(),
          address: formData.homeAddress.trim(),
          school: formData.school.trim(),
          gender: formData.gender === 'male' ? 'Male' : 'Female',
          institute_id: Number(formData.institute),
          exam_year: Number(formData.alYear),
        },
      })
      navigate('/login')
    } catch (err) {
      setServerError(err.status === 409 ? 'This email is already registered' : err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 min-h-screen items-center justify-center hidden lg:flex">
        <img src={regBg} alt="E-PolitiX" className="w-full h-auto max-w-full" />
      </div>

      <div className="w-full lg:w-1/2 bg-slate-50 min-h-screen flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8" style={{ marginTop: '5vh' }}>
            <Logo size="2xl" />
          </div>

          <div className="bg-white rounded-sm shadow-lg border border-slate-200 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Registration</h2>

            <form onSubmit={handleSubmit} className="space-y-5 text-black" noValidate>
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
                  placeholder="2028"
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
                {/* showPlaceholder is left on so the empty "nothing chosen yet"
                    state matches the form value ('') and validation works. */}
                <SelectField
                  label="Institute"
                  name="institute"
                  options={institutes}
                  value={formData.institute}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.institute ? errors.institute : ''}
                  required
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
                placeholder="Enter a strong password"
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

              {serverError && (
                <p className="text-sm text-red-600 whitespace-pre-line" role="alert">
                  {serverError}
                </p>
              )}

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

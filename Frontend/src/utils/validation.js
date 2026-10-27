export const institutes = [
  { value: 'institute1', label: 'Institute 1' },
  { value: 'institute2', label: 'Institute 2' },
  { value: 'institute3', label: 'Institute 3' },
]

export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validateMobile = (mobile) => {
  return /^07\d{8}$/.test(mobile)
}

export const validateNIC = (nic) => {
  // Sri Lankan NIC formats: 12 digits (new) or 9 digits + V/X (old)
  return /^(\d{12}|\d{9}[VX])$/i.test(nic)
}

export function validatePassword(password) {
  if (typeof password !== 'string') return false
  if (password.length < 8 || password.length > 20) return false
  return (
    /[A-Z]/.test(password) &&          // uppercase
    /[a-z]/.test(password) &&          // lowercase
    /\d/.test(password) &&             // number
    /[^A-Za-z0-9]/.test(password)      // any special character, including _
  )
}
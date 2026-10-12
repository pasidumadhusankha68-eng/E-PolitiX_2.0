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

export const validatePassword = (password) => {
  // 8-12 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/
  return regex.test(password)
}
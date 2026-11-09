const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function api(path, options = {}) {
  const token = localStorage.getItem('token')
  const isFormData = options.body instanceof FormData

  const headers = {}
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(API_URL + path, {
    method: options.method || 'GET',
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
    body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    const err = new Error(
      (typeof data?.detail === 'string' && data.detail) || 'Request failed'
    )
    err.status = res.status
    throw err
  }
  return data
}
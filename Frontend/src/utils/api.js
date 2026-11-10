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
    credentials: 'include',
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
    err.data = data
    throw err
  }
  return data
}

export async function downloadFile(path, filename) {
  const token = localStorage.getItem('token')

  const res = await fetch(API_URL + path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.ok) {
    let message = 'Download failed'
    try {
      const data = await res.json()   // read once, only on error
      if (typeof data?.detail === 'string') message = data.detail
    } catch {}
    throw new Error(message)
  }

  const blob = await res.blob()       // read once, only on success
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
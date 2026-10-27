const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    let message = 'Something went wrong'
    if (typeof data?.detail === 'string') message = data.detail
    else if (Array.isArray(data?.detail))
      message = data.detail.map((d) => `${d.loc.slice(1).join('.')}: ${d.msg}`).join('\n')
    const err = new Error(message)
    err.status = res.status
    throw err
  }
  return data
}
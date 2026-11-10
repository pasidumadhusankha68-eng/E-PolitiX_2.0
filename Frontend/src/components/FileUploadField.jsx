import { useState } from 'react'

export default function FileUploadField({ label, name, value, onChange, error, required = false, optional = false }) {
  const [preview, setPreview] = useState(null)

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      onChange(file)
      const reader = new FileReader()
      reader.onload = (event) => setPreview(event.target.result)
      reader.readAsDataURL(file)
    } else {
      onChange(null)
      setPreview(null)
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-slate-400 text-xs">(optional)</span>}
      </label>
      <input
        type="file"
        id={name}
        name={name}
        accept="image/*"
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 ${
          error ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
        }`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {preview && (
        <div className="mt-2">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-32 rounded border border-slate-200" 
          />
        </div>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
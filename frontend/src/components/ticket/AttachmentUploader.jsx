import { Paperclip, X, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']

export default function AttachmentUploader({ attachments, onChange }) {
  const [error, setError] = useState('')

  function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    const remaining = 3 - attachments.length
    setError('')

    if (files.length > remaining) {
      setError(`You can only add ${remaining} more attachment${remaining !== 1 ? 's' : ''}.`)
    }

    const toAdd = files.slice(0, remaining)

    // Validate each file
    for (const file of toAdd) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`"${file.name}" is not a supported image type. Allowed: JPEG, PNG, GIF, WebP, BMP, SVG.`)
        e.target.value = ''
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" exceeds the 5 MB size limit.`)
        e.target.value = ''
        return
      }
      if (file.size === 0) {
        setError(`"${file.name}" is empty.`)
        e.target.value = ''
        return
      }
    }

    Promise.all(
      toAdd.map(file =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              fileName: file.name,
              contentType: file.type,
              size: file.size,
              base64Data: reader.result.split(',')[1],
            })
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      )
    ).then(results => {
      onChange([...attachments, ...results])
    })

    e.target.value = ''
  }

  function remove(index) {
    onChange(attachments.filter((_, i) => i !== index))
    setError('')
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {attachments.map((a, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700">
            <Paperclip className="h-3 w-3" />
            <span className="max-w-[120px] truncate">{a.fileName}</span>
            <span className="text-gray-400">({formatSize(a.size)})</span>
            <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-rose-500">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {attachments.length < 3 && (
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2 text-xs font-medium text-gray-500 hover:border-indigo-400 hover:text-indigo-600">
          <Paperclip className="h-4 w-4" />
          Add image ({attachments.length}/3, max 5 MB each)
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
        </label>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}

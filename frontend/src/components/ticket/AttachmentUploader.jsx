import { Paperclip, X } from 'lucide-react'

export default function AttachmentUploader({ attachments, onChange }) {
  function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    const remaining = 3 - attachments.length
    const toAdd = files.slice(0, remaining)

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
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {attachments.map((a, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-700">
            <Paperclip className="h-3 w-3" />
            <span className="max-w-[120px] truncate">{a.fileName}</span>
            <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-rose-500">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {attachments.length < 3 && (
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2 text-xs font-medium text-gray-500 hover:border-indigo-400 hover:text-indigo-600">
          <Paperclip className="h-4 w-4" />
          Add attachment ({attachments.length}/3)
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}

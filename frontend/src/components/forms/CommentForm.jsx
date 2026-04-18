import { useState } from 'react'
import { Send } from 'lucide-react'

export default function CommentForm({ onSubmit, loading }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  function validate() {
    const trimmed = text.trim()
    if (!trimmed) return 'Comment cannot be empty.'
    if (trimmed.length > 1000) return 'Comment must not exceed 1000 characters.'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    try {
      await onSubmit(text.trim())
      setText('')
    } catch (ex) {
      setError(ex?.message || 'Failed to post comment')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => { setText(e.target.value); setError('') }}
          maxLength={1000}
          placeholder="Add a comment…"
          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${
            error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100'
          }`}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <div className="flex justify-between">
        {error ? <p className="text-xs text-rose-600">{error}</p> : <span />}
        <span className="text-xs text-gray-400">{text.length}/1000</span>
      </div>
    </form>
  )
}

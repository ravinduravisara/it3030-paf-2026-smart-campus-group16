import { useState } from 'react'
import { Send } from 'lucide-react'

export default function CommentForm({ onSubmit, loading }) {
  const [text, setText] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    await onSubmit(text.trim())
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={1000}
        placeholder="Add a comment…"
        className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  )
}

import { useState, type KeyboardEvent } from 'react'

interface TodoInputProps {
  onSubmit: (text: string) => void | Promise<void>
}

export function TodoInput({ onSubmit }: TodoInputProps) {
  const [value, setValue] = useState('')

  async function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const trimmed = value.trim()
    if (!trimmed) return

    try {
      await onSubmit(trimmed)
      setValue('')
    } catch {
      // Keep the current input value so failed submissions can be retried.
    }
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="What needs to be done?"
      aria-label="Add a new task"
      autoFocus
      className="h-12 w-full rounded-lg bg-warm-gray border border-border-gray focus:ring-2 focus:ring-accent-blue focus:outline-none px-4 text-near-black placeholder:text-medium-gray font-sans"
    />
  )
}

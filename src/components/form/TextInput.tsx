'use client'

type Props = {
  id?: string
  label?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: 'text' | 'tel' | 'search' | 'email' | 'url'
  autoFocus?: boolean
  className?: string
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  inputRef?: React.RefObject<HTMLInputElement>
}

export default function TextInput({ id, label, value, onChange, placeholder, inputMode = 'text', autoFocus, className = '', onKeyDown, inputRef }: Props) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={inputRef || undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        inputMode={inputMode}
        autoFocus={autoFocus}
        className={`w-full h-12 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base ${className}`}
      />
    </div>
  )
}


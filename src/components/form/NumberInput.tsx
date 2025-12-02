'use client'

type Props = {
  id?: string
  label?: string
  value: number
  onChange: (v: number) => void
  placeholder?: string
  step?: number
  min?: number
  className?: string
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}

export default function NumberInput({ id, label, value, onChange, placeholder, step = 0.01, min = 0, className = '', onKeyDown }: Props) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      )}
      <input
        id={id}
        type="number"
        inputMode="decimal"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        placeholder={placeholder}
        step={step}
        min={min}
        onKeyDown={onKeyDown}
        className={`w-full h-12 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base ${className}`}
      />
    </div>
  )
}


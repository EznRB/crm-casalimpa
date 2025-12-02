type Props = {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  ariaLabel?: string
}

export default function LargeButton({ children, onClick, variant = 'primary', disabled, ariaLabel }: Props) {
  const base = 'w-full inline-flex items-center justify-center rounded-xl min-h-[44px] h-12 px-5 py-3 text-base font-semibold active:scale-[0.98]'
  const styles = variant === 'primary'
    ? 'bg-primary-600 text-white'
    : 'bg-gray-800 text-white'
  const disabledCls = disabled ? ' opacity-70 cursor-not-allowed' : ''
  return (
    <button aria-label={ariaLabel} onClick={onClick} disabled={disabled} className={`${base} ${styles}${disabledCls}`}>
      {children}
    </button>
  )
}

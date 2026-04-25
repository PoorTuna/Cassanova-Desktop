import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean
  onCheckedChange: (next: boolean) => void
}

export const Switch = forwardRef<HTMLButtonElement, Props>(function Switch(
  { checked, onCheckedChange, className, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-cass-border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cass-brand-primary/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-cass-brand' : 'bg-cass-app',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[18px]' : 'translate-x-[2px]',
        )}
      />
    </button>
  )
})

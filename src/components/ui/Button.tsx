import { forwardRef } from 'react'
import type React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(' ')
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...rest }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-1 disabled:opacity-60 disabled:pointer-events-none h-10 px-4'
    const variants: Record<string, string> = {
      primary: 'text-white bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 active:from-indigo-700 active:to-sky-700 shadow',
      secondary: 'bg-white/70 text-gray-900 hover:bg-white/90 border border-gray-200',
      ghost: 'bg-transparent hover:bg-white/10 text-white',
    }
    return (
      <button ref={ref} className={cx(base, variants[variant], className)} {...rest} />
    )
  }
)
Button.displayName = 'Button'

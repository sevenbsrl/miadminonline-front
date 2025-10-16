import { forwardRef } from 'react'
import type React from 'react'

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(' ')
}

type Props = React.InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cx('flex h-10 w-full rounded-xl border border-white/30 bg-white/70 backdrop-blur px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-gray-100 read-only:bg-gray-50', className)}
      {...props}
    />
  )
})

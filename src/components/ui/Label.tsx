import type React from 'react'

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(' ')
}

type Props = React.LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className, ...props }: Props) {
  return <label className={cx('text-sm font-medium text-gray-800', className)} {...props} />
}

import React from 'react'

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(' ')
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('rounded-3xl border border-white/30 bg-white/70 backdrop-blur shadow-sm', className)} {...props} />
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('p-5 border-b border-white/30', className)} {...props} />
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cx('text-lg font-semibold', className)} {...props} />
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('p-5', className)} {...props} />
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('p-5 border-t border-white/30', className)} {...props} />
}

'use client'

import { cn } from '@/utils/cn'
import Link from 'next/link'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-heading font-semibold rounded transition-all duration-300 cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2'

    const variants = {
      primary:
        'bg-blue-500 text-white hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,153,255,0.3)]',
      secondary: 'bg-navy-900 text-white hover:bg-navy-700 hover:-translate-y-0.5',
      outline:
        'bg-transparent text-blue-500 border-2 border-blue-500 hover:bg-blue-500 hover:text-white',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-[1.875rem] py-3 text-sm',
      lg: 'px-10 py-4 text-base',
    }

    const classes = cn(baseStyles, variants[variant], sizes[size], className)

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      )
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

import { cn } from '@/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean

  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Card({ className, hover = true, padding = 'md', children, ...props }: CardProps) {
  const paddingSizes = {
    none: 'p-0',
    sm: 'p-5',
    md: 'p-8',
    lg: 'p-10',
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-white shadow-card',
        'transition-all duration-300',
        hover && 'hover:-translate-y-[5px] hover:shadow-card-hover',
        paddingSizes[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

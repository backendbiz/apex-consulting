import { Button, Icon } from '@/components/ui'
import { cn } from '@/utils/cn'
import Image from 'next/image'

interface AboutProps {
  title?: string
  sectionLabel?: string
  heading: string
  description: string
  features?: string[]
  image?: string
  ctaText?: string
  ctaLink?: string
  imagePosition?: 'left' | 'right'
  className?: string
}

export function About({
  title = 'ABOUT OUR COMPANY',
  sectionLabel,
  heading,
  description,
  features = [],
  image,
  ctaText,
  ctaLink,
  imagePosition = 'left',
  className,
}: AboutProps) {
  return (
    <section className={cn('section bg-white', className)}>
      <div className="container">
        <div
          className={cn(
            'grid items-center gap-12 lg:grid-cols-12 lg:gap-16',
            imagePosition === 'right' && 'lg:flex-row-reverse',
          )}
        >
          {/* Image */}
          <div className={cn('lg:col-span-5', imagePosition === 'right' && 'lg:order-2')}>
            {image ? (
              <div className="relative aspect-4/3 overflow-hidden rounded-lg shadow-lg">
                <Image src={image} alt="About us" fill className="object-cover" />
              </div>
            ) : (
              <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-linear-to-br from-navy-900 to-blue-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="building" className="h-24 w-24 text-white/30" strokeWidth={1} />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className={cn('lg:col-span-7', imagePosition === 'right' && 'lg:order-1')}>
            {(title || sectionLabel) && (
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-500">
                {sectionLabel || title}
              </p>
            )}
            <h2 className="mb-6 text-3xl font-bold text-navy-900 lg:text-4xl">{heading}</h2>
            <p className="mb-6 text-gray-500 leading-relaxed">{description}</p>

            {features.length > 0 && (
              <ul className="mb-8 space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Icon name="check-circle" className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {ctaText && ctaLink && (
              <Button variant="secondary" href={ctaLink}>
                {ctaText}
                <Icon name="arrow-right" className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'
import { Button, Input, Textarea, Icon } from '@/components/ui'
import { cn } from '@/utils/cn'
import Image from 'next/image'

interface ContactFormProps {
  title?: string
  subtitle?: string
  image?: string
  className?: string
}

export function ContactForm({
  title = 'FREE CONSULTATION',
  subtitle = "Let's discuss how we can help your business grow. Fill out the form and we'll get back to you within 24 hours.",
  image,
  className,
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <section className={cn('section bg-gray-50', className)}>
      <div className="container">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && <h2 className="section-title">{title}</h2>}
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        )}

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="hidden lg:block">
            {image ? (
              <div className="relative aspect-4/3 overflow-hidden rounded-lg shadow-lg">
                <Image src={image} alt="Contact us" fill className="object-cover" />
              </div>
            ) : (
              <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-linear-to-br from-navy-900 to-blue-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="mail" className="h-24 w-24 text-white/30" strokeWidth={1} />
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div>
            {isSubmitted ? (
              <div className="rounded-lg bg-white p-8 text-center shadow-lg">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Icon name="check-circle" className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-navy-900">Thank You!</h3>
                <p className="text-gray-500">
                  Your message has been sent successfully. We&apos;ll get back to you within 24
                  hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-lg bg-white p-8 shadow-lg">
                <div className="grid gap-5 md:grid-cols-2">
                  <Input name="name" placeholder="Your Name" required disabled={isSubmitting} />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mt-5">
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mt-5">
                  <Input name="subject" placeholder="Subject" disabled={isSubmitting} />
                </div>
                <div className="mt-5">
                  <Textarea
                    name="message"
                    placeholder="Your Message"
                    rows={5}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mt-6">
                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    {!isSubmitting && <Icon name="arrow-right" className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

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

  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const data = Object.fromEntries(formData.entries())

      let imageId = undefined

      // Upload image if present
      if (file) {
        const mediaFormData = new FormData()
        mediaFormData.append('file', file)

        const mediaRes = await fetch('/api/media', {
          method: 'POST',
          body: mediaFormData,
        })

        if (!mediaRes.ok) throw new Error('Failed to upload image')

        const mediaJson = await mediaRes.json()
        imageId = mediaJson.doc.id
      }

      // Submit contact request
      const res = await fetch('/api/contact-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          details: data.details,
          image: imageId,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit request')

      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
                {error && (
                  <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-500">{error}</div>
                )}
                <div className="grid gap-5 md:grid-cols-2">
                  <Input name="fullName" placeholder="Your Name" required disabled={isSubmitting} />
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
                    name="details"
                    placeholder="Your Message"
                    rows={5}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Attachment (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full rounded border border-gray-200 bg-white px-5 py-3.75 text-[0.9375rem] file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/10"
                    accept="image/*"
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

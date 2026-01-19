'use client'

import { cn } from '@/utils/cn'
import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  phoneNumber?: string
  message?: string
  className?: string
}

export function WhatsAppButton({
  phoneNumber,
  message = 'Hello! I would like to inquire about your services.',
  className,
}: WhatsAppButtonProps) {
  if (!phoneNumber) return null

  const cleanNumber = phoneNumber.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'fixed bottom-8 right-8 z-50',
        'flex h-[60px] w-[60px] items-center justify-center rounded-full',
        'bg-[#00D084] text-white',
        'shadow-[0_4px_12px_rgba(0,208,132,0.4)]',
        'transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_20px_rgba(0,208,132,0.5)]',
        className
      )}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}

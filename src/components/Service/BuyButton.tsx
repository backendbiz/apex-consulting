'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

interface BuyButtonProps {
  serviceId: string | number
  label?: string
}

export function BuyButton({ serviceId, label = 'Get Started' }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
        // Optional: Show toast error
      }
    } catch (error) {
      console.error('Error initiating checkout:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="primary" className="mb-4 w-full" onClick={handleBuy} disabled={loading}>
      {loading ? 'Processing...' : label}
    </Button>
  )
}

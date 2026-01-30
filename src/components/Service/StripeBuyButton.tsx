'use client'

import { useEffect, useRef } from 'react'

interface StripeBuyButtonProps {
  buyButtonId: string
  publishableKey?: string
  /**
   * Client reference ID that gets passed to Stripe checkout session.
   * Use this to pass the DZTech order ID for webhook matching.
   */
  clientReferenceId?: string
  /**
   * Customer email to pre-fill in checkout
   */
  customerEmail?: string
}

/**
 * Stripe Buy Button component that embeds Stripe's hosted checkout button.
 * This button redirects directly to Stripe's checkout page when clicked.
 * 
 * The `clientReferenceId` is critical for the provider workflow - it allows
 * us to match the Stripe checkout session back to our pending order when
 * the webhook fires.
 * 
 * @see https://stripe.com/docs/payment-links/buy-button
 */
export function StripeBuyButton({ 
  buyButtonId, 
  publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  clientReferenceId,
  customerEmail,
}: StripeBuyButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    // Only load the script once
    if (scriptLoaded.current) return

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]')
    
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/buy-button.js'
      script.async = true
      document.head.appendChild(script)
    }
    
    scriptLoaded.current = true
  }, [])

  useEffect(() => {
    if (!containerRef.current || !buyButtonId || !publishableKey) return

    // Clear previous content
    containerRef.current.innerHTML = ''

    // Create the stripe-buy-button element
    const buyButton = document.createElement('stripe-buy-button')
    buyButton.setAttribute('buy-button-id', buyButtonId)
    buyButton.setAttribute('publishable-key', publishableKey)
    
    // Pass client reference ID to match order in webhook
    // This is CRITICAL for updating order status after payment
    if (clientReferenceId) {
      buyButton.setAttribute('client-reference-id', clientReferenceId)
    }
    
    // Pre-fill customer email if available
    if (customerEmail) {
      buyButton.setAttribute('customer-email', customerEmail)
    }
    
    containerRef.current.appendChild(buyButton)
  }, [buyButtonId, publishableKey, clientReferenceId, customerEmail])

  if (!buyButtonId || !publishableKey) {
    return (
      <div className="w-full py-3 px-4 bg-gray-100 text-gray-500 text-center rounded-lg">
        Buy button not configured
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full stripe-buy-button-container flex justify-center items-center"
    />
  )
}

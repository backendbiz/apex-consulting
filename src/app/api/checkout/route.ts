import { getPayloadClient } from '@/lib/payload'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

// Initialize Stripe lazily to avoid build errors if env var is missing
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { ... })

export async function POST(req: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiVersion: '2024-12-18.acacia' as any,
    })

    const { serviceId } = await req.json()
    const payload = await getPayloadClient()

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Fetch the service details
    const service = await payload.findByID({
      collection: 'services',
      id: serviceId,
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Create a Checkout Session
    // Use the origin from headers to construct success/cancel URLs
    const headersList = await headers()
    const origin =
      headersList.get('origin') || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: service.title,
              description: service.description || '',
              // images: service.featuredImage ? [service.featuredImage.url] : [], // Add if available
            },
            unit_amount: Math.round(service.price * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/services/${service.slug}?success=true`,
      cancel_url: `${origin}/services/${service.slug}?canceled=true`,
      metadata: {
        serviceId: service.id,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getPayloadClient } from '@/lib/payload'

/**
 * Verify a Stripe Checkout Session and return order details
 * Used after Stripe Buy Button / Payment Link redirects back with session_id
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'session_id is required' },
      { status: 400 }
    )
  }

  try {
    const stripe = getStripe()
    
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product'],
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get the client_reference_id (our order ID)
    const clientReferenceId = session.client_reference_id
    const paymentStatus = session.payment_status
    const customerEmail = session.customer_details?.email

    let order = null
    let service = null

    // Try to find the order using client_reference_id
    if (clientReferenceId) {
      const payload = await getPayloadClient()
      
      // Try finding by Payload ID first
      try {
        order = await payload.findByID({
          collection: 'orders',
          id: clientReferenceId,
          depth: 1,
        })
      } catch {
        // Not a valid Payload ID, try by orderId field
        const ordersByOrderId = await payload.find({
          collection: 'orders',
          where: {
            orderId: { equals: clientReferenceId },
          },
          depth: 1,
        })
        if (ordersByOrderId.docs.length > 0) {
          order = ordersByOrderId.docs[0]
        }
      }

      // Get service from order
      if (order && order.service) {
        if (typeof order.service === 'object') {
          service = order.service
        } else {
          // Fetch service by ID
          try {
            service = await payload.findByID({
              collection: 'services',
              id: order.service as string,
            })
          } catch (err) {
            console.error('Error fetching service:', err)
          }
        }
      }
    }

    return NextResponse.json({
      success: paymentStatus === 'paid',
      sessionId: session.id,
      paymentStatus,
      clientReferenceId,
      customerEmail,
      amountTotal: session.amount_total ? session.amount_total / 100 : null,
      currency: session.currency,
      order: order ? {
        id: order.id,
        orderId: order.orderId,
        status: order.status,
        total: order.total,
      } : null,
      service: service ? {
        id: service.id,
        title: service.title,
        slug: service.slug,
      } : null,
    })
  } catch (error) {
    console.error('Error verifying session:', error)
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    )
  }
}

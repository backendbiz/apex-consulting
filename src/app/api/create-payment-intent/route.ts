import { getPayloadClient } from '@/lib/payload'
import { NextResponse } from 'next/server'
import {
  getStripe,
  getStripeForService,
  getStripeCredentialsForService,
  type ServiceStripeConfig,
} from '@/lib/stripe'
import { generateOrderId } from '@/lib/order-generator'
import type { Payload } from 'payload'

/**
 * Helper function to create a pending order with retry logic
 * Handles MongoDB WriteConflict errors (code 112) and duplicate key errors (code 11000)
 */
async function createPendingOrderWithRetry(
  payload: Payload,
  orderData: {
    orderId: string
    serviceId: string
    price: number
    paymentIntentId: string
  },
  maxRetries: number = 3,
): Promise<void> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // First check if order already exists
      const existingOrders = await payload.find({
        collection: 'orders',
        where: {
          orderId: { equals: orderData.orderId },
        },
        limit: 1,
      })

      if (existingOrders.docs.length > 0) {
        // Order already exists, nothing to do
        console.log(`Order ${orderData.orderId} already exists, skipping creation`)
        return
      }

      // Create the order
      await payload.create({
        collection: 'orders',
        data: {
          orderId: orderData.orderId,
          service: orderData.serviceId,
          status: 'pending',
          total: orderData.price,
          stripePaymentIntentId: orderData.paymentIntentId,
        },
      })

      console.log(`Successfully created pending order: ${orderData.orderId}`)
      return
    } catch (error: unknown) {
      const mongoError = error as { code?: number; codeName?: string }

      // Handle WriteConflict (code 112) - retry with exponential backoff
      if (mongoError.code === 112 || mongoError.codeName === 'WriteConflict') {
        console.warn(
          `WriteConflict on attempt ${attempt + 1}/${maxRetries} for order ${orderData.orderId}`,
        )

        if (attempt < maxRetries - 1) {
          // Exponential backoff: 100ms, 200ms, 400ms...
          const delay = Math.pow(2, attempt) * 100
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
      }

      // Handle duplicate key error (code 11000) - order was created by another request
      if (mongoError.code === 11000) {
        console.log(
          `Order ${orderData.orderId} was created by another request (duplicate key), continuing`,
        )
        return
      }

      // If we've exhausted retries or it's a different error, throw
      throw error
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { serviceId, orderId: clientOrderId } = body
    const payload = await getPayloadClient()

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    // Fetch the service details including Stripe configuration
    const service = await payload.findByID({
      collection: 'services',
      id: serviceId,
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Get Stripe credentials for this service (custom or default)
    const stripeConfig = service.stripeConfig as ServiceStripeConfig | undefined
    const stripeCredentials = getStripeCredentialsForService(stripeConfig)

    // Get the appropriate Stripe instance
    const stripe =
      stripeCredentials.secretKey !== process.env.STRIPE_SECRET_KEY
        ? getStripeForService(stripeCredentials.secretKey)
        : getStripe()

    // Use provided orderId or generate a new one
    const orderId = clientOrderId || generateOrderId()

    // Create a PaymentIntent using the service's Stripe account
    // Note: Cash App is only available for US-based Stripe accounts
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(service.price * 100), // Amount in cents
      currency: 'usd',
      // Cash App only - requires US-based Stripe account
      payment_method_types: ['cashapp'],
      metadata: {
        serviceId: service.id,
        orderId: orderId,
        serviceName: service.title,
        // Store which Stripe account was used (for webhook routing)
        useCustomStripeAccount: stripeConfig?.useCustomStripeAccount ? 'true' : 'false',
      },
    })

    // Create a pending order in the database with retry logic
    try {
      await createPendingOrderWithRetry(payload, {
        orderId,
        serviceId,
        price: service.price,
        paymentIntentId: paymentIntent.id,
      })
    } catch (dbError) {
      console.error('Error creating pending order after retries:', dbError)
      // Continue even if order creation fails - payment can still proceed
    }

    // Return the client secret AND the publishable key for this service
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
      amount: service.price,
      serviceName: service.title,
      // Include the publishable key so frontend can use the correct Stripe account
      stripePublishableKey: stripeCredentials.publishableKey,
    })
  } catch (error: unknown) {
    console.error('Error creating payment intent:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Check if this is a Cash App not available error
    const isCashAppUnavailable =
      errorMessage.includes('cashapp') &&
      (errorMessage.includes('not supported') ||
        errorMessage.includes('not available') ||
        errorMessage.includes('invalid_request_error'))

    if (isCashAppUnavailable) {
      return NextResponse.json(
        {
          error: 'Cash App payments are not available for this service. Please contact support.',
          errorCode: 'CASHAPP_UNAVAILABLE',
          details:
            'The Stripe account for this service is not based in the United States, which is required for Cash App payments.',
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

import { getPayloadClient } from '@/lib/payload'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkoutSessionCompleted = async ({ event }: any) => {
  const session = event.data.object
  const { serviceId } = session.metadata || {}

  if (serviceId) {
    const payload = await getPayloadClient()

    try {
      await payload.create({
        collection: 'orders',
        data: {
          service: serviceId,
          status: 'paid',
          total: session.amount_total / 100,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          customerEmail: session.customer_details?.email || undefined,
        },
      })
      console.log(`Order created for session ${session.id}`)
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }
}

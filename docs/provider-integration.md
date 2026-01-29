# Provider Integration Guide

This document explains how external providers (like Bitloader and PlayPlay) can integrate with dztech.shop to process payments using their own Stripe accounts.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   Bitloader                              PlayPlay                            │
│   API Key: provider_bit123...            API Key: provider_play456...        │
│        │                                      │                              │
│        ▼                                      ▼                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │              dztech.shop/api/create-payment-intent                  │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│        │                                      │                              │
│        ▼                                      ▼                              │
│   ┌─────────────────────┐            ┌─────────────────────┐                │
│   │ Staffing Services   │            │ Web Development     │                │
│   │ $2,000/month        │            │ $5,000/project      │                │
│   │ Stripe: Bitloader's │            │ Stripe: PlayPlay's  │                │
│   └─────────────────────┘            └─────────────────────┘                │
│        │                                      │                              │
│        ▼                                      ▼                              │
│   Bitloader's Stripe                    PlayPlay's Stripe                    │
│   Account receives $2,000               Account receives $5,000              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Each provider:

- Has their **own API key** for authentication
- Links to a specific **Service** (which has its own Stripe configuration)
- Receives **webhook notifications** when payments complete
- Has **custom redirect URLs** for their users after payment

---

## Setting Up a Provider

### Step 1: Configure the Service with Provider's Stripe Keys

1. Go to **Admin Panel** → **Services**
2. Edit the service that this provider will use (e.g., "Staffing Services" for Bitloader)
3. Scroll to **Stripe Configuration** section:

| Field                            | Description                                                |
| -------------------------------- | ---------------------------------------------------------- |
| ✅ **Use Custom Stripe Account** | Enable this checkbox                                       |
| **Stripe Secret Key**            | Provider's secret key: `sk_live_...` or `sk_test_...`      |
| **Stripe Publishable Key**       | Provider's publishable key: `pk_live_...` or `pk_test_...` |
| **Stripe Webhook Secret**        | Provider's webhook secret: `whsec_...`                     |

4. **Save** the service

### Step 2: Create the Provider

1. Go to **Admin Panel** → **Providers**
2. Click **Create New Provider**
3. Fill in:

| Field                    | Example (Bitloader)                                       | Example (PlayPlay)                                        |
| ------------------------ | --------------------------------------------------------- | --------------------------------------------------------- |
| **Provider Name**        | Bitloader                                                 | PlayPlay                                                  |
| **Provider Slug**        | `bitloader`                                               | `playplay`                                                |
| **Linked Service**       | Staffing Services                                         | Web Development                                           |
| **Status**               | 🟢 Active                                                 | 🟢 Active                                                 |
| **Webhook URL**          | `https://bitloader.com/api/webhooks/dztech`               | `https://playplay.com/api/webhooks/payment`               |
| **Success Redirect URL** | `https://bitloader.com/payment/success?orderId={orderId}` | `https://playplay.com/checkout/success?orderId={orderId}` |
| **Cancel Redirect URL**  | `https://bitloader.com/payment/cancelled`                 | `https://playplay.com/checkout/cancelled`                 |

4. **Save** → Copy the auto-generated **API Key**

> **Note**: Use `{orderId}` as a placeholder in redirect URLs - it will be replaced with the actual database ID of the order.

---

## API Integration

### 1. Creating a Payment Intent

**Endpoint**: `POST /api/create-payment-intent`

**Request Body**:

```json
{
  "apiKey": "provider_xxxxxxxxxxxxxxxxxxxx",
  "externalId": "YOUR-INTERNAL-ORDER-ID",
  "amount": 250
}
```

| Field        | Required    | Description                                     |
| ------------ | ----------- | ----------------------------------------------- |
| `apiKey`     | Yes         | Your provider API key                           |
| `externalId` | Recommended | Your internal order/transaction ID for tracking |
| `amount` | No | Optional custom amount (must be multiple of 5) |

**Notes on Amount & Quantity**:
- If `amount` is provided:
  - It must be a **multiple of 5**.
  - It must be >= the service's base price.
  - The system will calculate **Quantity** = `Amount / Service Price`.
  - Example: Service Price = $5, Amount = $100 → Quantity = 20.
- If `amount` is NOT provided:
  - The system uses the default **Service Price**.
  - **Quantity** = 1.

**Success Response** (200):

```json
{
  "checkoutUrl": "https://dztech.shop/checkout?serviceId=abc123&orderId=65b...",
  "orderId": "65b...", // Payload Database ID
  "externalId": "YOUR-INTERNAL-ORDER-ID",
  "amount": 250
}
```

**Error Responses**:

- `401`: Invalid or inactive API key
- `400`: Cash App not available (non-US Stripe account)
- `400`: Invalid amount (not a multiple of 5)
- `500`: Server error

### 2. Redirecting to Checkout

Simply redirect the user to the `checkoutUrl` provided in the response:

```javascript
window.location.href = response.checkoutUrl;
```

The checkout page will:

1. Display the payment form (Cash App)
2. Process the payment using the provider's Stripe account
3. Show a success message with a 5-second countdown
4. Automatically redirect to the provider's `successRedirectUrl`

### 3. Receiving Webhook Notifications

If a **Webhook URL** is configured, dztech.shop will send POST requests when payment status changes:

**Payment Success**:

```json
POST https://bitloader.com/api/webhooks/dztech
Content-Type: application/json
X-DZTech-Webhook: payment-notification

{
  "event": "payment_succeeded",
  "orderId": "65b...", // Payload Database ID
  "externalId": "BL-user123-1706518200000",
  "providerId": "xyz789",
  "providerName": "Bitloader",
  "serviceId": "abc123",
  "serviceName": "Staffing Services",
  "amount": 2000,
  "status": "paid",
  "stripePaymentIntentId": "pi_xxx",
  "timestamp": "2026-01-29T13:00:00.000Z"
}
```

**Payment Failed**:

```json
{
  "event": "payment_failed",
  "orderId": "65b...", // Payload Database ID
  "externalId": "BL-user123-1706518200000",
  "providerId": "xyz789",
  "providerName": "Bitloader",
  "serviceId": "abc123",
  "serviceName": "Staffing Services",
  "amount": 2000,
  "status": "failed",
  "stripePaymentIntentId": "pi_xxx",
  "timestamp": "2026-01-29T13:00:00.000Z"
}
```

> **Important**: The `externalId` field contains your internal order ID that you passed when creating the payment intent. Use this to match webhook notifications with your orders.

---

## Complete Integration Example

### Bitloader Backend

```javascript
// bitloader-backend/services/payment.js

const DZTECH_API_KEY = process.env.DZTECH_API_KEY // provider_bit123...

async function createPaymentSession(userId, planType) {
  // Generate a unique external ID for tracking
  const externalId = `BL-${userId}-${Date.now()}`

  // Call dztech.shop to create payment intent
  const response = await fetch('https://dztech.shop/api/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: DZTECH_API_KEY,
      externalId: externalId, // Your internal order ID for tracking
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create payment session')
  }

  const data = await response.json()

  // Store the order info in your database using YOUR externalId
  await db.orders.create({
    id: externalId, // Use your external ID as the primary key
    userId,
    planType,
    dztechOrderId: data.orderId,
    amount: data.amount,
    status: 'pending',
    createdAt: new Date(),
  })

  return {
    checkoutUrl: `https://dztech.shop/checkout?serviceId=${data.serviceId}&orderId=${data.orderId}`,
    orderId: data.orderId,
    externalId: externalId,
  }
}

module.exports = { createPaymentSession }
```

### Bitloader Frontend

```javascript
// bitloader-frontend/components/PaymentButton.jsx

async function handlePayment() {
  try {
    // Call your backend to create payment session
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, planType: 'premium' }),
    })

    const { checkoutUrl } = await response.json()

    // Redirect to dztech.shop checkout
    window.location.href = checkoutUrl
  } catch (error) {
    console.error('Payment error:', error)
    alert('Failed to start payment. Please try again.')
  }
}
```

### Bitloader Webhook Handler

```javascript
// bitloader-backend/routes/webhooks.js

app.post('/api/webhooks/dztech', async (req, res) => {
  // Verify the webhook source
  if (req.headers['x-dztech-webhook'] !== 'payment-notification') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { event, orderId, externalId, amount, status } = req.body

  console.log(`Received ${event} for order ${orderId} (externalId: ${externalId})`)

  if (event === 'payment_succeeded') {
    // Find the order using YOUR externalId (not dztech's orderId)
    const order = await db.orders.findById(externalId)

    if (order) {
      // Update order status
      await db.orders.update(order.id, { status: 'paid', paidAt: new Date() })

      // Grant access to the user
      await grantPremiumAccess(order.userId)

      // Send confirmation email
      await sendPaymentConfirmation(order.userId, externalId, amount)
    }
  } else if (event === 'payment_failed') {
    // Handle failed payment using externalId
    const order = await db.orders.findById(externalId)
    if (order) {
      await db.orders.update(order.id, { status: 'failed' })
      await sendPaymentFailedNotification(order.userId)
    }
  }

  // Always respond with 200 to acknowledge receipt
  res.status(200).json({ received: true })
})
```

### Bitloader Success Page

```javascript
// bitloader-frontend/pages/payment/success.jsx

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { orderId } = router.query

  useEffect(() => {
    // Important: dztech.shop returns its internal ID in the orderId query param
    // You might want to verify it if you stored it, or just show success
    if (orderId) {
      // Verification logic...
    }
  }, [orderId])

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Order Reference: {orderId}</p>
      <p>Thank you for your purchase!</p>
      <a href="/dashboard">Go to Dashboard</a>
    </div>
  )
}
```

---

## Current Provider Configuration

| Provider      | Linked Service    | Price          | Stripe Account     |
| ------------- | ----------------- | -------------- | ------------------ |
| **Bitloader** | Staffing Services | $2,000/month   | Bitloader's Stripe |
| **PlayPlay**  | Web Development   | $5,000/project | PlayPlay's Stripe  |

---

## Security Considerations

1. **API Key Protection**: Keep your API key secret. Never expose it in frontend code.
2. **Webhook Verification**: Always check the `X-DZTech-Webhook` header.
3. **HTTPS Only**: All API calls must be made over HTTPS.
4. **Order Verification**: Always verify payment status via webhook before granting access.
5. **Idempotency**: Handle duplicate webhook notifications gracefully.

---

## Troubleshooting

### "Invalid or inactive API key" (401)

- Verify the API key is correct
- Check that the provider's status is "Active" in the admin panel

### "Cash App payments are not available" (400)

- Cash App requires a US-based Stripe account
- Verify the linked service's Stripe account is registered in the US

### Webhook not received

- Verify the webhook URL is publicly accessible
- Check your server logs for incoming requests
- Ensure your server responds with 200 status

### User not redirected after payment

- Verify the `successRedirectUrl` is correctly configured
- Check that the URL uses `{orderId}` placeholder correctly

---

## Testing with cURL

You can use these commands to test the integration locally:

### 1. Create Payment Intent

Simulate Bitloader requesting a payment session:

```bash
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_PROVIDER_API_KEY",
    "externalId": "BL-TEST-ORDER-001"
  }'
```

### 2. Simulate Webhook Payload

If you are developing the provider's listener, you can simulate a notification:

```bash
# Send TO the Provider's Webhook URL
curl -X POST https://bitloader.com/api/webhooks/dztech \
  -H "Content-Type: application/json" \
  -H "X-DZTech-Webhook: payment-notification" \
  -d '{
    "event": "payment_succeeded",
    "orderId": "65b8e...", 
    "externalId": "BL-TEST-ORDER-001",
    "providerId": "pid_123",
    "providerName": "Bitloader",
    "serviceId": "sid_123",
    "serviceName": "Staffing Services",
    "amount": 2000,
    "status": "paid",
    "timestamp": "2026-01-29T13:00:00.000Z"
  }'
```

---

## Support

For integration support, contact: support@dztech.shop

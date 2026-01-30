# Provider Integration Guide

This document explains how external providers can integrate with DZTech to process payments through our unified checkout system.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   Provider A                               Provider B                        │
│   API Key: provider_xxx...                 API Key: provider_yyy...          │
│   useStripeCheckout: false                 useStripeCheckout: true           │
│        │                                        │                            │
│        ▼                                        ▼                            │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │              dztech.shop/api/v1/create-payment-intent              │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│        │                                        │                            │
│        ▼                                        ▼                            │
│   ┌─────────────────────┐              ┌─────────────────────┐              │
│   │ Service A           │              │ Service B           │              │
│   │ $5/unit (Cash App)  │              │ $300 (Stripe Button)│              │
│   └─────────────────────┘              └─────────────────────┘              │
│        │                                        │                            │
│        ▼                                        ▼                            │
│   ┌─────────────────────┐              ┌─────────────────────┐              │
│   │   Cash App Pay      │              │ Stripe Buy Button   │              │
│   │   (Custom checkout) │              │ (Hosted checkout)   │              │
│   └─────────────────────┘              └─────────────────────┘              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Each provider:

- Has their **own API key** for authentication
- Links to a specific **Service** (product/pricing)
- Can specify custom **amount** (quantity-based pricing) - Cash App mode only
- Can use **Stripe Buy Button** for Payment Link analytics
- Receives **webhook notifications** when payments complete
- Has **custom redirect URLs** for their users after payment

---

## Payment Modes

DZTech supports two payment modes per provider:

| Mode | Setting | Payment UI | Analytics | Custom Amounts |
|------|---------|------------|-----------|----------------|
| **Cash App** (default) | `useStripeCheckout: false` | Custom DZTech checkout with Cash App | PaymentIntent only | Yes |
| **Stripe Buy Button** | `useStripeCheckout: true` | DZTech page with Stripe Buy Button → Stripe hosted checkout | **Payment Link analytics** | No (customer can adjust if configured in Stripe) |

---

## Integration Flows

### Flow 1: Cash App Mode (Default)

For providers that need **custom amounts** or **quantity-based pricing**.

```
Provider Backend                DZTech                      User
      │                            │                          │
      │  POST /api/v1/create-payment-intent                   │
      │  { apiKey, externalId, amount }                       │
      │ ──────────────────────────►│                          │
      │                            │                          │
      │  { checkoutUrl, orderId }  │                          │
      │ ◄──────────────────────────│                          │
      │                            │                          │
      │  Redirect user ───────────────────────────────────────►│
      │                            │                          │
      │                            │  /checkout?orderId=xxx   │
      │                            │ ◄─────────────────────────│
      │                            │                          │
      │                            │  Cash App Payment        │
      │                            │ ◄────────────────────────►│
      │                            │                          │
      │                            │  Success UI + Redirect   │
      │                            │ ─────────────────────────►│
      │                            │                          │
      │  Webhook: payment_succeeded│                          │
      │ ◄──────────────────────────│                          │
```

### Flow 2: Stripe Buy Button Mode (Payment Link Analytics)

For providers that want **Payment Link analytics** in Stripe Dashboard. Customer can adjust amount if configured in Stripe.

```
Provider Backend                DZTech                    Stripe                User
      │                            │                         │                    │
      │  POST /api/v1/create-payment-intent                  │                    │
      │  { apiKey, externalId }    │                         │                    │
      │ ──────────────────────────►│                         │                    │
      │                            │                         │                    │
      │  { checkoutUrl, mode: "stripe_buy_button" }          │                    │
      │ ◄──────────────────────────│                         │                    │
      │                            │                         │                    │
      │  Redirect user ──────────────────────────────────────────────────────────►│
      │                            │                         │                    │
      │                            │  DZTech Checkout Page   │                    │
      │                            │  (Stripe Buy Button)    │                    │
      │                            │ ◄───────────────────────────────────────────│
      │                            │                         │                    │
      │                            │                         │  User clicks button│
      │                            │                         │ ◄──────────────────│
      │                            │                         │                    │
      │                            │                         │  Stripe Checkout   │
      │                            │                         │ ◄─────────────────►│
      │                            │                         │                    │
      │                            │                         │  Payment complete  │
      │                            │                         │ ──────────────────►│
      │                            │                         │                    │
      │  Webhook: checkout.session.completed                 │                    │
      │ ◄────────────────────────────────────────────────────│                    │
```

### Flow 3: Payment Link Integration (Shareable Links)

```
Admin creates Payment Link for Service
      │
      ▼
Payment Link URL: /checkout?paymentLinkId=plink_xxx
      │
      ▼
User clicks link → Checkout Page → Cash App or Buy Button → Success UI
```

---

## Setting Up a Provider

### Step 1: Create a Service

1. Go to **Admin Panel** → **Services**
2. Create a new service with:
   - **Title**: Product name (e.g., "Premium Credits")
   - **Price**: Unit price (e.g., $5)
   - **Slug**: URL-friendly identifier

3. **Save** the service

#### Service Settings for Stripe Buy Button Mode

If using Stripe Buy Button mode (for Payment Link analytics):

1. Create a **Payment Link** in Stripe Dashboard
2. Get the **Buy Button ID** (e.g., `buy_btn_xxx`) from the Payment Link settings
3. Enter it in the service's **Stripe Buy Button ID** field

| Field | Value | Description |
|-------|-------|-------------|
| **Stripe Buy Button ID** | `buy_btn_xxx` | Get from Stripe Dashboard → Payment Links → Buy Button |

> **Tip**: When creating the Payment Link in Stripe, you can enable "Let customers adjust quantity" or "Customer chooses price" for flexible pricing.

### Step 2: Create the Provider

1. Go to **Admin Panel** → **Providers**
2. Click **Create New Provider**
3. Fill in:

| Field                    | Example                                             | Description                              |
| ------------------------ | --------------------------------------------------- | ---------------------------------------- |
| **Provider Name**        | Bitloader                                           | Display name                             |
| **Provider Slug**        | `bitloader`                                         | URL-friendly identifier                  |
| **Linked Service**       | Premium Credits                                     | Service this provider sells              |
| **Status**               | 🟢 Active                                           | Enable/disable the provider              |
| **Use Stripe Hosted Checkout** | ☐ or ✓                                        | Enable for Stripe Buy Button mode        |
| **Webhook URL**          | `https://bitloader.com/api/webhooks/dztech`         | Where to send payment notifications      |
| **Success Redirect URL** | `https://bitloader.com/success?orderId={orderId}`   | Redirect after successful payment        |
| **Cancel Redirect URL**  | `https://bitloader.com/cancelled`                   | Redirect after cancelled payment         |

4. **Save** → Copy the auto-generated **API Key**

> **Note**: Use `{orderId}` as a placeholder in redirect URLs - it will be replaced with the actual order ID.

### Provider Mode Comparison

| Setting | Cash App Mode | Stripe Buy Button Mode |
|---------|---------------|------------------------|
| Provider `useStripeCheckout` | ❌ Unchecked | ✓ Checked |
| Service `stripeBuyButtonId` | Not needed | Required (from Stripe Dashboard) |
| Custom amounts via API | ✓ Supported | ❌ Not supported |
| Customer chooses amount | ❌ No | ✓ Yes (if configured in Stripe) |
| Payment Link analytics | ❌ No | ✓ Yes |
| Payment methods | Cash App only | Cards, Apple Pay, Google Pay, etc. |

---

## API Reference

### POST /api/v1/create-payment-intent

Creates a payment session and returns a checkout URL.

**Request Body**:

```json
{
  "apiKey": "provider_xxxxxxxxxxxxxxxxxxxx",
  "externalId": "YOUR-INTERNAL-ORDER-ID",
  "amount": 100
}
```

| Field        | Required    | Description                                          |
| ------------ | ----------- | ---------------------------------------------------- |
| `apiKey`     | Yes         | Your provider API key                                |
| `externalId` | Recommended | Your internal order/transaction ID for tracking      |
| `amount`     | No          | Custom amount (Cash App mode only, must be multiple of service price) |

**Amount & Quantity Logic** (Cash App mode only):

- If `amount` is provided:
  - Must be **≥ service price**
  - Must be **divisible by service price**
  - **Quantity** = `amount / servicePrice`
  - Example: Service Price = $5, Amount = $100 → Quantity = 20

- If `amount` is NOT provided:
  - Uses default **service price**
  - **Quantity** = 1

> **Note**: In Stripe Buy Button mode, `amount` is ignored. The amount is determined by the Payment Link configuration in Stripe (fixed or customer chooses).

**Success Response - Cash App Mode** (200):

```json
{
  "checkoutUrl": "https://app.dztech.shop/checkout?serviceId=abc123&orderId=65b...",
  "orderId": "65b...",
  "externalId": "YOUR-INTERNAL-ORDER-ID",
  "amount": 100,
  "quantity": 20
}
```

**Success Response - Stripe Buy Button Mode** (200):

```json
{
  "checkoutUrl": "https://app.dztech.shop/checkout?serviceId=abc123&orderId=65b...",
  "orderId": "65b...",
  "externalId": "YOUR-INTERNAL-ORDER-ID",
  "amount": 300,
  "quantity": 1,
  "stripeBuyButtonId": "buy_btn_xxx",
  "mode": "stripe_buy_button"
}
```

**Error Responses**:

| Status | Error                                    | Description                        |
| ------ | ---------------------------------------- | ---------------------------------- |
| 401    | Invalid or inactive API key              | Check API key and provider status  |
| 400    | Amount must be a multiple of 5           | Amount validation failed (Cash App mode) |
| 400    | Amount cannot be less than service price | Minimum amount not met             |
| 400    | Stripe Buy Button not configured         | Service missing `stripeBuyButtonId` |
| 400    | Cash App payments are not available      | Stripe account issue               |
| 500    | Server error                             | Contact support                    |

---

## Checkout Flow

### Cash App Mode - What Users See

1. **Checkout Page** (`/checkout?orderId=xxx`)
   - Order ID displayed
   - Amount to pay
   - Cash App payment button

2. **Cash App Opens** (in new tab/window)
   - User approves payment in Cash App

3. **Returns to Checkout Page**
   - **Success**: Green success UI with order confirmation
   - **Failed**: Red error UI with "Try Again" button
   - **Processing**: Blue processing UI

4. **Provider Redirect** (if configured)
   - 5-second countdown shown
   - Auto-redirects to provider's `successRedirectUrl`
   - User can click to redirect immediately

### Stripe Buy Button Mode - What Users See

1. **DZTech Checkout Page** (`/checkout?orderId=xxx`)
   - Order ID displayed
   - Service information
   - **Stripe Buy Button** (embedded with `client-reference-id`)

2. **User Clicks Buy Button**
   - Redirects to Stripe's hosted checkout page
   - Customer can adjust amount (if configured in Stripe)
   - Supports Cards, Apple Pay, Google Pay, etc.

3. **Stripe Checkout Completes**
   - Redirects based on Payment Link configuration in Stripe
   - Webhook sent to DZTech → order status updated → forwarded to provider

> **Note**: For Stripe Buy Button mode, configure the success/cancel URLs in Stripe Dashboard when creating the Payment Link.

### How Order Status Gets Updated (Stripe Buy Button)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1. Provider calls /api/v1/create-payment-intent                           │
│     └── Creates pending order with ID (e.g., "abc123")                      │
│     └── Returns checkoutUrl                                                 │
│                                                                             │
│  2. User redirected to DZTech checkout page                                 │
│     └── Stripe Buy Button rendered with client-reference-id="abc123"        │
│                                                                             │
│  3. User clicks Buy Button → Stripe Checkout                                │
│     └── client_reference_id passed to Stripe session                        │
│                                                                             │
│  4. Payment completes → Stripe fires webhook                                │
│     └── checkout.session.completed event                                    │
│     └── Contains client_reference_id="abc123"                               │
│                                                                             │
│  5. DZTech webhook handler receives event                                   │
│     └── Finds order by client_reference_id                                  │
│     └── Updates order.status = "paid"                                       │
│     └── Notifies provider webhook (if configured)                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key mechanism**: The `client-reference-id` attribute on the Stripe Buy Button links the Stripe checkout session back to the DZTech order, enabling automatic status updates.

---

## Webhook Notifications

If a **Webhook URL** is configured, DZTech sends POST requests when payment status changes.

### Payment Success

```http
POST https://your-provider.com/api/webhooks/dztech
Content-Type: application/json
X-DZTech-Webhook: payment-notification

{
  "event": "payment_succeeded",
  "orderId": "65b...",
  "externalId": "YOUR-INTERNAL-ORDER-ID",
  "providerId": "xyz789",
  "providerName": "Bitloader",
  "serviceId": "abc123",
  "serviceName": "Premium Credits",
  "amount": 100,
  "quantity": 20,
  "status": "paid",
  "stripePaymentIntentId": "pi_xxx",
  "timestamp": "2026-01-30T10:00:00.000Z"
}
```

### Payment Failed

```json
{
  "event": "payment_failed",
  "orderId": "65b...",
  "externalId": "YOUR-INTERNAL-ORDER-ID",
  "providerId": "xyz789",
  "providerName": "Bitloader",
  "serviceId": "abc123",
  "serviceName": "Premium Credits",
  "amount": 100,
  "status": "failed",
  "stripePaymentIntentId": "pi_xxx",
  "timestamp": "2026-01-30T10:00:00.000Z"
}
```

> **Important**: Use the `externalId` field to match webhook notifications with your internal orders.

---

## Complete Integration Example

### Provider Backend (Node.js)

```javascript
// provider-backend/services/payment.js

const DZTECH_API_KEY = process.env.DZTECH_API_KEY

async function createPaymentSession(userId, quantity) {
  // Generate a unique external ID for tracking
  const externalId = `ORDER-${userId}-${Date.now()}`
  
  // Calculate amount (e.g., $5 per unit)
  const amount = quantity * 5

  const response = await fetch('https://dztech.shop/api/v1/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: DZTECH_API_KEY,
      externalId,
      amount,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create payment session')
  }

  const data = await response.json()

  // Store order in your database
  await db.orders.create({
    id: externalId,
    userId,
    quantity,
    amount: data.amount,
    dztechOrderId: data.orderId,
    status: 'pending',
    createdAt: new Date(),
  })

  return {
    checkoutUrl: data.checkoutUrl,
    orderId: data.orderId,
    externalId,
  }
}

module.exports = { createPaymentSession }
```

### Provider Frontend

```javascript
// provider-frontend/components/BuyButton.jsx

async function handleBuy(quantity) {
  try {
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })

    const { checkoutUrl } = await response.json()

    // Redirect to DZTech checkout
    window.location.href = checkoutUrl
  } catch (error) {
    console.error('Payment error:', error)
    alert('Failed to start payment. Please try again.')
  }
}
```

### Provider Webhook Handler

```javascript
// provider-backend/routes/webhooks.js

app.post('/api/webhooks/dztech', async (req, res) => {
  // Verify webhook source
  if (req.headers['x-dztech-webhook'] !== 'payment-notification') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { event, externalId, amount, quantity, status } = req.body

  console.log(`Received ${event} for order ${externalId}`)

  // Find order using YOUR externalId
  const order = await db.orders.findById(externalId)
  
  if (!order) {
    console.error(`Order not found: ${externalId}`)
    return res.status(200).json({ received: true })
  }

  if (event === 'payment_succeeded') {
    await db.orders.update(order.id, { 
      status: 'paid', 
      paidAt: new Date() 
    })
    
    // Grant credits/access to user
    await grantCredits(order.userId, quantity)
    
    // Send confirmation
    await sendConfirmationEmail(order.userId, { amount, quantity })
  } else if (event === 'payment_failed') {
    await db.orders.update(order.id, { status: 'failed' })
    await sendFailureNotification(order.userId)
  }

  // Always respond 200 to acknowledge receipt
  res.status(200).json({ received: true })
})
```

### Provider Success Page

```javascript
// provider-frontend/pages/success.jsx

export default function SuccessPage() {
  const router = useRouter()
  const { orderId } = router.query

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Order Reference: {orderId}</p>
      <p>Your credits have been added to your account.</p>
      <a href="/dashboard">Go to Dashboard</a>
    </div>
  )
}
```

---

## Tracking in Stripe Dashboard

Payments made through DZTech include helpful metadata visible in Stripe:

| Metadata Field     | Description                                    |
| ------------------ | ---------------------------------------------- |
| `serviceId`        | DZTech service ID                              |
| `serviceName`      | Service name (e.g., "Premium Credits")         |
| `quantity`         | Number of units purchased                      |
| `providerId`       | Provider's ID (if applicable)                  |
| `providerName`     | Provider's name (if applicable)                |
| `externalId`       | Provider's internal order ID                   |
| `paymentLinkId`    | Stripe Payment Link ID (if used)               |

**Payment Description Format**:
- With Payment Link: `Premium Credits | PaymentLink: plink_xxx`
- Direct/API: `Premium Credits | Direct`
- With Provider: `Premium Credits | Direct (Bitloader)`

---

## Security Considerations

1. **API Key Protection**: Never expose your API key in frontend code
2. **Webhook Verification**: Always check the `X-DZTech-Webhook` header
3. **HTTPS Only**: All API calls must be over HTTPS
4. **Idempotency**: Handle duplicate webhook notifications gracefully
5. **Order Verification**: Wait for webhook before granting access (don't trust client)

---

## Testing

### Test with cURL

**Cash App Mode** (with custom amount):

```bash
curl -X POST https://app.dztech.shop/api/v1/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_PROVIDER_API_KEY",
    "externalId": "TEST-ORDER-001",
    "amount": 25
  }'
```

**Stripe Buy Button Mode** (fixed/customer-chosen amount):

```bash
curl -X POST https://app.dztech.shop/api/v1/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_PROVIDER_API_KEY",
    "externalId": "TEST-ORDER-001"
  }'

# Response will include: "mode": "stripe_buy_button"
```

### Local Testing

```bash
# Replace with your actual API key from Admin Panel → Providers
API_KEY="provider_xxxxxxxxxxxxxxxx"

curl -X POST http://localhost:3000/api/v1/create-payment-intent \
  -H "Content-Type: application/json" \
  -d "{
    \"apiKey\": \"$API_KEY\",
    \"externalId\": \"TEST-$(date +%s)\"
  }" | jq
```

### Stripe Test Mode

Use Stripe's test mode credentials.

**Cash App testing:**
- Use `$test_cashtag` in the Cash App sandbox
- All test payments will succeed

**Stripe Buy Button testing:**
- Use test card: `4242 4242 4242 4242`
- Any future expiry date and CVC

---

## Troubleshooting

| Issue                               | Solution                                          |
| ----------------------------------- | ------------------------------------------------- |
| "Invalid or inactive API key"       | Check API key, verify provider status is Active   |
| "Amount must be a multiple of 5"    | Ensure amount is divisible by service price (Cash App mode only) |
| "Stripe Buy Button not configured"  | Add `stripeBuyButtonId` to the service in admin panel |
| "Cash App not available"            | Requires US-based Stripe account                  |
| Webhook not received                | Check URL is publicly accessible, responds 200    |
| User not redirected                 | Verify `successRedirectUrl` has `{orderId}`       |
| Duplicate webhooks                  | Implement idempotency using `externalId`          |
| Buy Button not showing              | 1) Verify `stripeBuyButtonId` is saved on service 2) Restart dev server |
| Customer can't adjust amount        | Configure "Customer chooses price" in Stripe Dashboard when creating Payment Link |

---

## Support

For integration support, contact: support@dztech.shop

# QR Generator Integration Guide

This document explains how to integrate your separate QR code generator system with the USV Token application to receive real-time notifications when QR codes are claimed.

## Overview

The USV Token application provides a webhook system that notifies your QR generator whenever a user claims a QR code. This enables your system to:
- Track which QR codes have been claimed in real-time
- Update your internal database with claim status
- Trigger any post-claim workflows (analytics, notifications, etc.)

## Architecture

```
┌──────────────────┐         ┌─────────────────────┐         ┌──────────────┐
│  QR Generator    │         │  USV Token App      │         │   Solana     │
│  (Your System)   │◄────────│  (Webhook System)   │◄────────│  Blockchain  │
└──────────────────┘         └─────────────────────┘         └──────────────┘
    1. Register           2. User claims           3. Webhook
       webhook               QR code                  triggered
```

## API Endpoints

### 1. Verify QR Code (Public)

Check if a QR code exists and get its details without authentication.

**Endpoint:** `GET /api/qr/verify/:code`

**Example:**
```bash
curl https://your-app.replit.app/api/qr/verify/ABC123XYZ
```

**Response:**
```json
{
  "code": "ABC123XYZ",
  "tokens": 100,
  "product": "USV Token",
  "isActive": true,
  "claimed": false
}
```

### 2. Register Webhook

Register your webhook URL to receive notifications when QR codes are claimed.

**Endpoint:** `POST /api/webhooks`

**Request Body:**
```json
{
  "name": "QR Generator Webhook",
  "url": "https://your-qr-generator.com/webhooks/usv-claimed",
  "secret": "your-webhook-secret-key",
  "events": ["qr.claimed"]
}
```

**Response:**
```json
{
  "success": true,
  "webhook": {
    "id": "webhook-uuid",
    "name": "QR Generator Webhook",
    "url": "https://your-qr-generator.com/webhooks/usv-claimed",
    "events": ["qr.claimed"],
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Example:**
```bash
curl -X POST https://your-app.replit.app/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "QR Generator Webhook",
    "url": "https://your-qr-generator.com/webhooks/usv-claimed",
    "secret": "your-webhook-secret-key",
    "events": ["qr.claimed"]
  }'
```

### 3. List Webhooks

Get all registered webhooks.

**Endpoint:** `GET /api/webhooks`

**Response:**
```json
{
  "success": true,
  "webhooks": [
    {
      "id": "webhook-uuid",
      "name": "QR Generator Webhook",
      "url": "https://your-qr-generator.com/webhooks/usv-claimed",
      "events": ["qr.claimed"],
      "isActive": true,
      "lastTriggered": "2025-01-15T12:45:00Z",
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### 4. Update Webhook

Update webhook configuration (URL, status, etc.).

**Endpoint:** `PATCH /api/webhooks/:id`

**Request Body:**
```json
{
  "isActive": false
}
```

### 5. Delete Webhook

Remove a webhook registration.

**Endpoint:** `DELETE /api/webhooks/:id`

## Webhook Payload

When a QR code is claimed, your webhook URL will receive a POST request with the following payload:

```json
{
  "event": "qr.claimed",
  "timestamp": "2025-01-15T12:45:30.123Z",
  "data": {
    "qrCode": {
      "code": "ABC123XYZ",
      "tokenReward": 100,
      "productId": "product-uuid"
    },
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "walletAddress": "9xPz1rG7yQKjL5mN3sT8vW2cX4bH6dF9qR1aK5nM8pL3"
    },
    "transaction": {
      "id": "transaction-uuid",
      "txHash": "5k7m9nB2cD4fG6hJ8lM1nP3qR5sT7vX9zA2bC4dE6fH8j",
      "explorerUrl": "https://solscan.io/tx/5k7m9nB2cD4fG6hJ8lM1nP3qR5sT7vX9zA2bC4dE6fH8j"
    },
    "claimedAt": "2025-01-15T12:45:30.123Z"
  }
}
```

### Security

The webhook request includes a custom header with your secret:
```
X-Webhook-Secret: your-webhook-secret-key
```

**Verify this secret on your endpoint to ensure the request is legitimate.**

## Implementation Example

### Node.js/Express

```javascript
const express = require('express');
const app = express();

app.post('/webhooks/usv-claimed', express.json(), (req, res) => {
  // Verify webhook secret
  const receivedSecret = req.headers['x-webhook-secret'];
  const expectedSecret = process.env.WEBHOOK_SECRET;
  
  if (receivedSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Process webhook payload
  const { event, timestamp, data } = req.body;
  
  if (event === 'qr.claimed') {
    const { qrCode, user, transaction } = data;
    
    console.log(`QR Code ${qrCode.code} claimed by ${user.email}`);
    console.log(`Blockchain transaction: ${transaction.explorerUrl}`);
    
    // Update your database
    updateQRCodeStatus(qrCode.code, {
      claimed: true,
      claimedBy: user.email,
      claimedAt: data.claimedAt,
      blockchainTx: transaction.txHash
    });
  }
  
  // Always respond with 200 to acknowledge receipt
  res.status(200).json({ received: true });
});

app.listen(3000);
```

### Python/Flask

```python
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/webhooks/usv-claimed', methods=['POST'])
def handle_webhook():
    # Verify webhook secret
    received_secret = request.headers.get('X-Webhook-Secret')
    expected_secret = os.environ.get('WEBHOOK_SECRET')
    
    if received_secret != expected_secret:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Process webhook payload
    payload = request.json
    event = payload['event']
    data = payload['data']
    
    if event == 'qr.claimed':
        qr_code = data['qrCode']
        user = data['user']
        transaction = data['transaction']
        
        print(f"QR Code {qr_code['code']} claimed by {user['email']}")
        print(f"Blockchain transaction: {transaction['explorerUrl']}")
        
        # Update your database
        update_qr_code_status(qr_code['code'], {
            'claimed': True,
            'claimed_by': user['email'],
            'claimed_at': data['claimedAt'],
            'blockchain_tx': transaction['txHash']
        })
    
    # Always respond with 200 to acknowledge receipt
    return jsonify({'received': True}), 200

if __name__ == '__main__':
    app.run(port=3000)
```

## Testing

### 1. Register Your Webhook
```bash
curl -X POST https://your-app.replit.app/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Webhook",
    "url": "https://your-webhook-test-url.com/webhook",
    "secret": "test-secret-123"
  }'
```

### 2. Test with a QR Claim
- Create a test QR code in the USV Token app
- Scan and claim the QR code through the app
- Your webhook should receive the notification immediately

### 3. Verify Webhook Delivery
Check your webhook endpoint logs to see if the payload was received correctly.

## Best Practices

1. **Always verify the webhook secret** to prevent unauthorized requests
2. **Respond quickly** (under 10 seconds) - do heavy processing asynchronously
3. **Return 200 OK** to acknowledge receipt, even if processing will happen later
4. **Handle retries gracefully** - webhooks may be sent multiple times
5. **Log webhook payloads** for debugging and audit trails
6. **Use HTTPS** for your webhook endpoints
7. **Monitor webhook failures** using the `lastTriggered` timestamp

## Troubleshooting

### Webhook Not Receiving Notifications

1. Check if webhook is active: `GET /api/webhooks`
2. Verify your URL is publicly accessible (not localhost)
3. Check your server logs for incoming requests
4. Ensure your endpoint returns 200 OK

### Testing Locally

Use a service like [ngrok](https://ngrok.com/) to expose your local server:
```bash
ngrok http 3000
# Use the ngrok URL as your webhook URL
```

## Support

For questions or issues with the webhook integration, please refer to:
- API Documentation: `/api/docs`
- GitHub Issues: [your-repo/issues]
- Email: support@usvtoken.com

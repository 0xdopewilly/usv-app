#!/bin/bash

# Test script for webhook system
# This demonstrates how to register and manage webhooks

BASE_URL="http://localhost:5000/api"

echo "=== USV Token Webhook System Test ==="
echo ""

# Test 1: Register a webhook
echo "1. Registering webhook..."
WEBHOOK_RESPONSE=$(curl -s -X POST "$BASE_URL/webhooks" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test QR Generator Webhook",
    "url": "https://webhook.site/test-endpoint",
    "secret": "test-secret-key-123",
    "events": ["qr.claimed"]
  }')

echo "Response: $WEBHOOK_RESPONSE"
echo ""

# Extract webhook ID (requires jq)
if command -v jq &> /dev/null; then
  WEBHOOK_ID=$(echo "$WEBHOOK_RESPONSE" | jq -r '.webhook.id')
  echo "Webhook ID: $WEBHOOK_ID"
else
  echo "Note: Install jq to extract webhook ID automatically"
fi
echo ""

# Test 2: List all webhooks
echo "2. Listing all webhooks..."
curl -s "$BASE_URL/webhooks" | jq '.' || curl -s "$BASE_URL/webhooks"
echo ""

# Test 3: Update webhook (disable it)
if [ ! -z "$WEBHOOK_ID" ]; then
  echo "3. Disabling webhook..."
  curl -s -X PATCH "$BASE_URL/webhooks/$WEBHOOK_ID" \
    -H "Content-Type: application/json" \
    -d '{"isActive": false}' | jq '.' || echo "Update sent"
  echo ""
fi

# Test 4: List webhooks again to see the change
echo "4. Listing webhooks after update..."
curl -s "$BASE_URL/webhooks" | jq '.' || curl -s "$BASE_URL/webhooks"
echo ""

echo "=== Test Complete ==="
echo ""
echo "To test webhook delivery:"
echo "1. Go to https://webhook.site and get a unique URL"
echo "2. Register a webhook with that URL"
echo "3. Scan and claim a QR code in the app"
echo "4. Check webhook.site to see the notification"

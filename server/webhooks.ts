import { storage } from './storage';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

export class WebhookService {
  async trigger(event: string, data: any): Promise<void> {
    try {
      const webhooks = await storage.getActiveWebhooks(event);
      
      if (webhooks.length === 0) {
        console.log(`No active webhooks for event: ${event}`);
        return;
      }
      
      const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      };
      
      const promises = webhooks.map(webhook => this.sendWebhook(webhook.id, webhook.url, webhook.secret || undefined, payload));
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error triggering webhooks:', error);
    }
  }
  
  private async sendWebhook(webhookId: string, url: string, secret: string | undefined, payload: WebhookPayload): Promise<void> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (secret) {
        headers['X-Webhook-Secret'] = secret;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      if (!response.ok) {
        console.error(`Webhook ${webhookId} failed with status ${response.status}`);
      } else {
        console.log(`Webhook ${webhookId} sent successfully`);
        await storage.updateWebhook(webhookId, { lastTriggered: new Date() });
      }
    } catch (error) {
      console.error(`Error sending webhook ${webhookId}:`, error);
    }
  }
}

export const webhookService = new WebhookService();

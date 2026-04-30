import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface WhatsAppMessagePayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text';
  text: { body: string };
}

export class WhatsAppClient {
  private client: AxiosInstance;
  private phoneNumberId: string;
  private apiKey: string;
  private baseUrl = 'https://graph.instagram.com/v18.0';

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.apiKey = process.env.WHATSAPP_API_KEY || '';

    if (!this.phoneNumberId || !this.apiKey) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_API_KEY required');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  async sendMessage(recipientPhone: string, messageText: string): Promise<string> {
    const payload: WhatsAppMessagePayload = {
      messaging_product: 'whatsapp',
      to: this.normalizePhone(recipientPhone),
      type: 'text',
      text: { body: messageText },
    };

    try {
      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      const messageId = response.data.messages?.[0]?.id || '';
      logger.info('WhatsApp message sent', {
        recipientPhone,
        messageId,
        length: messageText.length,
      });

      return messageId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('WhatsApp send failed', {
          status: error.response?.status,
          message: error.message,
          recipientPhone,
        });
        throw new Error(`WhatsApp API error: ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }

  async sendTemplate(recipientPhone: string, templateName: string, parameters?: object): Promise<string> {
    const payload = {
      messaging_product: 'whatsapp',
      to: this.normalizePhone(recipientPhone),
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'he' },
        parameters: parameters || {},
      },
    };

    try {
      const response = await this.client.post(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      const messageId = response.data.messages?.[0]?.id || '';
      logger.info('WhatsApp template sent', {
        recipientPhone,
        templateName,
        messageId,
      });

      return messageId;
    } catch (error) {
      logger.error('WhatsApp template send failed', {
        recipientPhone,
        templateName,
        error,
      });
      throw error;
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await this.client.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      });

      logger.debug('Message marked as read', { messageId });
    } catch (error) {
      logger.warn('Failed to mark message as read', { messageId, error });
    }
  }

  private normalizePhone(phone: string): string {
    // Remove all non-digits and ensure country code (972 for Israel)
    const cleaned = phone.replace(/\D/g, '');
    const withCountry = cleaned.startsWith('972') ? cleaned : `972${cleaned.slice(1)}`;
    return withCountry;
  }
}

export const whatsappClient = new WhatsAppClient();

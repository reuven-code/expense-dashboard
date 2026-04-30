import axios, { AxiosInstance } from 'axios';
import NodeCache from 'node-cache';
import { logger } from '../utils/logger';

export interface GeminiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeminiResponse {
  content: string;
  tokens: { input: number; output: number };
  cached: boolean;
}

export class GeminiClient {
  private client: AxiosInstance;
  private apiKey: string;
  private cache: NodeCache;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    this.client = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Cache: 3600s (1 hour) TTL, check every 600s
    this.cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
  }

  private getCacheKey(businessId: string, customerId: string): string {
    return `gemini:${businessId}:${customerId}`;
  }

  async extractAppointmentIntent(
    businessId: string,
    customerId: string,
    message: string,
    context?: { name?: string; phone?: string; services?: string[] }
  ): Promise<GeminiResponse> {
    const cacheKey = this.getCacheKey(businessId, customerId);
    const cached = this.cache.get<GeminiResponse>(cacheKey);

    if (cached) {
      logger.info('Cache hit', { businessId, customerId, cached: true });
      return cached;
    }

    const systemPrompt = `You are an appointment booking assistant for an Israeli barbershop/salon.
Extract appointment intent from customer messages in Hebrew or English.

Return ONLY valid JSON (no markdown, no formatting):
{
  "intent": "book" | "reschedule" | "cancel" | "check_availability" | "other",
  "confidence": 0-1,
  "extracted_data": {
    "service": "string or null (haircut, shave, coloring, etc)",
    "preferred_date": "YYYY-MM-DD or null",
    "preferred_time": "HH:MM or null",
    "reason_if_cancellation": "string or null"
  },
  "requires_confirmation": true | false
}`;

    const userMessage = `Customer: ${context?.name || 'Unknown'}
Phone: ${context?.phone || 'Unknown'}
Services available: ${context?.services?.join(', ') || 'General'}

Message: "${message}"`;

    try {
      const response = await this.client.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt + '\n\n' + userMessage }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 256,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }
      );

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const inputTokens = response.data.usageMetadata?.promptTokenCount || 0;
      const outputTokens = response.data.usageMetadata?.candidatesTokenCount || 0;

      logger.info('Gemini API call successful', {
        businessId,
        customerId,
        inputTokens,
        outputTokens,
      });

      // Validate JSON response
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        logger.warn('Invalid JSON from Gemini', { content, error: e });
        parsed = {
          intent: 'other',
          confidence: 0,
          extracted_data: {},
          requires_confirmation: false,
        };
      }

      const result: GeminiResponse = {
        content: JSON.stringify(parsed),
        tokens: { input: inputTokens, output: outputTokens },
        cached: false,
      };

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Gemini API error', {
          status: error.response?.status,
          message: error.message,
          businessId,
        });
        throw new Error(`Gemini API error: ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }

  async validateAppointmentFeasibility(
    businessId: string,
    appointmentRequest: {
      date: string;
      time: string;
      service: string;
      duration_minutes: number;
    },
    staffAvailability: { date: string; available_slots: string[] }[]
  ): Promise<GeminiResponse> {
    const prompt = `Validate if the following appointment request is feasible:
Request: ${JSON.stringify(appointmentRequest)}

Available staff slots:
${staffAvailability.map((d) => `${d.date}: ${d.available_slots.join(', ')}`).join('\n')}

Return ONLY JSON:
{
  "feasible": true | false,
  "reason": "string",
  "alternative_times": ["HH:MM", ...] or []
}`;

    try {
      const response = await this.client.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 128,
          },
        }
      );

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const inputTokens = response.data.usageMetadata?.promptTokenCount || 0;
      const outputTokens = response.data.usageMetadata?.candidatesTokenCount || 0;

      return {
        content,
        tokens: { input: inputTokens, output: outputTokens },
        cached: false,
      };
    } catch (error) {
      logger.error('Gemini validation error', { businessId, error });
      throw error;
    }
  }

  clearCache(): void {
    this.cache.flushAll();
    logger.info('Gemini cache cleared');
  }

  getStats() {
    return {
      keys: this.cache.keys().length,
      stats: this.cache.getStats(),
    };
  }
}

export const geminiClient = new GeminiClient();

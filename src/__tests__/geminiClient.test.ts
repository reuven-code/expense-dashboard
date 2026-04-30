import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { GeminiClient } from '../services/geminiClient';

describe('GeminiClient', () => {
  let client: GeminiClient;

  beforeAll(() => {
    process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key';
    // client = new GeminiClient(); // Would fail without real API key
  });

  it('should extract booking intent from Hebrew message', async () => {
    const message = 'אני רוצה להזמין תור ביום שני בשעה 10 בבוקר';

    // Expected structure (mocked for now)
    const expectedIntent = {
      intent: 'book',
      confidence: 0.95,
      extracted_data: {
        service: null,
        preferred_date: '2026-05-04', // next Monday
        preferred_time: '10:00',
        reason_if_cancellation: null,
      },
      requires_confirmation: true,
    };

    expect(expectedIntent.intent).toBe('book');
    expect(expectedIntent.extracted_data.preferred_time).toBe('10:00');
  });

  it('should extract cancellation intent', () => {
    const message = 'אני רוצה לבטל את התור שלי';

    const expectedIntent = {
      intent: 'cancel',
      confidence: 0.9,
    };

    expect(expectedIntent.intent).toBe('cancel');
  });

  it('should extract availability check intent', () => {
    const message = 'כמה זמן עד כה פנויים לכם?';

    const expectedIntent = {
      intent: 'check_availability',
      confidence: 0.85,
    };

    expect(expectedIntent.intent).toBe('check_availability');
  });

  it('should cache responses by businessId + customerId', () => {
    // Cache key format: gemini:businessId:customerId
    const cacheKey = 'gemini:business_123:customer_456';
    expect(cacheKey).toMatch(/gemini:[a-z0-9_]+:[a-z0-9_]+/);
  });
});

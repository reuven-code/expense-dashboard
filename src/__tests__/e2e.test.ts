import axios from 'axios';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_BASE_URL = 'http://localhost:3000/api';
const BUSINESS_ID = 'test-business-1';

describe('Barber Agent E2E Tests - Week 4', () => {
  let authToken: string;
  let appointmentId: string;
  let staffId: string;

  beforeAll(() => {
    // Setup: Get auth token from test account
    authToken = process.env.TEST_AUTH_TOKEN || 'test-token';
  });

  // ============ APPOINTMENT FLOW TESTS ============

  describe('Appointment Workflow', () => {
    it('should check availability for a given date', async () => {
      const response = await axios.get(`${API_BASE_URL}/availability/${BUSINESS_ID}/2026-05-20`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('date');
      expect(response.data).toHaveProperty('best_slots');
      expect(Array.isArray(response.data.best_slots)).toBe(true);
    });

    it('should create an appointment with valid data', async () => {
      const appointmentData = {
        customer_name: 'רובי דוידוב',
        customer_phone: '0546598636',
        service: 'haircut',
        date: '2026-05-20',
        time: '10:00',
        duration_minutes: 30,
        notes: 'קצוץ קצר',
      };

      const response = await axios.post(`${API_BASE_URL}/appointments/${BUSINESS_ID}`, appointmentData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(201);
      expect(response.data.appointment).toHaveProperty('id');
      expect(response.data.appointment.status).toMatch(/confirmed|pending/);
      appointmentId = response.data.appointment.id;
    });

    it('should confirm pending appointment', async () => {
      if (!appointmentId) {
        // Skip if creation failed
        return;
      }

      const response = await axios.patch(
        `${API_BASE_URL}/appointments/${BUSINESS_ID}/${appointmentId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data.appointment.status).toBe('confirmed');
    });

    it('should cancel appointment', async () => {
      // Create a new appointment to cancel
      const appointmentData = {
        customer_name: 'בדיקה ביטול',
        customer_phone: '0546598636',
        service: 'shave',
        date: '2026-05-21',
        time: '14:00',
      };

      const createResponse = await axios.post(
        `${API_BASE_URL}/appointments/${BUSINESS_ID}`,
        appointmentData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const toCancel = createResponse.data.appointment.id;

      const cancelResponse = await axios.patch(
        `${API_BASE_URL}/appointments/${BUSINESS_ID}/${toCancel}/cancel`,
        { reason: 'Customer requested cancellation' },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(cancelResponse.status).toBe(200);
    });

    it('should list appointments with filters', async () => {
      const response = await axios.get(`${API_BASE_URL}/appointments/${BUSINESS_ID}`, {
        params: { date: '2026-05-20' },
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.appointments)).toBe(true);
    });
  });

  // ============ STAFF MANAGEMENT TESTS ============

  describe('Staff Management', () => {
    it('should create staff member', async () => {
      const staffData = {
        name: 'ראובן זוקר',
        phone: '0546598636',
        email: 'reuven@barber.co.il',
        specialties: ['haircut', 'shave'],
      };

      const response = await axios.post(`${API_BASE_URL}/staff/${BUSINESS_ID}`, staffData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(201);
      expect(response.data.staff).toHaveProperty('id');
      staffId = response.data.staff.id;
    });

    it('should list staff members', async () => {
      const response = await axios.get(`${API_BASE_URL}/staff/${BUSINESS_ID}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.staff)).toBe(true);
    });

    it('should delete staff member', async () => {
      if (!staffId) return;

      const response = await axios.delete(`${API_BASE_URL}/staff/${BUSINESS_ID}/${staffId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
    });
  });

  // ============ BUSINESS HOURS TESTS ============

  describe('Business Hours Configuration', () => {
    it('should get business hours', async () => {
      const response = await axios.get(`${API_BASE_URL}/business-hours/${BUSINESS_ID}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('Monday');
      expect(response.data).toHaveProperty('Sunday');
    });

    it('should update business hours', async () => {
      const hoursData = {
        Monday: { open: '08:00', close: '19:00', closed: false },
        Tuesday: { open: '08:00', close: '19:00', closed: false },
        Wednesday: { open: '08:00', close: '19:00', closed: false },
        Thursday: { open: '08:00', close: '19:00', closed: false },
        Friday: { open: '08:00', close: '18:00', closed: false },
        Saturday: { open: '00:00', close: '00:00', closed: true },
        Sunday: { open: '10:00', close: '17:00', closed: false },
      };

      const response = await axios.patch(
        `${API_BASE_URL}/business-hours/${BUSINESS_ID}`,
        hoursData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(response.status).toBe(200);
    });
  });

  // ============ SECURITY TESTS ============

  describe('Security & Validation', () => {
    it('should reject invalid phone number', async () => {
      const badData = {
        customer_name: 'בדיקה',
        customer_phone: 'invalid-phone',
        service: 'haircut',
        date: '2026-05-20',
        time: '10:00',
      };

      try {
        await axios.post(`${API_BASE_URL}/appointments/${BUSINESS_ID}`, badData, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        expect(true).toBe(false); // Should have thrown
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }
    });

    it('should reject missing required fields', async () => {
      const badData = {
        customer_name: 'בדיקה',
        // missing other required fields
      };

      try {
        await axios.post(`${API_BASE_URL}/appointments/${BUSINESS_ID}`, badData, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.response?.status).toBe(400);
      }
    });

    it('should enforce rate limiting', async () => {
      const promises = [];
      for (let i = 0; i < 12; i++) {
        promises.push(
          axios.get(`${API_BASE_URL}/appointments/${BUSINESS_ID}`).catch((e) => e)
        );
      }

      const results = await Promise.all(promises);
      const rateLimited = results.some((r) => r.response?.status === 429);
      expect(rateLimited).toBe(true);
    });

    it('should reject unauthenticated requests', async () => {
      try {
        await axios.get(`${API_BASE_URL}/appointments/${BUSINESS_ID}`);
        expect(true).toBe(false); // Should have thrown
      } catch (error: any) {
        expect(error.response?.status).toBe(401);
      }
    });
  });

  // ============ PERFORMANCE TESTS ============

  describe('Performance Benchmarks', () => {
    it('should respond within 500ms for appointment list', async () => {
      const start = Date.now();
      await axios.get(`${API_BASE_URL}/appointments/${BUSINESS_ID}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });

    it('should respond within 300ms for availability check', async () => {
      const start = Date.now();
      await axios.get(`${API_BASE_URL}/availability/${BUSINESS_ID}/2026-05-20`);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(300);
    });
  });
});

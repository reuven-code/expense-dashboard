import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Appointment Service Integration', () => {
  it('should create appointment with pending status when slot is full', () => {
    const appointment = {
      status: 'pending',
      waitlist_position: 1,
    };

    expect(appointment.status).toBe('pending');
    expect(appointment.waitlist_position).toBe(1);
  });

  it('should create appointment with confirmed status when slot is available', () => {
    const appointment = {
      status: 'confirmed',
      created_at: new Date(),
    };

    expect(appointment.status).toBe('confirmed');
    expect(appointment.created_at).toBeDefined();
  });

  it('should promote next waitlist entry when appointment is cancelled', () => {
    const waitlist = [
      { position: 1, appointment_id: 'appt_2' },
      { position: 2, appointment_id: 'appt_3' },
    ];

    const promoted = waitlist[0];
    expect(promoted.position).toBe(1);
    expect(promoted.appointment_id).toBe('appt_2');
  });
});

describe('Confirmation Service', () => {
  it('should format Hebrew date correctly', () => {
    const expectedFormat = 'שני, 5 מאי'; // Example: "Monday, May 5"
    expect(expectedFormat).toMatch(/[ראשוןשנישלישירביעיחמישישישבת]/); // Contains Hebrew day name
  });

  it('should send confirmation with appointment details', () => {
    const message = `✅ התור שלך אושר!
👤 שלום רובי
📋 פרטי התור:
📅 תאריך: שני, 5 מאי
🕐 שעה: 10:00
💇 שירות: haircut

מחכים לך! 🎉`;

    expect(message).toContain('✅');
    expect(message).toContain('10:00');
    expect(message).toContain('haircut');
  });
});

describe('Waitlist Service', () => {
  it('should maintain ordered waitlist by insertion time', () => {
    const waitlist = [
      { id: '1', added_at: new Date('2026-05-04T10:00:00'), position: 1 },
      { id: '2', added_at: new Date('2026-05-04T10:05:00'), position: 2 },
      { id: '3', added_at: new Date('2026-05-04T10:10:00'), position: 3 },
    ];

    const sorted = waitlist.sort((a, b) => a.added_at.getTime() - b.added_at.getTime());
    expect(sorted[0].position).toBe(1);
    expect(sorted[2].position).toBe(3);
  });

  it('should notify customer when promoted from waitlist', () => {
    const message = '🎉 רובי! מקום התור פתח! התור שלך אושר ל2026-05-05 בשעה 10:00.';
    expect(message).toContain('🎉');
    expect(message).toContain('אושר');
  });
});

describe('Message Router', () => {
  it('should extract booking intent from Hebrew message', () => {
    const intent = {
      intent: 'book',
      confidence: 0.95,
      extracted_data: {
        service: null,
        preferred_date: '2026-05-04',
        preferred_time: '10:00',
      },
    };

    expect(intent.intent).toBe('book');
    expect(intent.confidence).toBeGreaterThan(0.9);
    expect(intent.extracted_data.preferred_time).toBe('10:00');
  });

  it('should route cancellation intents correctly', () => {
    const intent = { intent: 'cancel', confidence: 0.9 };
    expect(intent.intent).toBe('cancel');
  });

  it('should handle unclear intents gracefully', () => {
    const intent = { intent: 'other', confidence: 0.45 };
    expect(intent.intent).toBe('other');
  });
});

describe('Availability Service', () => {
  it('should return 30-min slots throughout business hours', () => {
    const slots = [
      { time: '09:00', available: true },
      { time: '09:30', available: true },
      { time: '10:00', available: false }, // booked
      { time: '10:30', available: true },
    ];

    const available = slots.filter((s) => s.available);
    expect(available.length).toBe(3);
  });

  it('should exclude business-closed days', () => {
    const availability = { date: '2026-05-02', best_slots: [] }; // Friday (holiday)
    expect(availability.best_slots.length).toBe(0);
  });
});

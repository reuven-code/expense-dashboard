import { db } from '../config/firebase';
import { logger } from '../utils/logger';

export interface TimeSlot {
  time: string;
  available: boolean;
  staffId?: string;
}

export interface AvailabilityResponse {
  date: string;
  best_slots: TimeSlot[];
  full_slots?: TimeSlot[];
}

export class AvailabilityService {
  async getAvailableSlots(
    businessId: string,
    date: string,
    serviceDuration: number = 30
  ): Promise<AvailabilityResponse> {
    try {
      // Get business hours
      const businessDoc = await db.collection('businesses').doc(businessId).get();
      if (!businessDoc.exists) {
        throw new Error(`Business ${businessId} not found`);
      }

      const businessData = businessDoc.data() || {};
      const hours = businessData.hours || {};

      // Get day name (Monday-Sunday)
      const date_obj = new Date(date);
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
        date_obj.getDay()
      ];

      const dayHours = hours[dayName] || { open: null, close: null };
      if (!dayHours.open) {
        logger.info('Business closed on requested date', { businessId, date, dayName });
        return { date, best_slots: [] };
      }

      // Get staff availability
      const staffDocs = await db.collection('businesses').doc(businessId).collection('staff').get();
      const staff = staffDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get appointments for the date
      const appointmentsSnapshot = await db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .where('date', '==', date)
        .where('status', 'in', ['confirmed', 'pending'])
        .get();

      const bookedSlots = new Set<string>();
      appointmentsSnapshot.docs.forEach((doc) => {
        const appt = doc.data();
        const startTime = appt.time;
        const duration = appt.duration_minutes || 30;
        bookedSlots.add(this.generateSlotId(startTime, duration));
      });

      // Generate available slots
      const slots = this.generateSlots(dayHours.open, dayHours.close, serviceDuration, bookedSlots);

      // Return best 3 slots (avoid early morning, lunch hours)
      const best_slots = slots
        .filter((slot) => {
          const hour = parseInt(slot.time.split(':')[0]);
          return hour >= 9 && hour < 20; // 9 AM - 8 PM
        })
        .slice(0, 3);

      logger.info('Availability computed', {
        businessId,
        date,
        available: best_slots.length,
      });

      return {
        date,
        best_slots,
        full_slots: slots, // optional, for admin view
      };
    } catch (error) {
      logger.error('Availability check failed', { businessId, date, error });
      throw error;
    }
  }

  private generateSlots(openTime: string, closeTime: string, slotDuration: number, booked: Set<string>): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    let current = new Date();
    current.setHours(openHour, openMin, 0, 0);
    const end = new Date();
    end.setHours(closeHour, closeMin, 0, 0);

    while (current < end) {
      const time = current.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
      const slotId = this.generateSlotId(time, slotDuration);
      const available = !booked.has(slotId);

      slots.push({ time, available });
      current.setMinutes(current.getMinutes() + slotDuration);
    }

    return slots;
  }

  private generateSlotId(time: string, duration: number): string {
    return `${time}_${duration}`;
  }

  async checkStaffAvailability(businessId: string, staffId: string, date: string, time: string): Promise<boolean> {
    try {
      const appointmentsSnapshot = await db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .where('staff_id', '==', staffId)
        .where('date', '==', date)
        .where('time', '==', time)
        .where('status', 'in', ['confirmed', 'pending'])
        .get();

      return appointmentsSnapshot.empty;
    } catch (error) {
      logger.error('Staff availability check failed', { businessId, staffId, date, time, error });
      throw error;
    }
  }
}

export const availabilityService = new AvailabilityService();

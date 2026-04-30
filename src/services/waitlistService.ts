import { db } from '../config/firebase';
import { logger } from '../utils/logger';
import { whatsappClient } from './whatsappClient';

export interface WaitlistEntry {
  id: string;
  appointment_id: string;
  business_id: string;
  customer_phone: string;
  customer_name: string;
  requested_date: string;
  requested_time: string;
  service: string;
  added_at: Date;
  position: number;
  promoted_to?: string; // appointment ID if promoted
}

export class WaitlistService {
  async addToWaitlist(appointmentId: string, businessId: string, position: number): Promise<void> {
    try {
      const appointmentDoc = await db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .doc(appointmentId)
        .get();

      if (!appointmentDoc.exists) {
        throw new Error(`Appointment ${appointmentId} not found`);
      }

      const appt = appointmentDoc.data() || {};

      await db.collection('businesses').doc(businessId).collection('waitlist').add({
        appointment_id: appointmentId,
        customer_phone: appt.customer_phone,
        customer_name: appt.customer_name,
        requested_date: appt.date,
        requested_time: appt.time,
        service: appt.service,
        added_at: new Date(),
        position,
      });

      const notifyMessage = `⏳ התור שלך בתור ההמתנה במקום #${position}. נודיע לך כשתהיה זמינות!`;
      await whatsappClient.sendMessage(appt.customer_phone, notifyMessage);

      logger.info('Added to waitlist', {
        appointmentId,
        businessId,
        position,
        customer: appt.customer_phone,
      });
    } catch (error) {
      logger.error('Failed to add to waitlist', { appointmentId, businessId, error });
      throw error;
    }
  }

  async promoteFromWaitlist(
    businessId: string,
    date: string,
    time: string
  ): Promise<{ promoted: boolean; appointmentId?: string }> {
    try {
      // Get next waitlist entry for this date/time
      const waitlistSnapshot = await db
        .collection('businesses')
        .doc(businessId)
        .collection('waitlist')
        .where('requested_date', '==', date)
        .where('requested_time', '==', time)
        .orderBy('added_at', 'asc')
        .limit(1)
        .get();

      if (waitlistSnapshot.empty) {
        logger.debug('No waitlist entries to promote', { businessId, date, time });
        return { promoted: false };
      }

      const waitlistDoc = waitlistSnapshot.docs[0];
      const entry = waitlistDoc.data() as WaitlistEntry;

      // Mark corresponding appointment as confirmed
      await db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .doc(entry.appointment_id)
        .update({
          status: 'confirmed',
          confirmed_at: new Date(),
          waitlist_position: null,
        });

      // Remove from waitlist
      await waitlistDoc.ref.delete();

      // Notify customer
      const notifyMessage = `🎉 ${entry.customer_name}! מקום התור פתח! התור שלך אושר ל${date} בשעה ${time}. נראה אותך שם!`;
      await whatsappClient.sendMessage(entry.customer_phone, notifyMessage);

      logger.info('Promoted from waitlist', {
        appointmentId: entry.appointment_id,
        businessId,
        customer: entry.customer_phone,
      });

      return { promoted: true, appointmentId: entry.appointment_id };
    } catch (error) {
      logger.error('Failed to promote from waitlist', { businessId, date, time, error });
      throw error;
    }
  }

  async getWaitlist(businessId: string, limit: number = 50): Promise<WaitlistEntry[]> {
    try {
      const snapshot = await db
        .collection('businesses')
        .doc(businessId)
        .collection('waitlist')
        .orderBy('added_at', 'asc')
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WaitlistEntry[];
    } catch (error) {
      logger.error('Failed to fetch waitlist', { businessId, error });
      throw error;
    }
  }

  async notifyWaitlistOfAlternatives(
    businessId: string,
    originalDate: string,
    originalTime: string
  ): Promise<void> {
    try {
      // Get waitlist entries for this time slot
      const waitlistSnapshot = await db
        .collection('businesses')
        .doc(businessId)
        .collection('waitlist')
        .where('requested_date', '==', originalDate)
        .where('requested_time', '==', originalTime)
        .get();

      if (waitlistSnapshot.empty) {
        return;
      }

      // Get next available slot (simplified — next day, same time)
      const nextDate = new Date(originalDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      for (const doc of waitlistSnapshot.docs) {
        const entry = doc.data() as WaitlistEntry;
        const message = `${entry.customer_name}, התור בשעה ${originalTime} מלא. האם ${nextDateStr} בשעה ${originalTime} מתאים?`;

        try {
          await whatsappClient.sendMessage(entry.customer_phone, message);
        } catch (error) {
          logger.warn('Failed to notify waitlist customer', {
            phone: entry.customer_phone,
            error,
          });
        }
      }

      logger.info('Notified waitlist of alternatives', {
        businessId,
        affectedCount: waitlistSnapshot.size,
      });
    } catch (error) {
      logger.error('Failed to notify waitlist', { businessId, error });
      throw error;
    }
  }

  async removeFromWaitlist(businessId: string, appointmentId: string): Promise<void> {
    try {
      const snapshot = await db
        .collection('businesses')
        .doc(businessId)
        .collection('waitlist')
        .where('appointment_id', '==', appointmentId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        await snapshot.docs[0].ref.delete();
        logger.info('Removed from waitlist', { appointmentId, businessId });
      }
    } catch (error) {
      logger.error('Failed to remove from waitlist', { appointmentId, businessId, error });
      throw error;
    }
  }
}

export const waitlistService = new WaitlistService();

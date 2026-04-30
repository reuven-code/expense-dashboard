import { db } from '../config/firebase';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface AppointmentInput {
  business_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  service: string;
  date: string;
  time: string;
  duration_minutes?: number;
  notes?: string;
}

export interface Appointment extends AppointmentInput {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: Date;
  confirmed_at?: Date;
  reminder_sent?: boolean;
  waitlist_position?: number;
}

export class AppointmentService {
  async createAppointment(input: AppointmentInput): Promise<Appointment> {
    const appointmentId = uuidv4();
    const now = new Date();

    // Check availability
    const conflictSnapshot = await db
      .collection('businesses')
      .doc(input.business_id)
      .collection('appointments')
      .where('date', '==', input.date)
      .where('time', '==', input.time)
      .where('status', 'in', ['confirmed', 'pending'])
      .limit(1)
      .get();

    let status: 'pending' | 'confirmed' = 'pending';
    let waitlist_position: number | undefined;

    if (!conflictSnapshot.empty) {
      // Add to waitlist
      const waitlistSnapshot = await db
        .collection('businesses')
        .doc(input.business_id)
        .collection('appointments')
        .where('date', '==', input.date)
        .where('time', '==', input.time)
        .where('status', '==', 'pending')
        .get();

      waitlist_position = waitlistSnapshot.size + 1;
      logger.info('Appointment added to waitlist', {
        businessId: input.business_id,
        position: waitlist_position,
      });
    } else {
      status = 'confirmed';
      logger.info('Appointment confirmed immediately', {
        businessId: input.business_id,
        date: input.date,
        time: input.time,
      });
    }

    const appointment: Appointment = {
      id: appointmentId,
      ...input,
      status,
      created_at: now,
      duration_minutes: input.duration_minutes || 30,
      waitlist_position,
    };

    try {
      await db
        .collection('businesses')
        .doc(input.business_id)
        .collection('appointments')
        .doc(appointmentId)
        .set(appointment);

      // Log audit event
      await this.logAudit(input.business_id, 'appointment_created', appointmentId, {
        status,
        waitlist_position,
      });

      logger.info('Appointment created', {
        appointmentId,
        businessId: input.business_id,
        status,
      });

      return appointment;
    } catch (error) {
      logger.error('Failed to create appointment', {
        businessId: input.business_id,
        error,
      });
      throw error;
    }
  }

  async confirmAppointment(businessId: string, appointmentId: string): Promise<Appointment> {
    try {
      const appointmentRef = db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .doc(appointmentId);

      const appointmentDoc = await appointmentRef.get();
      if (!appointmentDoc.exists) {
        throw new Error(`Appointment ${appointmentId} not found`);
      }

      const appointment = appointmentDoc.data() as Appointment;

      await appointmentRef.update({
        status: 'confirmed',
        confirmed_at: new Date(),
      });

      await this.logAudit(businessId, 'appointment_confirmed', appointmentId, {});

      logger.info('Appointment confirmed', { appointmentId, businessId });

      return { ...appointment, status: 'confirmed', confirmed_at: new Date() };
    } catch (error) {
      logger.error('Failed to confirm appointment', { businessId, appointmentId, error });
      throw error;
    }
  }

  async cancelAppointment(businessId: string, appointmentId: string, reason?: string): Promise<void> {
    try {
      const appointmentRef = db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .doc(appointmentId);

      await appointmentRef.update({
        status: 'cancelled',
        cancellation_reason: reason || 'Customer requested',
      });

      await this.logAudit(businessId, 'appointment_cancelled', appointmentId, { reason });

      // Check if there are waitlist appointments to promote
      const cancelledAppt = (await appointmentRef.get()).data() as Appointment;
      await this.promoteFromWaitlist(businessId, cancelledAppt.date, cancelledAppt.time);

      logger.info('Appointment cancelled', { appointmentId, businessId });
    } catch (error) {
      logger.error('Failed to cancel appointment', { businessId, appointmentId, error });
      throw error;
    }
  }

  async getAppointment(businessId: string, appointmentId: string): Promise<Appointment | null> {
    try {
      const doc = await db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .doc(appointmentId)
        .get();

      return (doc.data() as Appointment) || null;
    } catch (error) {
      logger.error('Failed to fetch appointment', { businessId, appointmentId, error });
      throw error;
    }
  }

  async getAppointmentsByCustomer(businessId: string, customerId: string): Promise<Appointment[]> {
    try {
      const snapshot = await db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .where('customer_id', '==', customerId)
        .orderBy('date', 'desc')
        .get();

      return snapshot.docs.map((doc) => doc.data() as Appointment);
    } catch (error) {
      logger.error('Failed to fetch customer appointments', { businessId, customerId, error });
      throw error;
    }
  }

  async getAppointmentsByDate(businessId: string, date: string): Promise<Appointment[]> {
    try {
      const snapshot = await db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .where('date', '==', date)
        .where('status', 'in', ['confirmed', 'pending'])
        .orderBy('time', 'asc')
        .get();

      return snapshot.docs.map((doc) => doc.data() as Appointment);
    } catch (error) {
      logger.error('Failed to fetch appointments by date', { businessId, date, error });
      throw error;
    }
  }

  private async promoteFromWaitlist(businessId: string, date: string, time: string): Promise<void> {
    try {
      const waitlistSnapshot = await db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .where('date', '==', date)
        .where('time', '==', time)
        .where('status', '==', 'pending')
        .orderBy('created_at', 'asc')
        .limit(1)
        .get();

      if (!waitlistSnapshot.empty) {
        const nextAppt = waitlistSnapshot.docs[0];
        await nextAppt.ref.update({
          status: 'confirmed',
          confirmed_at: new Date(),
          waitlist_position: null,
        });

        await this.logAudit(businessId, 'appointment_promoted_from_waitlist', nextAppt.id, {});

        logger.info('Promoted appointment from waitlist', {
          appointmentId: nextAppt.id,
          businessId,
        });
      }
    } catch (error) {
      logger.error('Failed to promote from waitlist', { businessId, date, time, error });
      // Don't throw — waitlist promotion failure shouldn't break the flow
    }
  }

  private async logAudit(businessId: string, action: string, appointmentId: string, meta: object): Promise<void> {
    try {
      await db.collection('audit_logs').add({
        business_id: businessId,
        appointment_id: appointmentId,
        action,
        meta,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.warn('Failed to log audit event', { action, appointmentId, error });
    }
  }
}

export const appointmentService = new AppointmentService();

import { db } from '../config/firebase';
import { logger } from '../utils/logger';
import { whatsappClient } from './whatsappClient';

export interface ConfirmationPayload {
  business_id: string;
  appointment_id: string;
  customer_phone: string;
  customer_name: string;
  service: string;
  date: string;
  time: string;
}

export class ConfirmationService {
  async sendConfirmation(payload: ConfirmationPayload): Promise<string> {
    const message = this.buildConfirmationMessage(payload);

    try {
      const messageId = await whatsappClient.sendMessage(payload.customer_phone, message);

      // Log confirmation sent
      await db.collection('confirmation_logs').add({
        appointment_id: payload.appointment_id,
        business_id: payload.business_id,
        customer_phone: payload.customer_phone,
        message_id: messageId,
        sent_at: new Date(),
        status: 'sent',
      });

      logger.info('Confirmation message sent', {
        appointmentId: payload.appointment_id,
        messageId,
        to: payload.customer_phone,
      });

      return messageId;
    } catch (error) {
      logger.error('Failed to send confirmation message', {
        appointmentId: payload.appointment_id,
        phone: payload.customer_phone,
        error,
      });

      // Log failure
      await db.collection('confirmation_logs').add({
        appointment_id: payload.appointment_id,
        business_id: payload.business_id,
        customer_phone: payload.customer_phone,
        sent_at: new Date(),
        status: 'failed',
        error: String(error),
      });

      throw error;
    }
  }

  async sendReminder(appointmentId: string, businessId: string): Promise<void> {
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

      const appointment = appointmentDoc.data() || {};

      // Check if reminder already sent
      if (appointment.reminder_sent) {
        logger.debug('Reminder already sent for appointment', { appointmentId });
        return;
      }

      const reminderMessage = `📞 תזכורת: התור שלך ב${appointment.service} הוא ביום ${appointment.date} בשעה ${appointment.time}. נראה אותך שם! 💪`;

      await whatsappClient.sendMessage(appointment.customer_phone, reminderMessage);

      // Update appointment record
      await appointmentDoc.ref.update({
        reminder_sent: true,
        reminder_sent_at: new Date(),
      });

      logger.info('Reminder sent', { appointmentId, businessId });
    } catch (error) {
      logger.error('Failed to send reminder', { appointmentId, businessId, error });
      throw error;
    }
  }

  async sendBulkReminders(businessId: string, daysAhead: number = 1): Promise<{ sent: number; failed: number }> {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);
      const dateStr = targetDate.toISOString().split('T')[0];

      const appointmentsSnapshot = await db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .where('date', '==', dateStr)
        .where('status', '==', 'confirmed')
        .where('reminder_sent', '==', false)
        .get();

      let sent = 0;
      let failed = 0;

      for (const doc of appointmentsSnapshot.docs) {
        try {
          await this.sendReminder(doc.id, businessId);
          sent++;
        } catch (error) {
          logger.warn('Failed to send individual reminder', { appointmentId: doc.id, error });
          failed++;
        }
      }

      logger.info('Bulk reminders completed', { businessId, sent, failed });
      return { sent, failed };
    } catch (error) {
      logger.error('Bulk reminder send failed', { businessId, error });
      throw error;
    }
  }

  async sendCancellationNotice(
    businessId: string,
    appointmentId: string,
    customerPhone: string,
    reason?: string
  ): Promise<void> {
    const message = `תור שלך בוטל. סיבה: ${reason || 'בקשת הלקוח'}. צור קשר עם העסק אם יש שאלות 📞`;

    try {
      await whatsappClient.sendMessage(customerPhone, message);

      await db.collection('confirmation_logs').add({
        appointment_id: appointmentId,
        business_id: businessId,
        customer_phone: customerPhone,
        sent_at: new Date(),
        status: 'cancellation_notice',
      });

      logger.info('Cancellation notice sent', { appointmentId, businessId });
    } catch (error) {
      logger.error('Failed to send cancellation notice', { appointmentId, error });
      throw error;
    }
  }

  private buildConfirmationMessage(payload: ConfirmationPayload): string {
    return `✅ התור שלך אושר!

👤 שלום ${payload.customer_name}
📋 פרטי התור:
📅 תאריך: ${this.formatHebDate(payload.date)}
🕐 שעה: ${payload.time}
💇 שירות: ${payload.service}

מחכים לך! 🎉
לביטול או שינוי, אנא שלח הודעה`;
  }

  private formatHebDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const monthNames = [
      'ינואר',
      'פברואר',
      'מרץ',
      'אפריל',
      'מאי',
      'יוני',
      'יולי',
      'אוגוסט',
      'ספטמבר',
      'אוקטובר',
      'נובמבר',
      'דצמבר',
    ];

    const day = dayNames[date.getDay()];
    const dayOfMonth = date.getDate();
    const month = monthNames[date.getMonth()];

    return `${day}, ${dayOfMonth} ${month}`;
  }
}

export const confirmationService = new ConfirmationService();

import { db } from '../config/firebase';
import { logger } from '../utils/logger';
import { geminiClient } from './geminiClient';
import { availabilityService } from './availabilityService';
import { appointmentService } from './appointmentService';
import { whatsappClient } from './whatsappClient';

export interface WhatsAppMessage {
  from: string;
  business_id: string;
  message_text: string;
  received_at: Date;
  context?: {
    customer_name?: string;
    customer_phone?: string;
    services?: string[];
  };
}

export interface MessageHandlerResponse {
  intent: string;
  confidence: number;
  action_taken: string;
  appointment_id?: string;
  message_to_customer: string;
}

export class MessageRouter {
  async handleIncomingMessage(msg: WhatsAppMessage): Promise<MessageHandlerResponse> {
    try {
      // Get business config
      const businessDoc = await db.collection('businesses').doc(msg.business_id).get();
      if (!businessDoc.exists) {
        throw new Error(`Business ${msg.business_id} not found`);
      }
      const businessData = businessDoc.data() || {};

      // Extract intent using Gemini
      const geminiResponse = await geminiClient.extractAppointmentIntent(
        msg.business_id,
        msg.from,
        msg.message_text,
        msg.context || {
          name: businessData.name,
          phone: msg.from,
          services: businessData.services || [],
        }
      );

      const intentData = JSON.parse(geminiResponse.content);

      logger.info('Intent extracted', {
        businessId: msg.business_id,
        customerId: msg.from,
        intent: intentData.intent,
        confidence: intentData.confidence,
      });

      // Route based on intent
      switch (intentData.intent) {
        case 'book':
          return await this.handleBooking(msg, intentData);
        case 'reschedule':
          return await this.handleReschedule(msg, intentData);
        case 'cancel':
          return await this.handleCancellation(msg, intentData);
        case 'check_availability':
          return await this.handleAvailabilityCheck(msg, intentData);
        case 'other':
        default:
          return await this.handleOther(msg, intentData);
      }
    } catch (error) {
      logger.error('Message routing failed', {
        businessId: msg.business_id,
        customerId: msg.from,
        error,
      });

      const fallbackMessage = `סוהה חברה, קרתה בעיה. בואו נעשה את זה באופן ידני — וואטסאפ ישירות לעסק 📞`;

      // Send fallback message to customer
      await whatsappClient.sendMessage(msg.from, fallbackMessage);

      throw error;
    }
  }

  private async handleBooking(msg: WhatsAppMessage, intentData: any): Promise<MessageHandlerResponse> {
    const { extracted_data } = intentData;

    // Validate extracted data
    if (!extracted_data.preferred_date || !extracted_data.preferred_time) {
      const responseMsg = `תודה על עניין! יכלנו לחלץ תאריך/שעה מהודעתך. 
בואו נאשר:
📅 התאריך: ${extracted_data.preferred_date || 'לא נמצא'}
🕐 השעה: ${extracted_data.preferred_time || 'לא נמצאה'}

מה אומרת? ✅ אישור או 🔄 שינוי?`;

      await whatsappClient.sendMessage(msg.from, responseMsg);

      return {
        intent: 'book',
        confidence: intentData.confidence,
        action_taken: 'awaiting_confirmation',
        message_to_customer: responseMsg,
      };
    }

    // Check availability
    try {
      const availability = await availabilityService.getAvailableSlots(
        msg.business_id,
        extracted_data.preferred_date,
        30
      );

      if (!availability.best_slots.length) {
        const responseMsg = `אוקיי, ${extracted_data.preferred_date} בשעה ${extracted_data.preferred_time} עסוק 😞

כאן האפשרויות האחרות שלנו:
${availability.full_slots?.slice(0, 3).map((s) => `🕐 ${s.time}`).join('\n')}

מה בא לך?`;

        await whatsappClient.sendMessage(msg.from, responseMsg);

        return {
          intent: 'book',
          confidence: intentData.confidence,
          action_taken: 'availability_check_failed',
          message_to_customer: responseMsg,
        };
      }

      // Create appointment
      const appointment = await appointmentService.createAppointment({
        business_id: msg.business_id,
        customer_id: msg.from,
        customer_name: msg.context?.customer_name || 'Unknown',
        customer_phone: msg.from,
        service: extracted_data.service || 'General',
        date: extracted_data.preferred_date,
        time: extracted_data.preferred_time,
        duration_minutes: 30,
        notes: msg.message_text,
      });

      const statusMsg =
        appointment.status === 'confirmed'
          ? `✅ מעולה! התור שלך נאושר!`
          : `⏳ התור שלך נוסף לרשימת ההמתנה`;

      const responseMsg = `${statusMsg}

📋 פרטיך:
📅 ${appointment.date}
🕐 ${appointment.time}
💇 ${appointment.service}

אנחנו מחכים לך! 🎉`;

      await whatsappClient.sendMessage(msg.from, responseMsg);

      return {
        intent: 'book',
        confidence: intentData.confidence,
        action_taken: 'appointment_created',
        appointment_id: appointment.id,
        message_to_customer: responseMsg,
      };
    } catch (error) {
      logger.error('Booking failed', { businessId: msg.business_id, error });
      const errorMsg = `אוחה, קרתה בעיה בעת יצירת התור. בואו נחכה או ננסה שוב 🤔`;
      await whatsappClient.sendMessage(msg.from, errorMsg);
      throw error;
    }
  }

  private async handleReschedule(msg: WhatsAppMessage, intentData: any): Promise<MessageHandlerResponse> {
    const responseMsg = `כדי לעדכן את התור שלך, בואו נתחיל מחדש — איזה תאריך חדש רצוי?`;
    await whatsappClient.sendMessage(msg.from, responseMsg);

    return {
      intent: 'reschedule',
      confidence: intentData.confidence,
      action_taken: 'reschedule_started',
      message_to_customer: responseMsg,
    };
  }

  private async handleCancellation(msg: WhatsAppMessage, intentData: any): Promise<MessageHandlerResponse> {
    // Get customer's latest appointment
    const appointments = await appointmentService.getAppointmentsByCustomer(msg.business_id, msg.from);

    if (!appointments.length) {
      const responseMsg = `בדרך כלל אין לך תורים בעתיד. יתכן שזה היה טעות?`;
      await whatsappClient.sendMessage(msg.from, responseMsg);

      return {
        intent: 'cancel',
        confidence: intentData.confidence,
        action_taken: 'no_appointments_found',
        message_to_customer: responseMsg,
      };
    }

    const latestAppt = appointments[0];
    await appointmentService.cancelAppointment(msg.business_id, latestAppt.id, 'Customer initiated cancellation');

    const responseMsg = `✅ התור שלך בתאריך ${latestAppt.date} בשעה ${latestAppt.time} בוטל.
אם אתה רוצה להזמין שוב, אנחנו כאן! 💪`;

    await whatsappClient.sendMessage(msg.from, responseMsg);

    return {
      intent: 'cancel',
      confidence: intentData.confidence,
      action_taken: 'appointment_cancelled',
      message_to_customer: responseMsg,
    };
  }

  private async handleAvailabilityCheck(msg: WhatsAppMessage, intentData: any): Promise<MessageHandlerResponse> {
    const today = new Date().toISOString().split('T')[0];
    const availability = await availabilityService.getAvailableSlots(msg.business_id, today);

    const slotsText = availability.best_slots.map((slot) => `🕐 ${slot.time}`).join('\n');

    const responseMsg = availability.best_slots.length
      ? `כאן האפשרויות שלנו ל${today}:\n${slotsText}\n\nרוצה להזמין?`
      : `למצוף אין מקומות פנויים היום. בואו לנסות מחר?`;

    await whatsappClient.sendMessage(msg.from, responseMsg);

    return {
      intent: 'check_availability',
      confidence: intentData.confidence,
      action_taken: 'availability_sent',
      message_to_customer: responseMsg,
    };
  }

  private async handleOther(msg: WhatsAppMessage, intentData: any): Promise<MessageHandlerResponse> {
    const responseMsg = `תודה על ההודעה! אני כאן לעדכון תורים בעיקר. 
איזה דבר אתה צריך? 
- 📅 להזמין תור חדש
- 🔄 לעדכן תור קיים
- ❌ לבטל תור`;

    await whatsappClient.sendMessage(msg.from, responseMsg);

    return {
      intent: 'other',
      confidence: intentData.confidence,
      action_taken: 'awaiting_clarification',
      message_to_customer: responseMsg,
    };
  }
}

export const messageRouter = new MessageRouter();

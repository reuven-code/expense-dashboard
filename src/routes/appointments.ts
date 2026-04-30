import { Router, Request, Response } from 'express';
import { Firestore } from 'firebase-admin/firestore';
import { logger } from '../utils/logger';
import { appointmentService } from '../services/appointmentService';
import { confirmationService } from '../services/confirmationService';
import { waitlistService } from '../services/waitlistService';

export const appointmentsRouter = (db: Firestore) => {
  const router = Router();

  // ============ GET APPOINTMENTS FOR BUSINESS ============
  router.get('/:businessId', async (req: Request, res: Response) => {
    try {
      const { businessId } = req.params;
      const { date, status } = req.query;

      let query: any = db.collection('businesses').doc(businessId).collection('appointments');

      if (date) {
        query = query.where('date', '==', date as string);
      }

      if (status) {
        query = query.where('status', '==', status as string);
      }

      const snapshot = await query.orderBy('date', 'desc').limit(100).get();
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json({ appointments });
    } catch (error) {
      logger.error('Failed to fetch appointments', { error });
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });

  // ============ GET SINGLE APPOINTMENT ============
  router.get('/:businessId/:appointmentId', async (req: Request, res: Response) => {
    try {
      const { businessId, appointmentId } = req.params;

      const appointment = await appointmentService.getAppointment(businessId, appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.status(200).json({ appointment });
    } catch (error) {
      logger.error('Failed to fetch appointment', { error });
      res.status(500).json({ error: 'Failed to fetch appointment' });
    }
  });

  // ============ CREATE APPOINTMENT ============
  router.post('/:businessId', async (req: Request, res: Response) => {
    try {
      const { businessId } = req.params;
      const { customer_name, customer_phone, service, date, time, duration_minutes, notes } = req.body;

      // Validate required fields
      if (!customer_name || !customer_phone || !service || !date || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const appointment = await appointmentService.createAppointment({
        business_id: businessId,
        customer_id: customer_phone,
        customer_name,
        customer_phone,
        service,
        date,
        time,
        duration_minutes: duration_minutes || 30,
        notes,
      });

      // Send confirmation WhatsApp
      try {
        await confirmationService.sendConfirmation({
          business_id: businessId,
          appointment_id: appointment.id,
          customer_phone,
          customer_name,
          service,
          date,
          time,
        });
      } catch (whatsappError) {
        logger.warn('Failed to send confirmation WhatsApp', { appointmentId: appointment.id, error: whatsappError });
        // Don't fail the API call — appointment was created
      }

      res.status(201).json({ appointment });
    } catch (error) {
      logger.error('Failed to create appointment', { error });
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  });

  // ============ CONFIRM APPOINTMENT ============
  router.patch('/:businessId/:appointmentId/confirm', async (req: Request, res: Response) => {
    try {
      const { businessId, appointmentId } = req.params;

      const appointment = await appointmentService.confirmAppointment(businessId, appointmentId);

      // Send confirmation message
      try {
        await confirmationService.sendConfirmation({
          business_id: businessId,
          appointment_id: appointmentId,
          customer_phone: appointment.customer_phone,
          customer_name: appointment.customer_name,
          service: appointment.service,
          date: appointment.date,
          time: appointment.time,
        });
      } catch (whatsappError) {
        logger.warn('Failed to send confirmation WhatsApp', { appointmentId, error: whatsappError });
      }

      res.status(200).json({ appointment });
    } catch (error) {
      logger.error('Failed to confirm appointment', { error });
      res.status(500).json({ error: 'Failed to confirm appointment' });
    }
  });

  // ============ CANCEL APPOINTMENT ============
  router.patch('/:businessId/:appointmentId/cancel', async (req: Request, res: Response) => {
    try {
      const { businessId, appointmentId } = req.params;
      const { reason } = req.body;

      const appointmentDoc = await db
        .collection('businesses')
        .doc(businessId)
        .collection('appointments')
        .doc(appointmentId)
        .get();

      if (!appointmentDoc.exists) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      const appointment = appointmentDoc.data();

      await appointmentService.cancelAppointment(businessId, appointmentId, reason);

      // Send cancellation notice
      try {
        await confirmationService.sendCancellationNotice(businessId, appointmentId, appointment?.customer_phone, reason);
      } catch (whatsappError) {
        logger.warn('Failed to send cancellation notice', { appointmentId, error: whatsappError });
      }

      res.status(200).json({ status: 'cancelled' });
    } catch (error) {
      logger.error('Failed to cancel appointment', { error });
      res.status(500).json({ error: 'Failed to cancel appointment' });
    }
  });

  // ============ GET WAITLIST ============
  router.get('/:businessId/waitlist/list', async (req: Request, res: Response) => {
    try {
      const { businessId } = req.params;

      const waitlist = await waitlistService.getWaitlist(businessId);
      res.status(200).json({ waitlist });
    } catch (error) {
      logger.error('Failed to fetch waitlist', { error });
      res.status(500).json({ error: 'Failed to fetch waitlist' });
    }
  });

  // ============ PROMOTE FROM WAITLIST ============
  router.post('/:businessId/waitlist/promote', async (req: Request, res: Response) => {
    try {
      const { businessId } = req.params;
      const { date, time } = req.body;

      if (!date || !time) {
        return res.status(400).json({ error: 'date and time required' });
      }

      const result = await waitlistService.promoteFromWaitlist(businessId, date, time);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Failed to promote from waitlist', { error });
      res.status(500).json({ error: 'Failed to promote from waitlist' });
    }
  });

  return router;
};

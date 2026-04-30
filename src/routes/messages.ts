import { Router, Request, Response } from 'express';
import { Firestore } from 'firebase-admin/firestore';
import { logger } from '../utils/logger';
import { validatePhoneNumber, sanitizeInput } from '../utils/validation';
import { messageRouter as messageRouterService } from '../services/messageRouter';
import { whatsappClient } from '../services/whatsappClient';

export const messagesRouter = (db: Firestore) => {
  const router = Router();

  // ============ GET WEBHOOK VERIFICATION (WhatsApp) ============
  router.get('/webhook', (req: Request, res: Response) => {
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        logger.info('WhatsApp webhook verified successfully');
        return res.status(200).send(challenge);
      }
    }

    logger.warn('Webhook verification failed', { mode, token });
    res.status(403).json({ error: 'Forbidden' });
  });

  // ============ POST INCOMING MESSAGE ============
  router.post('/webhook', async (req: Request, res: Response) => {
    try {
      const body = req.body;

      // Acknowledge receipt immediately (WhatsApp requirement)
      res.status(200).json({ received: true });

      // Parse WhatsApp message
      const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
      if (!messages || messages.length === 0) {
        return;
      }

      const message = messages[0];
      const phoneNumber = message.from;
      const businessAccountId = body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
      const messageId = message.id;

      // Validate phone number
      const phoneValidation = validatePhoneNumber(phoneNumber);
      if (!phoneValidation.valid) {
        logger.warn(`Invalid phone number: ${phoneNumber}`);
        return;
      }

      // Extract message text
      let messageText = '';
      if (message.type === 'text') {
        messageText = message.text.body;
      } else {
        logger.debug(`Ignoring non-text message`, { type: message.type, from: phoneNumber });
        return;
      }

      // Validate message input
      if (!sanitizeInput(messageText)) {
        logger.warn(`Invalid or suspicious message input`, { from: phoneNumber });
        return;
      }

      // Find business by WhatsApp phone number ID
      const businessSnapshot = await db
        .collection('businesses')
        .where('whatsappPhoneNumberId', '==', businessAccountId)
        .limit(1)
        .get();

      if (businessSnapshot.empty) {
        logger.error(`Business not found for WhatsApp account: ${businessAccountId}`);
        return;
      }

      const businessId = businessSnapshot.docs[0].id;

      // Get or create customer record
      const customerRef = db
        .collection('businesses')
        .doc(businessId)
        .collection('customers')
        .doc(phoneNumber);

      const customerDoc = await customerRef.get();
      if (!customerDoc.exists) {
        await customerRef.set({
          phone: phoneNumber,
          created_at: new Date(),
          last_contact: new Date(),
          message_count: 1,
        });
      } else {
        // Update last contact
        await customerRef.update({
          last_contact: new Date(),
          message_count: (customerDoc.data()?.message_count || 0) + 1,
        });
      }

      // Mark message as read (fire-and-forget)
      whatsappClient.markAsRead(messageId).catch((err) => {
        logger.debug('Failed to mark message as read', { messageId, error: err });
      });

      // Route message to service handler
      try {
        const response = await messageRouterService.handleIncomingMessage({
          from: phoneNumber,
          business_id: businessId,
          message_text: messageText,
          received_at: new Date(),
        });

        logger.info('Message processed successfully', {
          businessId,
          from: phoneNumber,
          intent: response.intent,
          action: response.action_taken,
        });
      } catch (handlerError) {
        logger.error('Message handler error', {
          businessId,
          from: phoneNumber,
          error: handlerError,
        });

        // Send fallback message to customer
        try {
          await whatsappClient.sendMessage(
            phoneNumber,
            'סוהה חברה, קרתה בעיה טכנית. בואו נשלח הודעה ישירה ⚙️'
          );
        } catch (sendError) {
          logger.error('Failed to send fallback message', { from: phoneNumber, error: sendError });
        }
      }
    } catch (error) {
      logger.error('Webhook processing failed', { error });
      // Still return 200 to prevent WhatsApp from retrying
    }
  });

  return router;
};

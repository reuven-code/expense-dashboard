import { Router, Request, Response } from 'express';
import { Firestore } from 'firebase-admin/firestore';
import { logger } from '../utils/logger';
import { validateMessageInput, validatePhoneNumber, sanitizeObject } from '../utils/validation';
import { OperationalError } from '../middleware/errorHandler';
import axios from 'axios';

export const messageRouter = (db: Firestore) => {
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

      // Acknowledge receipt immediately
      res.status(200).json({ received: true });

      // Parse WhatsApp message
      const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
      if (!messages || messages.length === 0) {
        return; // No messages to process
      }

      const message = messages[0];
      const phoneNumber = message.from;
      const messageId = message.id;
      const businessAccountId = body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
      const timestamp = message.timestamp;

      // Layer 1: Validate phone number
      const phoneValidation = validatePhoneNumber(phoneNumber);
      if (!phoneValidation.valid) {
        logger.warn(`Invalid phone number: ${phoneNumber}`);
        return;
      }

      // Extract message text (Layer 1 validation)
      let messageText = '';
      if (message.type === 'text') {
        messageText = message.text.body;
      } else {
        // For non-text messages, send a response
        await sendWhatsAppMessage(phoneNumber, 'אנא שלח הודעה טקסטואלית');
        return;
      }

      // Layer 2: Validate message input
      const inputValidation = validateMessageInput(messageText);
      if (!inputValidation.valid) {
        logger.warn(`Invalid message input: ${inputValidation.error}`);
        await sendWhatsAppMessage(phoneNumber, inputValidation.error || 'קלט לא תקין');
        return;
      }

      // Find business by WhatsApp account ID
      const businessSnapshot = await db.collection('businesses')
        .where('whatsappAccountId', '==', businessAccountId)
        .limit(1)
        .get();

      if (businessSnapshot.empty) {
        logger.error(`Business not found for WhatsApp account: ${businessAccountId}`);
        return;
      }

      const businessDoc = businessSnapshot.docs[0];
      const businessId = businessDoc.id;

      // Get or create customer
      const customerRef = db.collection('businesses')
        .doc(businessId)
        .collection('users')
        .doc(phoneNumber);

      let customer = await customerRef.get();
      if (!customer.exists) {
        await customerRef.set({
          phoneNumber: phoneNumber,
          whatsappId: phoneNumber,
          firstContact: new Date(),
          lastContact: new Date(),
          appointmentCount: 0,
          metadata: { language: 'he', timezone: 'Asia/Jerusalem' }
        });
      } else {
        await customerRef.update({ lastContact: new Date() });
      }

      // Call AI Agent to process message
      const aiResponse = await processMessageWithAI(
        messageText,
        businessId,
        phoneNumber,
        db
      );

      // Send response back to customer
      await sendWhatsAppMessage(phoneNumber, aiResponse);

      // Log the interaction
      await db.collection('businesses')
        .doc(businessId)
        .collection('auditLogs')
        .add({
          action: 'message_received',
          userId: phoneNumber,
          details: { messageId, text: messageText.substring(0, 100) },
          timestamp: new Date(),
          severity: 'info'
        });

    } catch (error) {
      logger.error('Error processing WhatsApp message', { error });
    }
  });

  return router;
};

// ============ AI PROCESSING ============
async function processMessageWithAI(
  messageText: string,
  businessId: string,
  phoneNumber: string,
  db: Firestore
): Promise<string> {
  try {
    // Get business config
    const businessDoc = await db.collection('businesses').doc(businessId).get();
    const business = businessDoc.data();
    if (!business) {
      return 'אירעה שגיאה. אנא נסה שוב מאוחר יותר.';
    }

    const aiModel = business.aiModel || process.env.AI_MODEL || 'gemini-1.5-flash';
    const apiKey = aiModel.includes('gemini') 
      ? process.env.GEMINI_API_KEY 
      : process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      logger.error(`AI API key not configured for model: ${aiModel}`);
      return 'אירעה שגיאה בתהליך ההזמנה. אנא נסה שוב.';
    }

    // TODO: Integrate with actual AI API
    // For now, return a placeholder response
    const response = 'תודה על ההודעה. אנא בחר תור זמין מהרשימה הבאה.';

    return response;

  } catch (error) {
    logger.error('Error in AI processing', { error });
    return 'אירעה שגיאה בעיבוד ההודעה. אנא נסה שוב.';
  }
}

// ============ SEND MESSAGE TO CUSTOMER ============
async function sendWhatsAppMessage(phoneNumber: string, messageText: string): Promise<void> {
  try {
    const apiUrl = `${process.env.WHATSAPP_API_URL}/me/messages`;
    const headers = {
      Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
      'Content-Type': 'application/json'
    };

    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: { body: messageText }
    };

    await axios.post(apiUrl, payload, { headers });
    logger.info(`Message sent to ${phoneNumber}`);

  } catch (error) {
    logger.error(`Failed to send WhatsApp message to ${phoneNumber}`, { error });
  }
}

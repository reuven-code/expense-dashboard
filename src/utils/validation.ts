import Joi from 'joi';

// Hebrew character validation: א-ת + spaces + digits + basic punctuation
const HEBREW_PATTERN = /^[\u05D0-\u05EA\s0-9?!.,\-'"%@*()&:;\u05F0-\u05FF]*$/;
const SQL_INJECTION_PATTERN = /(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|SCRIPT|javascript:|<script|onclick|onerror)/i;
const SCRIPT_INJECTION_PATTERN = /(<script|<iframe|<object|<embed|javascript:|on\w+\s*=)/i;

export const validateMessageInput = (input: string): { valid: boolean; error?: string } => {
  // Layer 1: Length check
  if (input.length > 500) {
    return { valid: false, error: 'Message too long (max 500 characters)' };
  }

  // Layer 2: Hebrew character validation
  if (!HEBREW_PATTERN.test(input)) {
    return { valid: false, error: 'Invalid characters. Use Hebrew, digits, and basic punctuation.' };
  }

  // Layer 3: SQL/Script injection detection
  if (SQL_INJECTION_PATTERN.test(input) || SCRIPT_INJECTION_PATTERN.test(input)) {
    return { valid: false, error: 'Invalid input detected' };
  }

  return { valid: true };
};

export const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
  // Israeli phone format: +972XXXXXXXXX or 0XXXXXXXXX
  const PHONE_PATTERN = /^(?:\+972|0)[1-9]\d{8}$/;

  if (!PHONE_PATTERN.test(phone.replace(/[\s\-()]/g, ''))) {
    return { valid: false, error: 'Invalid Israeli phone number' };
  }

  return { valid: true };
};

export const validateAppointmentRequest = (data: any) => {
  const schema = Joi.object({
    businessId: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    customerName: Joi.string().max(100).optional(),
    serviceType: Joi.string().optional(),
    requestedDate: Joi.date().optional(),
    requestedTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
    preferWaitlist: Joi.boolean().optional()
  });

  return schema.validate(data);
};

export const validateBusinessConfig = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    location: Joi.string().required(),
    phone: Joi.string().required(),
    whatsappApiKey: Joi.string().required(),
    hours: Joi.object().required(),
    services: Joi.array().items(Joi.object()).optional(),
    aiModel: Joi.string().valid('gemini-1.5-flash', 'claude-opus').optional()
  });

  return schema.validate(data);
};

// Sanitize output to prevent data leakage
export const sanitizeObject = (obj: any, fieldsToExclude: string[] = []): any => {
  const excluded = ['password', 'apiKey', 'firebaseKey', 'privateKey', 'secret', ...fieldsToExclude];

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!excluded.includes(key)) {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

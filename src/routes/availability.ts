import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { availabilityService } from '../services/availabilityService';

export const availabilityRouter = Router();

// ============ GET AVAILABLE SLOTS FOR DATE ============
availabilityRouter.get('/:businessId/:date', async (req: Request, res: Response) => {
  try {
    const { businessId, date } = req.params;
    const { duration } = req.query;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format (expected YYYY-MM-DD)' });
    }

    const serviceDuration = duration ? parseInt(duration as string, 10) : 30;

    const availability = await availabilityService.getAvailableSlots(businessId, date, serviceDuration);

    res.status(200).json(availability);
  } catch (error) {
    logger.error('Failed to fetch availability', { error });
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// ============ GET AVAILABILITY FOR MULTIPLE DATES ============
availabilityRouter.post('/:businessId/bulk', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { dates, duration } = req.body;

    if (!Array.isArray(dates) || !dates.length) {
      return res.status(400).json({ error: 'dates array required' });
    }

    const serviceDuration = duration || 30;
    const availabilityMap: Record<string, any> = {};

    for (const date of dates) {
      const availability = await availabilityService.getAvailableSlots(businessId, date, serviceDuration);
      availabilityMap[date] = availability;
    }

    res.status(200).json({ availability: availabilityMap });
  } catch (error) {
    logger.error('Failed to fetch bulk availability', { error });
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default availabilityRouter;

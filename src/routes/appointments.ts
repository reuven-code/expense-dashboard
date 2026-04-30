import { Router, Request, Response } from 'express';
import { Firestore } from 'firebase-admin/firestore';

export const appointmentRouter = (db: Firestore) => {
  const router = Router();

  router.get('/:businessId', async (req: Request, res: Response) => {
    try {
      const { businessId } = req.params;
      // TODO: Implement get appointments logic
      res.json({ message: 'Get appointments - TODO' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};

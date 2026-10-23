import { Router } from 'express';
import { handleMetaTrackingEvent } from '../controllers/tracking.controller';

const router = Router();

// Public endpoint for client-side CAPI relay
router.post('/meta-event', handleMetaTrackingEvent);

export default router;

import { Router } from 'express';
import * as campaignController from '../controllers/campaign.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public route for landing page & frontend components
router.get('/active', campaignController.getActiveCampaign);

// Protected Admin / Staff routes
router.use(protect, restrictTo('admin', 'staff', 'super_admin'));

router.get('/', campaignController.getAllCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/', campaignController.createCampaign);
router.patch('/:id', campaignController.updateCampaign);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

export default router;

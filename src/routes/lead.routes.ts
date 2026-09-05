import { Router } from "express";
import * as leadController from "../controllers/lead.controller";
import { protect, restrictTo } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { leadLimiter } from "../middlewares/rateLimiter";
import { saveLeadSchema, getLeadsQuerySchema } from "../validations/lead.validation";

const router = Router();

// Public lead capture endpoint with rate limiting & Zod validation
router.post("/save-lead", leadLimiter, validate(saveLeadSchema), leadController.saveLead);
router.post("/", leadLimiter, validate(saveLeadSchema), leadController.saveLead);

// Protected Admin/Staff routes
router.use(protect);
router.use(restrictTo("admin", "staff", "super_admin"));

router.get("/", validate(getLeadsQuerySchema), leadController.getLeads);
router.delete("/:id", leadController.deleteLead);

export default router;

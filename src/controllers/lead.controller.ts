import { Request, Response } from "express";
import { LeadService } from "../services/lead.service";
import { catchAsync } from "../utils/catchAsync";

export const saveLead = catchAsync(async (req: Request, res: Response) => {
  const { name, phone, cartSnapshot, cartTotal } = req.body;
  const lead = await LeadService.saveLead({ name, phone, cartSnapshot, cartTotal });

  res.status(200).json({
    status: "success",
    message: "Lead captured successfully",
    data: { lead }
  });
});

export const getLeads = catchAsync(async (req: Request, res: Response) => {
  const data = await LeadService.getLeads(req.query);

  res.status(200).json({
    status: "success",
    data
  });
});

export const deleteLead = catchAsync(async (req: Request, res: Response) => {
  await LeadService.deleteLead(req.params.id as string);

  res.status(204).json({
    status: "success",
    data: null
  });
});

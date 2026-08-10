import { Request, Response } from 'express';
import { AdminRoleService } from '../services/adminRole.service';
import { catchAsync } from '../utils/catchAsync';

export const createRole = catchAsync(async (req: Request, res: Response) => {
  const role = await AdminRoleService.createRole(req.body);
  res.status(201).json({
    status: 'success',
    data: { role }
  });
});

export const getAllRoles = catchAsync(async (req: Request, res: Response) => {
  const roles = await AdminRoleService.getAllRoles();
  res.status(200).json({
    status: 'success',
    results: roles.length,
    data: { roles }
  });
});

export const updateRole = catchAsync(async (req: Request, res: Response) => {
  const role = await AdminRoleService.updateRole(req.params.id as string, req.body);
  res.status(200).json({
    status: 'success',
    data: { role }
  });
});

export const deleteRole = catchAsync(async (req: Request, res: Response) => {
  await AdminRoleService.deleteRole(req.params.id as string);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

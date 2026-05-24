import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'REVIEWER', 'APPLICANT']),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
import { z } from 'zod';

export const changePasswordInputSchema = z.object({
    username: z.string(),
    oldPassword: z.string(),
    newPassword: z.string(),
});

export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;

import { z } from 'zod';

export const changePasswordInputSchema = z.object({
    userName: z.string(),
    oldPassword: z.string(),
    newPassword: z.string(),
});

export const changePasswordOutputSchema = z.object({
    statusCode: z.number(),
    token: z.string().optional(),
    message: z.string().optional(),
});

export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;
export type ChangePasswordOutput = z.infer<typeof changePasswordOutputSchema>;

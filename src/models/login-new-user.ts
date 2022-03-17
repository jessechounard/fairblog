import { z } from 'zod';

export const loginNewUserInputSchema = z.object({
    userName: z.string(),
    temporaryPassword: z.string(),
    newPassword: z.string(),
});

export const loginNewUserOutputSchema = z.object({
    statusCode: z.number(),
    token: z.string().optional(),
    message: z.string().optional(),
});

export type LoginNewUserInput = z.infer<typeof loginNewUserInputSchema>;
export type LoginNewUserOutput = z.infer<typeof loginNewUserOutputSchema>;

import { z } from 'zod';

export const loginNewUserInputSchema = z.object({
    username: z.string(),
    temporaryPassword: z.string(),
    newPassword: z.string(),
});

export type LoginNewUserInput = z.infer<typeof loginNewUserInputSchema>;

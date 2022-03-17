import { z } from 'zod';

export const loginInputSchema = z.object({
    userName: z.string(),
    password: z.string(),
});

export const loginOutputSchema = z.object({
    statusCode: z.number(),
    token: z.string().optional(),
    message: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type LoginOutput = z.infer<typeof loginOutputSchema>;

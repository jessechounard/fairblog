import { z } from 'zod';

export const helloInputSchema = z.object({
    name: z.string(),
});

export const helloOutputScheme = z.object({
    message: z.string(),
});

export type HelloInput = z.infer<typeof helloInputSchema>;
export type HelloOutput = z.infer<typeof helloOutputScheme>;

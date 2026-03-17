import { z } from 'zod';

const paymentOptions = ['bank_transfer', 'cash', 'qr_code'] as const;

export const paymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(paymentOptions),
  currency: z.string().length(3), // Assuming currency is a 3-letter code
  transactionId: z.string().optional(),
});

// Type inference for the payment schema
export type PaymentPayload = z.infer<typeof paymentSchema>;
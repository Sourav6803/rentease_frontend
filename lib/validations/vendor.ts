// src/lib/validations/vendor.ts (Updated with bank validation)
import * as z from 'zod'

export const bankDetailsSchema = z.object({
  accountHolderName: z
    .string()
    .min(3, 'Account holder name must be at least 3 characters')
    .max(100, 'Account holder name is too long')
    .regex(/^[A-Za-z\s.]+$/, 'Only letters, spaces, and periods allowed'),
  
  accountNumber: z
    .string()
    .min(9, 'Account number must be at least 9 digits')
    .max(18, 'Account number cannot exceed 18 digits')
    .regex(/^[0-9]+$/, 'Account number must contain only digits'),
  
  confirmAccountNumber: z.string(),
  
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format (e.g., SBIN0001234)'),
  
  bankName: z.string().optional(),
  branchName: z.string().optional(),
  
  accountType: z.enum(['savings', 'current']),
  
  upiId: z
    .string()
    .regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{3,}$/, 'Invalid UPI ID format')
    .optional()
    .or(z.literal('')),
  
  bankVerified: z.boolean().default(false),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers do not match",
  path: ['confirmAccountNumber'],
}).refine((data) => {
  if (data.accountNumber && data.ifscCode) {
    // Additional validation can be added here
    return true
  }
  return true
}, {
  message: "Please verify your bank account",
  path: ['accountNumber'],
})
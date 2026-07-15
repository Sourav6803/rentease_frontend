import * as z from 'zod'

/** Shared vendor registration schema — single source of truth for RHF + step components. */
export const vendorSchema = z
  .object({
    businessName: z.string().min(3, 'Business name must be at least 3 characters'),
    businessType: z.enum([
      'individual',
      'partnership',
      'private_limited',
      'public_limited',
      'llp',
      'sole_proprietorship',
    ]),
    gstin: z.string().default(''),
    foundedYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
    description: z.string().max(500).default(''),

    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string(),

    panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'),
    address: z.object({
      street: z.string().min(5, 'Street address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      pincode: z
        .string()
        .regex(/^[1-9]\d{5}$/, 'Pincode must be 6 digits and cannot start with 0'),
      country: z.string().default('India'),
    }),

    bankDetails: z.object({
      accountHolderName: z.string().min(3, 'Account holder name is required'),
      accountNumber: z.string().min(9, 'Invalid account number').max(18),
      confirmAccountNumber: z.string(),
      ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
      bankName: z.string().default(''),
      branchName: z.string().default(''),
      accountType: z.enum(['savings', 'current']),
      upiId: z.string().default(''),
      bankVerified: z.boolean().default(false),
    }),

    termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
    dataProcessingAccepted: z
      .boolean()
      .refine((val) => val === true, 'You must accept data processing terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.bankDetails.accountNumber === data.bankDetails.confirmAccountNumber, {
    message: "Account numbers don't match",
    path: ['bankDetails', 'confirmAccountNumber'],
  })

export type VendorFormValues = z.infer<typeof vendorSchema>

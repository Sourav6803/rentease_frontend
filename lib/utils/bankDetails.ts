// src/lib/utils/bankValidation.ts

interface BankValidationResult {
  isValid: boolean
  message?: string
  bankName?: string
  branch?: string
}

// IFSC validation regex
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/

// Account number validation for different banks
const ACCOUNT_NUMBER_PATTERNS = {
  sbi: /^[0-9]{11}$/,
  hdfc: /^[0-9]{14}$/,
  icici: /^[0-9]{12}$/,
  axis: /^[0-9]{15}$/,
  kotak: /^[0-9]{14}$/,
  default: /^[0-9]{9,18}$/,
}

export function validateIFSC(ifsc: string): boolean {
  return IFSC_REGEX.test(ifsc.toUpperCase())
}

export function validateAccountNumber(accountNumber: string, bankCode?: string): boolean {
  if (!accountNumber) return false
  
  const pattern = bankCode && ACCOUNT_NUMBER_PATTERNS[bankCode as keyof typeof ACCOUNT_NUMBER_PATTERNS]
    ? ACCOUNT_NUMBER_PATTERNS[bankCode as keyof typeof ACCOUNT_NUMBER_PATTERNS]
    : ACCOUNT_NUMBER_PATTERNS.default
  
  return pattern.test(accountNumber)
}

export async function verifyIFSC(ifsc: string): Promise<BankValidationResult> {
  if (!validateIFSC(ifsc)) {
    return {
      isValid: false,
      message: 'Invalid IFSC format',
    }
  }

  try {
    const response = await fetch(`https://ifsc.razorpay.com/${ifsc.toUpperCase()}`)
    
    if (!response.ok) {
      return {
        isValid: false,
        message: 'IFSC code not found',
      }
    }

    const data = await response.json()
    
    return {
      isValid: true,
      bankName: data.BANK,
      branch: data.BRANCH,
    }
  } catch (error) {
    return {
      isValid: false,
      message: 'Unable to verify IFSC code',
    }
  }
}

// Luhn algorithm for basic account number validation
export function validateWithLuhn(accountNumber: string): boolean {
  let sum = 0
  let isEven = false
  
  for (let i = accountNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(accountNumber.charAt(i), 10)
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return (sum % 10) === 0
}
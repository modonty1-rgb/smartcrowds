/**
 * Saudi ID Validation
 * Validates both Saudi National ID (الهوية الوطنية) and Iqama (الإقامة)
 * 
 * Saudi National ID: 10 digits starting with 1 or 2
 * Iqama: 10 digits starting with 2, 7, or 8
 * 
 * Validation algorithm:
 * 1. Must be exactly 10 digits
 * 2. Must pass Luhn algorithm check for first 9 digits
 * 3. Last digit is the check digit
 */

export function validateSaudiID(
  idNumber: string,
  translations?: {
    notString?: string;
    digitsOnly?: string;
    length?: string;
    invalidFormat?: string;
    checkDigit?: string;
  }
): { valid: boolean; type?: 'national' | 'iqama'; error?: string } {
  // Ensure idNumber is a string
  if (typeof idNumber !== 'string') {
    return { valid: false, error: translations?.notString || 'رقم الهوية يجب أن يكون نصاً' };
  }
  
  // Remove any whitespace
  const cleaned = idNumber.trim().replace(/\s/g, '');
  
  // Check if it's all digits
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: translations?.digitsOnly || 'رقم الهوية يجب أن يحتوي على أرقام فقط' };
  }
  
  // Check length
  if (cleaned.length !== 10) {
    return { valid: false, error: translations?.length || 'رقم الهوية يجب أن يكون 10 أرقام' };
  }
  
  // Check first digit to determine type
  const firstDigit = parseInt(cleaned[0]);
  let type: 'national' | 'iqama' | null = null;
  
  if (firstDigit === 1) {
    type = 'national'; // Saudi National ID
  } else if (firstDigit === 2 || firstDigit === 7 || firstDigit === 8) {
    type = 'iqama'; // Iqama (Residence Permit)
  } else {
    return { valid: false, error: translations?.invalidFormat || 'رقم الهوية غير صحيح. يجب أن يبدأ بـ 1 (هوية وطنية) أو 2، 7، 8 (إقامة)' };
  }
  
  // Validate using Luhn algorithm for first 9 digits
  const checkDigit = parseInt(cleaned[9]);
  const first9Digits = cleaned.substring(0, 9);
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(first9Digits[i]);
    
    // Luhn algorithm: double digits at even positions (0-indexed from left)
    // Positions from right (excluding check digit): 8,7,6,5,4,3,2,1,0
    // We double positions: 8,6,4,2,0 (even positions from right)
    // In left-to-right indexing: these are positions 0,2,4,6,8 (even indices from left)
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
  }
  
  // Check digit should make sum divisible by 10
  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  
  if (calculatedCheckDigit !== checkDigit) {
    return { valid: false, error: translations?.checkDigit || 'رقم الهوية غير صحيح. الرقم التحقق غير متطابق' };
  }
  
  return { valid: true, type };
}


/**
 * Phone Number Utility Functions
 * ==============================
 * Centralized phone number validation and formatting utilities.
 * Used across the application for consistent phone number handling.
 */

/**
 * Clean a phone number by removing common formatting characters.
 * Removes: spaces, dashes, parentheses, plus sign, WhatsApp JID suffixes
 * 
 * @param phone - Raw phone number string
 * @returns Cleaned phone number containing only digits
 * 
 * @example
 * cleanPhoneNumber("+1 (234) 567-8900") // "12345678900"
 * cleanPhoneNumber("1234567890@s.whatsapp.net") // "1234567890"
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  return phone
    .replace(/[\s\-\(\)]/g, '')        // Remove spaces, dashes, parentheses
    .replace(/^\+/, '')                 // Remove leading plus sign
    .replace(/@s\.whatsapp\.net$/, '')  // Remove WhatsApp JID suffix
    .replace(/@lid$/, '')               // Remove WhatsApp LID suffix
    .trim();
}

/**
 * Validate if a phone number has the correct format.
 * Valid format: 10-15 digits (after cleaning)
 * 
 * @param phone - Phone number to validate (will be cleaned first)
 * @returns true if valid, false otherwise
 * 
 * @example
 * validatePhoneNumber("1234567890") // true
 * validatePhoneNumber("+1 234 567 8900") // true
 * validatePhoneNumber("123") // false (too short)
 * validatePhoneNumber("abc123") // false (contains letters)
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  const cleaned = cleanPhoneNumber(phone);
  
  // Must be only digits and between 10-15 characters
  const digitOnlyRegex = /^\d{10,15}$/;
  return digitOnlyRegex.test(cleaned);
}

/**
 * Format a phone number for display with international prefix.
 * 
 * @param phone - Phone number to format
 * @returns Formatted phone number with + prefix
 * 
 * @example
 * formatForDisplay("1234567890") // "+1234567890"
 * formatForDisplay("+1 234 567 8900") // "+12345678900"
 */
export function formatForDisplay(phone: string): string {
  if (!phone) return '';
  
  const cleaned = cleanPhoneNumber(phone);
  return cleaned ? `+${cleaned}` : '';
}

/**
 * Convert a phone number to WhatsApp JID format.
 * 
 * @param phone - Phone number to convert
 * @returns Phone number in JID format (number@s.whatsapp.net)
 * 
 * @example
 * toWhatsAppJID("1234567890") // "1234567890@s.whatsapp.net"
 */
export function toWhatsAppJID(phone: string): string {
  if (!phone) return '';
  
  const cleaned = cleanPhoneNumber(phone);
  return cleaned ? `${cleaned}@s.whatsapp.net` : '';
}

/**
 * Check if a phone number is already in JID format.
 * 
 * @param phone - Phone number to check
 * @returns true if already in JID format
 */
export function isJIDFormat(phone: string): boolean {
  return phone.includes('@s.whatsapp.net') || phone.includes('@lid');
}


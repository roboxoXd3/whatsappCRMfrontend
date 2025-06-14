/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any existing formatting
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Indian numbers
  if (cleaned.startsWith('91') && cleaned.length >= 12) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  // Format 10-digit numbers
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  // Return original if can't format
  return phone;
}

/**
 * Clean phone number for API calls
 */
export function cleanPhoneForAPI(phone: string): string {
  // Remove WhatsApp suffix
  let cleaned = phone.replace('_s_whatsapp_net', '');
  
  // Remove any non-numeric characters except +
  cleaned = cleaned.replace(/[^\d+]/g, '');
  
  // Ensure it starts with country code if it doesn't have + and isn't already prefixed
  if (!cleaned.startsWith('+') && !cleaned.startsWith('91')) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return 'U';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 
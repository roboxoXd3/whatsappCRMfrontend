'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Plus } from 'lucide-react';
import { cleanPhoneNumber, validatePhoneNumber } from '@/utils/phoneUtils';

interface PhoneNumberInputProps {
  /**
   * Callback function called when a valid phone number is added
   */
  onAdd: (phoneNumber: string) => void;
  
  /**
   * Placeholder text for the input field
   */
  placeholder?: string;
  
  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * PhoneNumberInput Component
 * ==========================
 * Reusable component for entering and validating phone numbers.
 * 
 * Features:
 * - Real-time validation with visual feedback
 * - Green checkmark for valid numbers
 * - Red X for invalid numbers
 * - Add button (disabled for invalid input)
 * - Helper text with format examples
 * - Auto-clears after successful add
 * 
 * @example
 * ```tsx
 * <PhoneNumberInput 
 *   onAdd={(phone) => console.log('Added:', phone)}
 *   placeholder="Enter phone number"
 * />
 * ```
 */
export default function PhoneNumberInput({ 
  onAdd, 
  placeholder = "Enter phone number", 
  className = "" 
}: PhoneNumberInputProps) {
  const [phoneInput, setPhoneInput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Validate phone number on input change
  useEffect(() => {
    if (phoneInput.trim()) {
      const valid = validatePhoneNumber(phoneInput);
      setIsValid(valid);
      setShowFeedback(true);
    } else {
      setIsValid(null);
      setShowFeedback(false);
    }
  }, [phoneInput]);

  const handleAdd = () => {
    if (isValid && phoneInput.trim()) {
      // Clean the phone number before passing to parent
      const cleanedPhone = cleanPhoneNumber(phoneInput);
      onAdd(cleanedPhone);
      
      // Clear input after successful add
      setPhoneInput('');
      setIsValid(null);
      setShowFeedback(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Input
            type="text"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className={`pr-10 ${
              showFeedback
                ? isValid
                  ? 'border-green-500 focus:ring-green-500'
                  : 'border-red-500 focus:ring-red-500'
                : ''
            }`}
          />
          
          {/* Validation Feedback Icon */}
          {showFeedback && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValid ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          )}
        </div>

        {/* Add Button */}
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!isValid}
          size="default"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Number
        </Button>
      </div>

      {/* Helper Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Enter 10-15 digits. Examples:</p>
        <ul className="list-disc list-inside text-gray-400 ml-2">
          <li>1234567890</li>
          <li>+1 234 567 8900</li>
          <li>+91-98765-43210</li>
        </ul>
      </div>

      {/* Error Message */}
      {showFeedback && !isValid && phoneInput.trim() && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Invalid phone number. Must be 10-15 digits.
        </p>
      )}

      {/* Success Hint */}
      {showFeedback && isValid && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Valid phone number. Click "Add Number" or press Enter.
        </p>
      )}
    </div>
  );
}


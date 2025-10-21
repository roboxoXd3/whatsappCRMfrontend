'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ExternalLink, Check, X, Loader2 } from 'lucide-react';

interface URLInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  validateFn?: (url: string) => Promise<{ valid: boolean; message?: string }>;
}

export function URLInput({ label, value, onChange, placeholder, helpText, validateFn }: URLInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  
  const handleValidate = async () => {
    if (!validateFn || !value) return;
    
    setIsValidating(true);
    const result = await validateFn(value);
    setIsValidating(false);
    
    setValidationStatus(result.valid ? 'valid' : 'invalid');
    setValidationMessage(result.message || '');
  };
  
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="url"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setValidationStatus('idle');
            }}
            placeholder={placeholder}
            className={validationStatus === 'invalid' ? 'border-red-500' : ''}
          />
          {validationStatus === 'valid' && (
            <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
          {validationStatus === 'invalid' && (
            <X className="absolute right-3 top-3 h-4 w-4 text-red-500" />
          )}
        </div>
        
        {value && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => window.open(value, '_blank')}
              title="Test link"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            {validateFn && (
              <Button
                type="button"
                variant="outline"
                onClick={handleValidate}
                disabled={isValidating}
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Verify'
                )}
              </Button>
            )}
          </>
        )}
      </div>
      
      {helpText && <p className="text-sm text-gray-500">{helpText}</p>}
      {validationMessage && (
        <p className={`text-sm ${validationStatus === 'valid' ? 'text-green-600' : 'text-red-600'}`}>
          {validationMessage}
        </p>
      )}
    </div>
  );
}



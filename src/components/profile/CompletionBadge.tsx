'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CompletionBadgeProps {
  percentage: number;
}

export function CompletionBadge({ percentage }: CompletionBadgeProps) {
  const getStatus = () => {
    if (percentage === 100) return { label: 'Complete', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
    if (percentage >= 70) return { label: 'Almost there', color: 'bg-blue-100 text-blue-700', icon: AlertCircle };
    if (percentage >= 40) return { label: 'In progress', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle };
    return { label: 'Getting started', color: 'bg-gray-100 text-gray-700', icon: AlertCircle };
  };
  
  const status = getStatus();
  const Icon = status.icon;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Profile Strength</span>
        <Badge className={status.color}>
          <Icon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <Progress value={percentage} className="flex-1" />
        <span className="text-sm font-semibold text-gray-700 w-12">{percentage}%</span>
      </div>
    </div>
  );
}



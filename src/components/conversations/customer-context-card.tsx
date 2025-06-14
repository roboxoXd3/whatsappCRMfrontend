'use client';

import { useState } from 'react';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Star, 
  TrendingUp, 
  Briefcase, 
  CheckSquare, 
  Activity,
  Calendar,
  DollarSign,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator';
import { useCustomerContext, useRefreshCustomerContext, formatCustomerContext, extractPhoneNumber } from '@/hooks/useCustomerContext';
import { Contact } from '@/lib/types/api';
import { cn } from '@/lib/utils';

interface CustomerContextCardProps {
  phoneNumber: string;
  className?: string;
  compact?: boolean;
  enrichedContact?: Contact; // Optional enriched contact data
}

export function CustomerContextCard({ 
  phoneNumber, 
  className,
  compact = false,
  enrichedContact // New prop for enriched contact data
}: CustomerContextCardProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const cleanPhoneNumber = extractPhoneNumber(phoneNumber);
  
  // Only fetch customer context if enriched data is not provided
  const shouldFetchContext = !enrichedContact || !enrichedContact.company;
  const { data: contextData, isLoading, error, refetch } = useCustomerContext(cleanPhoneNumber);
  const { refreshContext } = useRefreshCustomerContext();

  const handleRefresh = () => {
    refreshContext(cleanPhoneNumber);
    refetch();
  };

  // Use enriched contact data if available, otherwise fall back to context data
  const displayData = enrichedContact && (enrichedContact.company || enrichedContact.lead_status) 
    ? {
        displayName: enrichedContact.name || 'Unknown Contact',
        subtitle: enrichedContact.company || `Lead Status: ${enrichedContact.lead_status}`,
        isKnownCustomer: !!(enrichedContact.company || enrichedContact.lead_status),
        leadStatus: enrichedContact.lead_status,
        leadScore: enrichedContact.lead_score,
        company: enrichedContact.company,
        email: enrichedContact.email,
        position: enrichedContact.position,
        crmSummary: enrichedContact.crm_summary
      }
    : contextData ? formatCustomerContext(contextData) : null;

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-red-200", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load customer data</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              className="ml-auto h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!displayData) {
    return null;
  }

  const formattedContext = displayData;
  const customer = contextData ? contextData.customer_context : null;

  const getLeadStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'hot':
      case 'converted':
      case 'customer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'contacted':
      case 'qualified':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'new':
      case 'lead':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (compact && !isExpanded) {
    return (
      <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", className)} onClick={() => setIsExpanded(true)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{formattedContext.displayName}</p>
                <p className="text-xs text-gray-600">{formattedContext.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {formattedContext.isKnownCustomer && (
                <Badge variant="outline" className={getLeadStatusColor(formattedContext.leadStatus || '')}>
                  {formattedContext.leadStatus}
                </Badge>
              )}
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("p-0 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-[380px] w-full mx-auto", className)}>
      <CardHeader className="pb-0 pt-8 px-8 flex flex-col items-center">
        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center shadow text-4xl font-bold text-blue-700 mb-3">
          <User className="h-10 w-10 text-blue-600" />
        </div>
        <div className="text-center w-full mb-2">
          <h2 className="font-bold text-xl text-gray-900 truncate">{formattedContext.displayName}</h2>
          {formattedContext.subtitle && (
            <div className="flex items-center justify-center gap-2 mt-1 text-blue-700 font-medium text-base truncate">
              <Building2 className="h-4 w-4 text-blue-400" />
              <span>{formattedContext.subtitle}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-3 mt-2 mb-4">
          {formattedContext.leadStatus && (
            <Badge variant="outline" className={cn("text-xs px-2 py-0.5 rounded flex items-center gap-1", getLeadStatusColor(formattedContext.leadStatus))}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {formattedContext.leadStatus}
            </Badge>
          )}
          {formattedContext.leadScore !== undefined && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 rounded flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200 font-bold">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              {formattedContext.leadScore}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2 mb-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </Button>
          {formattedContext.email && (
            <Button variant="ghost" size="icon">
              <a href={`mailto:${formattedContext.email}`}><Mail className="h-5 w-5 text-gray-500" /></a>
            </Button>
          )}
          {formattedContext.company && (
            <Button variant="ghost" size="icon">
              <a href="#" target="_blank"><ExternalLink className="h-5 w-5 text-gray-500" /></a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-8 pb-8">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-base text-gray-900 font-bold">{extractPhoneNumber(phoneNumber)}</span>
            </div>
            {formattedContext.email && (
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-base text-gray-700">{formattedContext.email}</span>
              </div>
            )}
            {formattedContext.position && (
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span className="text-base text-gray-700">{formattedContext.position}</span>
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 my-2"></div>
          {'crmSummary' in formattedContext && formattedContext.crmSummary && (
            <div className="flex items-start gap-2">
              <Activity className="h-4 w-4 text-green-500 mt-1" />
              <div className="text-sm text-gray-600 bg-gray-50 rounded p-3 w-full">
                {formattedContext.crmSummary}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 
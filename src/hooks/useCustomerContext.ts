import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/lib/api/customer';
import { LegacyCustomerContextResponse } from '@/lib/types/customer';

// Query Keys
export const CUSTOMER_QUERY_KEYS = {
  context: (phoneNumber: string) => ['customer', 'context', phoneNumber] as const,
  allContexts: ['customer', 'context'] as const,
};

// Hook to get customer context by phone number
export function useCustomerContext(phoneNumber: string | undefined) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.context(phoneNumber || ''),
    queryFn: () => customerApi.getCustomerContext(phoneNumber!),
    enabled: !!phoneNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook to test customer context (for debugging)
export function useTestCustomerContext() {
  const queryClient = useQueryClient();

  const testContext = async (phoneNumber: string) => {
    try {
      console.log(`🧪 Testing customer context for: ${phoneNumber}`);
      const result = await customerApi.testCustomerContext(phoneNumber);
      
      // Update the cache with the result
      queryClient.setQueryData(
        CUSTOMER_QUERY_KEYS.context(phoneNumber),
        result
      );
      
      return result;
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  };

  return { testContext };
}

// Hook to refresh customer context
export function useRefreshCustomerContext() {
  const queryClient = useQueryClient();

  const refreshContext = (phoneNumber: string) => {
    queryClient.invalidateQueries({
      queryKey: CUSTOMER_QUERY_KEYS.context(phoneNumber)
    });
  };

  const refreshAllContexts = () => {
    queryClient.invalidateQueries({
      queryKey: CUSTOMER_QUERY_KEYS.allContexts
    });
  };

  return { refreshContext, refreshAllContexts };
}

// Utility function to extract phone number from conversation
export function extractPhoneNumber(phoneNumber: string): string {
  // Remove WhatsApp suffix if present
  return phoneNumber.replace('_s_whatsapp_net', '');
}

// Utility function to format customer context for display
export function formatCustomerContext(context: LegacyCustomerContextResponse) {
  if (!context.customer_found || !context.customer_context) {
    return {
      displayName: 'Unknown Contact',
      subtitle: 'No CRM data available',
      isKnownCustomer: false,
    };
  }

  const customer = context.customer_context;
  const displayName = customer.name || 'Unknown Contact';
  
  let subtitle = '';
  if (customer.position && customer.company) {
    subtitle = `${customer.position} at ${customer.company}`;
  } else if (customer.company) {
    subtitle = customer.company;
  } else if (customer.position) {
    subtitle = customer.position;
  } else {
    subtitle = `Lead Status: ${customer.lead_status}`;
  }

  return {
    displayName,
    subtitle,
    isKnownCustomer: true,
    leadStatus: customer.lead_status,
    leadScore: customer.lead_score,
    company: customer.company,
    position: customer.position,
    email: customer.email,
    source: customer.source,
    activeDeals: customer.active_deals?.length || 0,
    pendingTasks: customer.pending_tasks?.length || 0,
    recentActivities: customer.recent_activities?.length || 0,
  };
} 
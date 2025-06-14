import { apiClient } from './client';
import { CustomerContextResponse, LegacyCustomerContextResponse, CustomerContextData } from '@/lib/types/customer';

export const customerApi = {
  // Get customer context by phone number
  getCustomerContext: async (phoneNumber: string): Promise<LegacyCustomerContextResponse> => {
    try {
      // Clean phone number - remove WhatsApp suffix if present
      const cleanPhoneNumber = phoneNumber.replace('_s_whatsapp_net', '');
      
      console.log(`🔍 Fetching customer context for: ${cleanPhoneNumber}`);
      
      const response = await apiClient.get<CustomerContextData>(
        `/api/customer-context/${cleanPhoneNumber}`
      );
      
      console.log('📊 API Client Response:', response);
      
      if (!response) {
        throw new Error('No response received from customer context API');
      }

      // The API client already handles the response format, so response.data contains the actual customer data
      if (response.status === 'success' && response.data) {
        console.log('✅ Customer found:', response.data.name);
        return {
          success: true,
          customer_found: true,
          customer_context: {
            ...response.data,
            // Map deals to active_deals for backward compatibility
            active_deals: response.data.deals || [],
          },
          context_summary: response.data.context_summary || `Customer: ${response.data.name}`,
        };
      } else {
        console.log('❌ Customer not found or API error');
        return {
          success: false,
          customer_found: false,
          customer_context: null,
          context_summary: 'No customer information found for this phone number.',
          error: response.message || 'Customer not found'
        };
      }
    } catch (error: any) {
      console.error('❌ Error fetching customer context:', error);
      
      // Return fallback response for errors
      return {
        success: false,
        customer_found: false,
        customer_context: null,
        context_summary: 'Unable to retrieve customer information at this time.',
        error: error.message || 'Unknown error occurred'
      };
    }
  },

  // Test customer context API (for debugging)
  testCustomerContext: async (phoneNumber: string) => {
    try {
      const cleanPhoneNumber = phoneNumber.replace('_s_whatsapp_net', '');
      console.log(`🔍 Testing customer context for: ${cleanPhoneNumber}`);
      
      // Get the raw API response first
      const rawResponse = await apiClient.get<CustomerContextData>(
        `/api/customer-context/${cleanPhoneNumber}`
      );
      
      console.log('📊 Raw API Response:', rawResponse);
      
      // Then get the processed response
      const response = await customerApi.getCustomerContext(cleanPhoneNumber);
      
      console.log('🔄 Processed Response:', response);
      
      if (response.customer_found && response.customer_context) {
        console.log('✅ Customer found:', response.customer_context.name);
        console.log('🏢 Company:', response.customer_context.company);
        console.log('📈 Lead Status:', response.customer_context.lead_status);
        console.log('⭐ Lead Score:', response.customer_context.lead_score);
        
        if (response.customer_context.active_deals?.length) {
          console.log('💼 Active Deals:', response.customer_context.active_deals.length);
        }
        
        if (response.customer_context.pending_tasks?.length) {
          console.log('📋 Pending Tasks:', response.customer_context.pending_tasks.length);
        }
      } else {
        console.log('❌ Customer not found in CRM');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error testing customer context:', error);
      throw error;
    }
  }
}; 
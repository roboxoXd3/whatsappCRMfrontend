import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '@/lib/api/crm';
import {
  Contact,
  Deal,
  Task,
  CreateContactRequest,
  UpdateContactRequest,
  CreateDealRequest,
  UpdateDealRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  ContactFilters,
  DealFilters,
  TaskFilters,
  PaginationParams,
} from '@/lib/types/crm';

// Query Keys
export const CRM_QUERY_KEYS = {
  contacts: ['crm', 'contacts'] as const,
  contact: (id: string) => ['crm', 'contacts', id] as const,
  contactsWithFilters: (filters: ContactFilters & PaginationParams) => 
    ['crm', 'contacts', 'filtered', filters] as const,
  
  deals: ['crm', 'deals'] as const,
  deal: (id: string) => ['crm', 'deals', id] as const,
  dealsWithFilters: (filters: DealFilters & PaginationParams) => 
    ['crm', 'deals', 'filtered', filters] as const,
  dealsByContact: (contactId: string) => ['crm', 'deals', 'contact', contactId] as const,
  
  tasks: ['crm', 'tasks'] as const,
  task: (id: string) => ['crm', 'tasks', id] as const,
  tasksWithFilters: (filters: TaskFilters & PaginationParams) => 
    ['crm', 'tasks', 'filtered', filters] as const,
  tasksByContact: (contactId: string) => ['crm', 'tasks', 'contact', contactId] as const,
  
  stats: ['crm', 'stats'] as const,
  contactStats: ['crm', 'stats', 'contacts'] as const,
  dealStats: ['crm', 'stats', 'deals'] as const,
  taskStats: ['crm', 'stats', 'tasks'] as const,
};

// ============================================================================
// CONTACTS HOOKS
// ============================================================================

export function useContacts(filters: ContactFilters & PaginationParams = {}) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.contactsWithFilters(filters),
    queryFn: () => crmApi.contacts.getContacts(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useContact(contactId: string) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.contact(contactId),
    queryFn: () => crmApi.contacts.getContact(contactId),
    enabled: !!contactId,
    staleTime: 30000,
  });
}

export function useSearchContacts(query: string, pagination: PaginationParams = {}) {
  return useQuery({
    queryKey: ['crm', 'contacts', 'search', query, pagination],
    queryFn: () => crmApi.contacts.searchContacts(query, pagination),
    enabled: query.length > 0,
    staleTime: 10000, // 10 seconds for search results
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contactData: CreateContactRequest) => 
      crmApi.contacts.createContact(contactData),
    onSuccess: () => {
      // Invalidate and refetch contacts list
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.contacts });
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.contactStats });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contactId, contactData }: { 
      contactId: string; 
      contactData: UpdateContactRequest 
    }) => crmApi.contacts.updateContact(contactId, contactData),
    onSuccess: (data, variables) => {
      // Update the specific contact in cache
      queryClient.invalidateQueries({ 
        queryKey: CRM_QUERY_KEYS.contact(variables.contactId) 
      });
      // Invalidate contacts list to reflect changes
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.contacts });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contactId: string) => crmApi.contacts.deleteContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.contacts });
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.contactStats });
    },
  });
}

// ============================================================================
// DEALS HOOKS
// ============================================================================

export function useDeals(filters: DealFilters & PaginationParams = {}) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.dealsWithFilters(filters),
    queryFn: () => crmApi.deals.getDeals(filters),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useDeal(dealId: string) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.deal(dealId),
    queryFn: () => crmApi.deals.getDeal(dealId),
    enabled: !!dealId,
    staleTime: 30000,
  });
}

export function useDealsByContact(contactId: string) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.dealsByContact(contactId),
    queryFn: () => crmApi.deals.getDealsByContact(contactId),
    enabled: !!contactId,
    staleTime: 30000,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dealData: CreateDealRequest) => crmApi.deals.createDeal(dealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.deals });
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.dealStats });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dealId, dealData }: { 
      dealId: string; 
      dealData: UpdateDealRequest 
    }) => crmApi.deals.updateDeal(dealId, dealData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: CRM_QUERY_KEYS.deal(variables.dealId) 
      });
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.deals });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dealId: string) => crmApi.deals.deleteDeal(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.deals });
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.dealStats });
    },
  });
}

// ============================================================================
// TASKS HOOKS
// ============================================================================

export function useTasks(filters: TaskFilters & PaginationParams = {}) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.tasksWithFilters(filters),
    queryFn: () => crmApi.tasks.getTasks(filters),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.task(taskId),
    queryFn: () => crmApi.tasks.getTask(taskId),
    enabled: !!taskId,
    staleTime: 30000,
  });
}

export function useTasksByContact(contactId: string) {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.tasksByContact(contactId),
    queryFn: () => crmApi.tasks.getTasksByContact(contactId),
    enabled: !!contactId,
    staleTime: 30000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: CreateTaskRequest) => crmApi.tasks.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.tasks });
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.taskStats });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, taskData }: { 
      taskId: string; 
      taskData: UpdateTaskRequest 
    }) => crmApi.tasks.updateTask(taskId, taskData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: CRM_QUERY_KEYS.task(variables.taskId) 
      });
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.tasks });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => crmApi.tasks.completeTask(taskId),
    onSuccess: (data, taskId) => {
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.task(taskId) });
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.tasks });
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.taskStats });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => crmApi.tasks.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.tasks });
      queryClient.invalidateQueries({ queryKey: CRM_QUERY_KEYS.taskStats });
    },
  });
}

// ============================================================================
// STATISTICS HOOKS
// ============================================================================

export function useCRMStats() {
  // Since the stats endpoint doesn't exist, we'll calculate stats from individual endpoints
  const contactsQuery = useQuery({
    queryKey: ['crm', 'contacts', 'all'],
    queryFn: () => crmApi.contacts.getContacts({ limit: 1000 }),
    staleTime: 60000,
    refetchInterval: 120000,
  });

  const dealsQuery = useQuery({
    queryKey: ['crm', 'deals', 'all'],
    queryFn: () => crmApi.deals.getDeals({ limit: 1000 }),
    staleTime: 60000,
    refetchInterval: 120000,
  });

  const tasksQuery = useQuery({
    queryKey: ['crm', 'tasks', 'all'],
    queryFn: () => crmApi.tasks.getTasks({ limit: 1000 }),
    staleTime: 60000,
    refetchInterval: 120000,
  });

  // Calculate stats from the fetched data
  const calculatedStats = React.useMemo(() => {
    // Check if we have the data from all three queries
    const contactsData = contactsQuery.data?.data;
    const dealsData = dealsQuery.data?.data;
    const tasksData = tasksQuery.data?.data;

    // Allow empty arrays for deals (since there might be no deals)
    if (!contactsData || dealsData === undefined || !tasksData) {
      return null;
    }

    const contacts = contactsData;
    const deals = dealsData;
    const tasks = tasksData;

    // Calculate contact stats
    const totalContacts = contacts.length;
    const totalLeads = contacts.filter(c => c.lead_status === 'new' || c.lead_status === 'contacted' || c.lead_status === 'qualified').length;
    const totalCustomers = contacts.filter(c => c.lead_status === 'qualified' || c.lead_status === 'negotiation').length;

    // Calculate deal stats
    const totalDeals = deals.length;
    const openDeals = deals.filter(d => d.status === 'open').length;
    const wonDeals = deals.filter(d => d.status === 'won').length;
    const totalDealValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const avgDealSize = totalDeals > 0 ? totalDealValue / totalDeals : 0;

    // Calculate task stats
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(t => {
      if (!t.due_date) return false;
      return new Date(t.due_date) < new Date() && t.status === 'pending';
    }).length;

    // Calculate conversion rate
    const conversionRate = totalContacts > 0 ? (totalCustomers / totalContacts) * 100 : 0;

    const stats = {
      total_contacts: totalContacts,
      total_leads: totalLeads,
      total_customers: totalCustomers,
      total_deals: openDeals, // Show open deals as "active deals"
      total_deal_value: totalDealValue,
      won_deals: wonDeals,
      pending_tasks: pendingTasks,
      overdue_tasks: overdueTasks,
      conversion_rate: conversionRate,
      avg_deal_size: avgDealSize,
    };

    return stats;
  }, [contactsQuery.data, dealsQuery.data, tasksQuery.data]);



  return {
    data: calculatedStats ? { status: 'success', data: calculatedStats } : undefined,
    isLoading: contactsQuery.isLoading || dealsQuery.isLoading || tasksQuery.isLoading,
    error: contactsQuery.error || dealsQuery.error || tasksQuery.error,
  };
}

export function useContactStats() {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.contactStats,
    queryFn: () => crmApi.stats.getContactStats(),
    staleTime: 60000,
    refetchInterval: 120000,
  });
}

export function useDealStats() {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.dealStats,
    queryFn: () => crmApi.stats.getDealStats(),
    staleTime: 60000,
    refetchInterval: 120000,
  });
}

export function useTaskStats() {
  return useQuery({
    queryKey: CRM_QUERY_KEYS.taskStats,
    queryFn: () => crmApi.stats.getTaskStats(),
    staleTime: 60000,
    refetchInterval: 120000,
  });
} 
import { apiClient } from './client';
import { ApiResponse } from '@/lib/types/api';
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
  CRMStats,
} from '@/lib/types/crm';

// Contacts API
export const contactsApi = {
  // Get all contacts with filters and pagination
  getContacts: async (
    filters: ContactFilters & PaginationParams = {}
  ): Promise<ApiResponse<Contact[]>> => {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.search) params.append('search', filters.search);

    // Use the unique endpoint to eliminate duplicate phone numbers
    return await apiClient.get<Contact[]>(`/api/crm/contacts/unique?${params.toString()}`);
  },

  // Get single contact by ID
  getContact: async (contactId: string): Promise<ApiResponse<Contact>> => {
    return await apiClient.get<Contact>(`/api/crm/contact/${contactId}`);
  },

  // Create new contact
  createContact: async (contactData: CreateContactRequest): Promise<ApiResponse<Contact>> => {
    return await apiClient.post<Contact>('/api/crm/contacts', contactData);
  },

  // Update existing contact
  updateContact: async (
    contactId: string,
    contactData: UpdateContactRequest
  ): Promise<ApiResponse<Contact>> => {
    return await apiClient.put<Contact>(`/api/crm/contact/${contactId}`, contactData);
  },

  // Delete contact
  deleteContact: async (contactId: string): Promise<ApiResponse<{ message: string }>> => {
    return await apiClient.delete<{ message: string }>(`/api/crm/contact/${contactId}`);
  },
};

// Deals API
export const dealsApi = {
  // Get all deals with filters and pagination
  getDeals: async (
    filters: DealFilters & PaginationParams = {}
  ): Promise<ApiResponse<Deal[]>> => {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.search) params.append('search', filters.search);

    return await apiClient.get<Deal[]>(`/api/crm/deals?${params.toString()}`);
  },

  // Get single deal by ID
  getDeal: async (dealId: string): Promise<ApiResponse<Deal>> => {
    return await apiClient.get<Deal>(`/api/crm/deal/${dealId}`);
  },

  // Create new deal
  createDeal: async (dealData: CreateDealRequest): Promise<ApiResponse<Deal>> => {
    return await apiClient.post<Deal>('/api/crm/deals', dealData);
  },

  // Update existing deal
  updateDeal: async (
    dealId: string,
    dealData: UpdateDealRequest
  ): Promise<ApiResponse<Deal>> => {
    return await apiClient.put<Deal>(`/api/crm/deal/${dealId}`, dealData);
  },

  // Delete deal
  deleteDeal: async (dealId: string): Promise<ApiResponse<{ message: string }>> => {
    return await apiClient.delete<{ message: string }>(`/api/crm/deal/${dealId}`);
  },

  // Get deals by contact
  getDealsByContact: async (contactId: string): Promise<ApiResponse<Deal[]>> => {
    return await apiClient.get<Deal[]>(`/api/crm/contact/${contactId}/deals`);
  },
};

// Tasks API
export const tasksApi = {
  // Get all tasks with filters and pagination
  getTasks: async (
    filters: TaskFilters & PaginationParams = {}
  ): Promise<ApiResponse<Task[]>> => {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters.overdue) params.append('overdue', filters.overdue.toString());

    return await apiClient.get<Task[]>(`/api/crm/tasks?${params.toString()}`);
  },

  // Get single task by ID
  getTask: async (taskId: string): Promise<ApiResponse<Task>> => {
    return await apiClient.get<Task>(`/api/crm/task/${taskId}`);
  },

  // Create new task
  createTask: async (taskData: CreateTaskRequest): Promise<ApiResponse<Task>> => {
    return await apiClient.post<Task>('/api/crm/tasks', taskData);
  },

  // Update existing task
  updateTask: async (
    taskId: string,
    taskData: UpdateTaskRequest
  ): Promise<ApiResponse<Task>> => {
    return await apiClient.put<Task>(`/api/crm/task/${taskId}`, taskData);
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<ApiResponse<{ message: string }>> => {
    return await apiClient.delete<{ message: string }>(`/api/crm/task/${taskId}`);
  },

  // Get tasks by contact
  getTasksByContact: async (contactId: string): Promise<ApiResponse<Task[]>> => {
    return await apiClient.get<Task[]>(`/api/crm/contact/${contactId}/tasks`);
  },

  // Mark task as completed
  completeTask: async (taskId: string): Promise<ApiResponse<Task>> => {
    return await apiClient.patch<Task>(`/api/crm/task/${taskId}/complete`);
  },
};

// CRM Statistics API
export const crmStatsApi = {
  // Get overall CRM statistics
  getStats: async (): Promise<ApiResponse<CRMStats>> => {
    return await apiClient.get<CRMStats>('/api/crm/stats');
  },

  // Get contact statistics
  getContactStats: async (): Promise<ApiResponse<{
    total_contacts: number;
    leads: number;
    customers: number;
    inactive: number;
    recent_contacts: Contact[];
  }>> => {
    return await apiClient.get('/api/crm/contacts/stats');
  },

  // Get deal statistics
  getDealStats: async (): Promise<ApiResponse<{
    total_deals: number;
    total_value: number;
    won_deals: number;
    won_value: number;
    avg_deal_size: number;
    conversion_rate: number;
    deals_by_stage: Record<string, number>;
  }>> => {
    return await apiClient.get('/api/crm/deals/stats');
  },

  // Get task statistics
  getTaskStats: async (): Promise<ApiResponse<{
    total_tasks: number;
    pending_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
    tasks_by_priority: Record<string, number>;
  }>> => {
    return await apiClient.get('/api/crm/tasks/stats');
  },
};

// Export all CRM APIs
export const crmApi = {
  contacts: contactsApi,
  deals: dealsApi,
  tasks: tasksApi,
  stats: crmStatsApi,
}; 
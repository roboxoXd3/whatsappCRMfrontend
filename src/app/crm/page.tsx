'use client';

import { useState } from 'react';
import { Users, Briefcase, CheckSquare, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRMStats } from '@/hooks/useCRM';
import { cn } from '@/lib/utils';

// Import CRM components (we'll create these next)
import { ContactsList } from '@/components/crm/contacts-list';
// import { DealsList } from '@/components/crm/deals-list';
// import { TasksList } from '@/components/crm/tasks-list';

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState('contacts');
  const { data: crmStats, isLoading: statsLoading } = useCRMStats();

  const stats = crmStats?.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="flex-1 space-y-6 p-6" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>CRM</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Manage your contacts, deals, and tasks in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatNumber(stats?.total_contacts || 0)}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {statsLoading ? '...' : formatNumber(stats?.total_leads || 0)} leads, {' '}
              {statsLoading ? '...' : formatNumber(stats?.total_customers || 0)} customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <Briefcase className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatNumber(stats?.total_deals || 0)}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {statsLoading ? '...' : formatCurrency(stats?.total_deal_value || 0)} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : formatNumber(stats?.pending_tasks || 0)}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {statsLoading ? '...' : formatNumber(stats?.overdue_tasks || 0)} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `${(stats?.conversion_rate || 0).toFixed(1)}%`}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Avg deal: {statsLoading ? '...' : formatCurrency(stats?.avg_deal_size || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
          <TabsTrigger value="contacts" className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
            <Users className="h-4 w-4" />
            Contacts
            {stats?.total_contacts && (
              <Badge variant="secondary" className="ml-1" style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
                {formatNumber(stats.total_contacts)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="deals" className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
            <Briefcase className="h-4 w-4" />
            Deals
            {stats?.total_deals && (
              <Badge variant="secondary" className="ml-1" style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
                {formatNumber(stats.total_deals)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
            <CheckSquare className="h-4 w-4" />
            Tasks
            {stats?.pending_tasks && (
              <Badge variant="secondary" className="ml-1" style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
                {formatNumber(stats.pending_tasks)}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <ContactsList />
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deals Pipeline</CardTitle>
              <CardDescription>
                Track your sales opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted-foreground)' }}>
                <div className="text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Deals Pipeline Coming Soon</p>
                  <p className="text-sm">We're building the deals management interface</p>
                </div>
              </div>
              {/* <DealsList /> */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Keep track of your follow-ups and to-dos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64" style={{ color: 'var(--muted-foreground)' }}>
                <div className="text-center">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Task Management Coming Soon</p>
                  <p className="text-sm">We're building the task management interface</p>
                </div>
              </div>
              {/* <TasksList /> */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
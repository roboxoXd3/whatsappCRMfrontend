'use client';

import { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Users, MessageSquare, Calendar, MoreHorizontal, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface BulkJob {
  id: string;
  message: string;
  totalContacts: number;
  successfulSends: number;
  failedSends: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  duration?: string;
}

export function BulkSendHistory() {
  const [jobs] = useState<BulkJob[]>([
    {
      id: 'bulk_20240117_001',
      message: 'Hello! This is a test message from Rian Infotech. How can we help you today?',
      totalContacts: 25,
      successfulSends: 23,
      failedSends: 2,
      status: 'completed',
      createdAt: '2024-01-17T10:30:00Z',
      completedAt: '2024-01-17T10:35:00Z',
      duration: '5m 12s'
    },
    {
      id: 'bulk_20240117_002',
      message: 'Special offer: Get 20% off on our AI automation services!',
      totalContacts: 50,
      successfulSends: 45,
      failedSends: 5,
      status: 'completed',
      createdAt: '2024-01-17T14:15:00Z',
      completedAt: '2024-01-17T14:22:00Z',
      duration: '7m 30s'
    },
    {
      id: 'bulk_20240117_003',
      message: 'Thank you for your interest in our services. We will get back to you soon!',
      totalContacts: 10,
      successfulSends: 8,
      failedSends: 0,
      status: 'in_progress',
      createdAt: '2024-01-17T16:45:00Z',
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSuccessRate = (job: BulkJob) => {
    if (job.totalContacts === 0) return 0;
    return Math.round((job.successfulSends / job.totalContacts) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-2xl font-bold">{jobs.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Messages Sent</p>
              <p className="text-2xl font-bold">
                {jobs.reduce((sum, job) => sum + job.successfulSends, 0)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold">
                {Math.round(
                  (jobs.reduce((sum, job) => sum + job.successfulSends, 0) /
                   jobs.reduce((sum, job) => sum + job.totalContacts, 0)) * 100
                )}%
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              <p className="text-2xl font-bold">
                {jobs.filter(job => job.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Bulk Send Jobs</h3>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contacts</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono text-sm">{job.id}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={job.message}>
                      {job.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      {getStatusBadge(job.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{job.totalContacts} total</div>
                      <div className="text-gray-500">
                        {job.successfulSends} sent, {job.failedSends} failed
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {getSuccessRate(job)}%
                      </span>
                      <div className="w-12 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${getSuccessRate(job)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(job.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {job.duration || '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export Results
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bulk send jobs yet</h3>
            <p className="text-gray-500">
              Your bulk messaging history will appear here once you start sending messages.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, AlertCircle, Users, MessageSquare, Calendar, MoreHorizontal, Eye, Download, RefreshCw, X, Phone, User, Building2, Mail, ArrowRight, AlertTriangle, Image as ImageIcon, Video as VideoIcon, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/stores/auth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BulkJob {
  id: string;
  name: string;
  message_content: string;
  total_contacts: number;
  successful_sends: number;
  failed_sends: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  media_type?: 'image' | 'video' | null;
  media_url?: string | null;
  media_size?: number | null;
}

interface MessageResult {
  id: string;
  phone_number: string;
  name: string;
  company: string;
  email: string;
  success: boolean;
  error_message?: string;
  sent_at: string;
}

interface CampaignDetails {
  campaign: BulkJob;
  results: MessageResult[];
  total_results: number;
}

export function BulkSendHistory() {
  const router = useRouter();
  const { toast } = useToast();
  const { token } = useAuthStore();
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [selectedJobForUpdate, setSelectedJobForUpdate] = useState<string | null>(null);

  // Navigate to conversation page with specific phone number
  const navigateToConversation = (phoneNumber: string) => {
    // Close the modal first
    setShowDetailsModal(false);
    // Navigate to conversations page
    router.push(`/conversations?phone=${encodeURIComponent(phoneNumber)}`);
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/bulk-send/jobs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bulk send history');
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setJobs(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching bulk send history:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCampaignDetails = async (campaignId: string) => {
    setIsLoadingDetails(true);
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/bulk-send/campaigns/${campaignId}/results`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaign details');
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setSelectedCampaign(data.data);
        setShowDetailsModal(true);
      } else {
        throw new Error(data.message || 'Failed to fetch campaign details');
      }
    } catch (err) {
      console.error('Error fetching campaign details:', err);
      alert(err instanceof Error ? err.message : 'Failed to load campaign details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
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
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getSuccessRate = (job: BulkJob) => {
    if (!job.total_contacts || job.total_contacts === 0) return 0;
    const successful = job.successful_sends || 0;
    return Math.round((successful / job.total_contacts) * 100);
  };

  const isJobStuck = (job: BulkJob): boolean => {
    if (job.status !== 'running') return false;
    if (!job.started_at) return false;
    
    const startedAt = new Date(job.started_at);
    const now = new Date();
    const hoursAgo = (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60);
    
    return hoursAgo > 1; // Consider stuck if running for more than 1 hour
  };

  const handleUpdateCampaignStatus = async (campaignId: string, newStatus: 'failed' | 'completed' | 'cancelled') => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/bulk-send/campaigns/${campaignId}/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          reason: 'Manual status update from UI'
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        toast({
          title: "Status Updated",
          description: `Campaign marked as ${newStatus}`,
          duration: 3000,
        });
        
        // Refresh the jobs list
        fetchJobs();
      } else {
        toast({
          title: "Update Failed",
          description: result.message || `Failed to update campaign status`,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign status. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setSelectedJobForUpdate(null);
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/bulk-send/cancel/${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        toast({
          title: "Campaign Stopped",
          description: "The campaign will stop after the current message completes",
          duration: 5000,
        });
        
        // Refresh the jobs list after a short delay to show the cancelled status
        setTimeout(() => {
          fetchJobs();
        }, 1000);
      } else {
        toast({
          title: "Stop Failed",
          description: result.message || "Failed to stop campaign",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      toast({
        title: "Error",
        description: "Failed to stop campaign. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleCleanupStuckCampaigns = async () => {
    setIsCleaningUp(true);
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${baseURL}/api/bulk-send/cleanup-stuck-campaigns?hours_threshold=24`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const count = result.data.count;
        
        toast({
          title: "Cleanup Complete",
          description: `${count} campaign(s) marked as failed`,
          duration: 5000,
        });
        
        // Refresh the jobs list
        if (count > 0) {
          fetchJobs();
        }
      } else {
        toast({
          title: "Cleanup Failed",
          description: result.message || "Failed to cleanup stuck campaigns",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error cleaning up stuck campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to cleanup stuck campaigns. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsCleaningUp(false);
      setShowCleanupDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Refresh and Cleanup Buttons */}
      <div className="flex justify-between items-center">
        <div>
          {jobs.filter(job => isJobStuck(job)).length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {jobs.filter(job => isJobStuck(job)).length} stuck campaign(s)
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {jobs.filter(job => job.status === 'running').length > 0 && (
            <Button 
              onClick={() => setShowCleanupDialog(true)} 
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Cleanup Stuck
            </Button>
          )}
          <Button 
            onClick={fetchJobs} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Error: {error}</p>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && jobs.length === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <RefreshCw className="h-8 w-8 animate-spin mb-4" />
            <p>Loading bulk send history...</p>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      {(!isLoading || jobs.length > 0) && (
        <>
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
                {jobs.reduce((sum, job) => sum + (job.successful_sends || 0), 0)}
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
                {(() => {
                  const totalContacts = jobs.reduce((sum, job) => sum + (job.total_contacts || 0), 0);
                  const successfulSends = jobs.reduce((sum, job) => sum + (job.successful_sends || 0), 0);
                  if (totalContacts === 0) return '0';
                  return Math.round((successfulSends / totalContacts) * 100);
                })()}%
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
                {jobs.filter(job => job.status === 'running').length}
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
                    <div className="flex items-center gap-2">
                      <div className="truncate" title={job.message_content}>
                        {job.message_content}
                      </div>
                      {job.media_type && (
                        <Badge variant="secondary" className="flex-shrink-0">
                          {job.media_type === 'image' ? (
                            <>
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Image
                            </>
                          ) : (
                            <>
                              <VideoIcon className="h-3 w-3 mr-1" />
                              Video
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      {getStatusBadge(job.status)}
                      {isJobStuck(job) && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Stuck?
                        </Badge>
                      )}
                      {job.status === 'running' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelCampaign(job.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-6 px-2"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Stop
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{job.total_contacts || 0} total</div>
                      <div className="text-gray-500">
                        {job.successful_sends || 0} sent, {job.failed_sends || 0} failed
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
                    {formatDate(job.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {job.completed_at ? formatDate(job.completed_at) : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => fetchCampaignDetails(job.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export Results
                        </DropdownMenuItem>
                        
                        {job.status === 'running' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleCancelCampaign(job.id)}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Stop Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateCampaignStatus(job.id, 'failed')}
                              className="text-orange-600"
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Mark as Failed (Stuck)
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateCampaignStatus(job.id, 'completed')}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {jobs.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bulk send jobs yet</h3>
            <p className="text-gray-500">
              Your bulk messaging history will appear here once you start sending messages.
            </p>
          </div>
        )}
      </Card>
      </>
      )}

      {/* Campaign Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Campaign Details</DialogTitle>
            <DialogDescription>
              View individual message results for this campaign
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex justify-center items-center p-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : selectedCampaign ? (
            <div className="space-y-6">
              {/* Campaign Summary */}
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Total Contacts</p>
                    <p className="text-lg font-bold">{selectedCampaign.campaign.total_contacts || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Successful</p>
                    <p className="text-lg font-bold text-green-600">{selectedCampaign.campaign.successful_sends || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Failed</p>
                    <p className="text-lg font-bold text-red-600">{selectedCampaign.campaign.failed_sends || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Success Rate</p>
                    <p className="text-lg font-bold">
                      {selectedCampaign.campaign.total_contacts && selectedCampaign.campaign.total_contacts > 0
                        ? Math.round(((selectedCampaign.campaign.successful_sends || 0) / selectedCampaign.campaign.total_contacts) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Message:</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedCampaign.campaign.message_content}</p>
                  
                  {/* Media Preview */}
                  {selectedCampaign.campaign.media_url && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-gray-600 mb-2">Media Attachment:</p>
                      <div className="border rounded-lg p-2 bg-white">
                        {selectedCampaign.campaign.media_type === 'image' ? (
                          <img 
                            src={selectedCampaign.campaign.media_url} 
                            alt="Campaign media" 
                            className="max-w-xs rounded"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.png';
                              e.currentTarget.alt = 'Media failed to load';
                              e.currentTarget.className = 'max-w-xs rounded opacity-50';
                            }}
                          />
                        ) : (
                          <video 
                            src={selectedCampaign.campaign.media_url} 
                            controls 
                            className="max-w-xs rounded"
                          >
                            Your browser does not support video playback.
                          </video>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          <Badge variant="secondary" className="mr-2">
                            {selectedCampaign.campaign.media_type === 'image' ? (
                              <>
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Image
                              </>
                            ) : (
                              <>
                                <VideoIcon className="h-3 w-3 mr-1" />
                                Video
                              </>
                            )}
                          </Badge>
                          Media stored permanently in Supabase Storage
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Individual Results Table */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-700">
                  Individual Message Results ({selectedCampaign.total_results})
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Phone Number</TableHead>
                        <TableHead className="w-24 text-center">Status</TableHead>
                        <TableHead>Error Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCampaign.results.map((result, index) => (
                        <TableRow key={result.id} className={!result.success ? 'bg-red-50' : ''}>
                          <TableCell className="text-gray-500">{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-400" />
                                <span className="font-medium text-sm">
                                  {result.name || 'No name'}
                                </span>
                              </div>
                              {result.company && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Building2 className="h-3 w-3" />
                                  {result.company}
                                </div>
                              )}
                              {result.email && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Mail className="h-3 w-3" />
                                  {result.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => navigateToConversation(result.phone_number)}
                              className="flex items-center gap-1 text-sm font-mono text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer group"
                              title="Open conversation"
                            >
                              <Phone className="h-3 w-3 text-gray-400 group-hover:text-blue-600" />
                              {result.phone_number}
                              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </TableCell>
                          <TableCell className="text-center">
                            {result.success ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Sent
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-red-600">
                            {result.error_message || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Cleanup Confirmation Dialog */}
      <AlertDialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cleanup Stuck Campaigns?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all campaigns that have been running for more than 24 hours as "failed". 
              This action cannot be undone.
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Campaigns found:</strong> {jobs.filter(job => job.status === 'running').length} running
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  Only campaigns running for more than 24 hours will be affected.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCleaningUp}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCleanupStuckCampaigns}
              disabled={isCleaningUp}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCleaningUp ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cleaning...
                </>
              ) : (
                'Cleanup Stuck Campaigns'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 
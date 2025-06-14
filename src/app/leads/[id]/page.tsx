'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  lead_status: string;
  lead_source: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

interface Interaction {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

interface Requirement {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

export default function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadId, setLeadId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setLeadId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    }
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const [leadRes, interactionsRes, requirementsRes] = await Promise.all([
        fetch(`/api/leads/${leadId}`),
        fetch(`/api/leads/${leadId}/interactions`),
        fetch(`/api/leads/${leadId}/requirements`)
      ]);

      const [leadData, interactionsData, requirementsData] = await Promise.all([
        leadRes.json(),
        interactionsRes.json(),
        requirementsRes.json()
      ]);

      setLead(leadData);
      setInteractions(interactionsData);
      setRequirements(requirementsData);
    } catch (error) {
      console.error('Error fetching lead details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Converted': 'bg-purple-100 text-purple-800',
      'Lost': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="container mx-auto py-6">Loading...</div>;
  }

  if (!lead) {
    return <div className="container mx-auto py-6">Lead not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lead Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/leads')}>
            Back to Leads
          </Button>
          <Button onClick={() => router.push(`/leads/${leadId}/edit`)}>
            Edit Lead
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1">{lead.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Company</h3>
                <p className="mt-1">{lead.company_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{lead.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1">{lead.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <Badge className={`mt-1 ${getStatusColor(lead.lead_status)}`}>
                  {lead.lead_status}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Source</h3>
                <p className="mt-1">{lead.lead_source}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="mt-1">{format(new Date(lead.created_at), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="mt-1">{format(new Date(lead.updated_at), 'MMM d, yyyy')}</p>
              </div>
            </div>
            {lead.notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full" onClick={() => router.push(`/leads/${leadId}/interactions/new`)}>
                Add Interaction
              </Button>
              <Button className="w-full" onClick={() => router.push(`/leads/${leadId}/requirements/new`)}>
                Add Requirement
              </Button>
              <Button className="w-full" variant="outline" onClick={() => router.push(`/chat/${lead.phone}`)}>
                Start WhatsApp Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="interactions" className="mt-6">
        <TabsList>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>
        <TabsContent value="interactions">
          <Card>
            <CardContent className="pt-6">
              {interactions.length === 0 ? (
                <p className="text-center text-gray-500">No interactions recorded</p>
              ) : (
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{interaction.type}</h4>
                          <p className="text-sm text-gray-500 mt-1">{interaction.description}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(interaction.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requirements">
          <Card>
            <CardContent className="pt-6">
              {requirements.length === 0 ? (
                <p className="text-center text-gray-500">No requirements recorded</p>
              ) : (
                <div className="space-y-4">
                  {requirements.map((requirement) => (
                    <div key={requirement.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{requirement.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{requirement.description}</p>
                          <Badge className="mt-2" variant={requirement.status === 'completed' ? 'default' : 'secondary'}>
                            {requirement.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(requirement.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
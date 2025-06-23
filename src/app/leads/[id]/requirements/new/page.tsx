'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Requirement {
  title: string;
  description: string;
  status: string;
}

export default function NewRequirementPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [leadId, setLeadId] = useState<string>('');
  const [requirement, setRequirement] = useState<Requirement>({
    title: '',
    description: '',
    status: 'Pending'
  });

  // Extract params on component mount
  useEffect(() => {
    params.then(({ id }) => setLeadId(id));
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/leads/${leadId}/requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requirement)
      });

      if (!response.ok) {
        throw new Error('Failed to save requirement');
      }

      toast({
        title: 'Success',
        description: 'Requirement added successfully'
      });

      router.push(`/leads/${leadId}`);
    } catch (error) {
      console.error('Error saving requirement:', error);
      toast({
        title: 'Error',
        description: 'Failed to save requirement',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Requirement</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Requirement Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={requirement.title}
                  onChange={(e) => setRequirement({ ...requirement, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={requirement.description}
                  onChange={(e) => setRequirement({ ...requirement, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={requirement.status}
                  onValueChange={(value) => setRequirement({ ...requirement, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Requirement'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 
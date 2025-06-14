'use client';

import { useState } from 'react';
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

interface Interaction {
  type: string;
  description: string;
}

export default function NewInteractionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [interaction, setInteraction] = useState<Interaction>({
    type: 'Call',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/leads/${params.id}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interaction)
      });

      if (!response.ok) {
        throw new Error('Failed to save interaction');
      }

      toast({
        title: 'Success',
        description: 'Interaction added successfully'
      });

      router.push(`/leads/${params.id}`);
    } catch (error) {
      console.error('Error saving interaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to save interaction',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Interaction</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Interaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={interaction.type}
                  onValueChange={(value) => setInteraction({ ...interaction, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={interaction.description}
                  onChange={(e) => setInteraction({ ...interaction, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Interaction'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 
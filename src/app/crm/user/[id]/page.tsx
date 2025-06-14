import React from 'react';
import { UserDetailCard } from '@/components/crm/UserDetailCard';
import { notFound } from 'next/navigation';

async function fetchUser(id: string) {
  const res = await fetch(`https://whatsapp-ai-chatbot-production-bc92.up.railway.app/api/crm/user/${id}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchStats(id: string) {
  const res = await fetch(`https://whatsapp-ai-chatbot-production-bc92.up.railway.app/api/crm/user/${id}/stats`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchActivity(id: string) {
  const res = await fetch(`https://whatsapp-ai-chatbot-production-bc92.up.railway.app/api/crm/user/${id}/activity`);
  if (!res.ok) return [];
  return res.json();
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const UserDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const [user, stats, activity] = await Promise.all([
    fetchUser(id),
    fetchStats(id),
    fetchActivity(id)
  ]);

  if (!user) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <UserDetailCard user={user} stats={stats} activity={activity} />
    </div>
  );
};

export default UserDetailPage; 
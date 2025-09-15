import React from 'react';
import { UserDetailCard } from '@/components/crm/UserDetailCard';
import { notFound } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function fetchUser(id: string) {
  const res = await fetch(`${API_BASE}/api/crm/user/${id}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchStats(id: string) {
  const res = await fetch(`${API_BASE}/api/crm/user/${id}/stats`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchActivity(id: string) {
  const res = await fetch(`${API_BASE}/api/crm/user/${id}/activity`);
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
    <UserDetailCard user={user} stats={stats} activity={activity} />
  );
};

export default UserDetailPage; 
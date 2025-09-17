// Dashboard layout is now handled by the root AppLayout
// This file can be removed or kept as a simple passthrough
export default function DashboardLayoutRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
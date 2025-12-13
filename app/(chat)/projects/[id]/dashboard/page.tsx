import { DashboardContent } from "@/components/dashboard/dashboard-content";

interface DashboardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const { id } = await params;
    return <DashboardContent projectId={id} />;
}

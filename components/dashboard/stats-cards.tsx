import {
  Users,
  Package,
  Receipt,
  FolderKanban,
  CheckSquare,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    totalStaff: number;
    activeStaff: number;
    totalAssets: number;
    assignedAssets: number;
    pendingExpenses: number;
    activeProjects: number;
    pendingLeave: number;
    openTasks: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Staff",
      value: stats.totalStaff,
      sub: `${stats.activeStaff} active`,
      icon: Users,
      color: "bg-blue-50 text-blue-700",
      trend: null,
    },
    {
      label: "Assets",
      value: stats.totalAssets,
      sub: `${stats.assignedAssets} assigned`,
      icon: Package,
      color: "bg-purple-50 text-purple-700",
      trend: null,
    },
    {
      label: "Pending Expenses",
      value: stats.pendingExpenses,
      sub: "awaiting approval",
      icon: Receipt,
      color:
        stats.pendingExpenses > 0
          ? "bg-orange-50 text-orange-700"
          : "bg-green-50 text-green-700",
      trend: null,
    },
    {
      label: "Active Projects",
      value: stats.activeProjects,
      sub: "in progress",
      icon: FolderKanban,
      color: "bg-emerald-50 text-emerald-700",
      trend: null,
    },
    {
      label: "Open Tasks",
      value: stats.openTasks,
      sub: "pending completion",
      icon: CheckSquare,
      color: "bg-teal-50 text-teal-700",
      trend: null,
    },
    {
      label: "Leave Requests",
      value: stats.pendingLeave,
      sub: "awaiting decision",
      icon: Clock,
      color:
        stats.pendingLeave > 0
          ? "bg-yellow-50 text-yellow-700"
          : "bg-gray-50 text-gray-700",
      trend: null,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label} className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{card.sub}</p>
              </div>
              <div className={`rounded-lg p-2 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

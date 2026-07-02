import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";
import { PENDING_APPROVAL_STATUSES } from "@/lib/expense-workflow";

export const metadata: Metadata = { title: "Dashboard" };

async function getDashboardStats() {
  const [
    totalStaff,
    activeStaff,
    totalAssets,
    assignedAssets,
    pendingExpenses,
    activeProjects,
    pendingLeave,
    openTasks,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { employmentStatus: "ACTIVE" } }),
    db.asset.count(),
    db.asset.count({ where: { status: "ASSIGNED" } }),
    db.expense.count({
      where: { status: { in: PENDING_APPROVAL_STATUSES as unknown as ("SUBMITTED" | "FINANCE_APPROVED" | "APPROVED")[] } },
    }),
    db.project.count({ where: { status: "ACTIVE" } }),
    db.leave.count({ where: { status: "PENDING" } }),
    db.task.count({ where: { status: { in: ["TODO", "IN_PROGRESS"] } } }),
  ]);

  return {
    totalStaff,
    activeStaff,
    totalAssets,
    assignedAssets,
    pendingExpenses,
    activeProjects,
    pendingLeave,
    openTasks,
  };
}

async function getRecentExpenses() {
  return db.expense.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, image: true } },
      category: { select: { name: true } },
    },
  });
}

async function getPendingLeave() {
  return db.leave.findMany({
    where: { status: "PENDING" },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, image: true, department: { select: { name: true } } } },
    },
  });
}

export default async function DashboardPage() {
  const session = await auth();
  const [stats, recentExpenses, pendingLeaveRequests] = await Promise.all([
    getDashboardStats(),
    getRecentExpenses(),
    getPendingLeave(),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {firstName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s what&apos;s happening at Uthabiti Africa today.
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity expenses={recentExpenses} />
        </div>
        <div className="space-y-6">
          <QuickActions userRole={session?.user?.role} />
          <PendingApprovals leaveRequests={pendingLeaveRequests} />
        </div>
      </div>
    </div>
  );
}

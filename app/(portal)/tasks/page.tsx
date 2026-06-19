import type { Metadata } from "next";
import { CheckSquare, Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Tasks" };

const priorityConfig: Record<string, { label: string; variant: "default" | "secondary" | "warning" | "info" | "destructive" | "outline" }> = {
  LOW: { label: "Low", variant: "secondary" },
  MEDIUM: { label: "Medium", variant: "info" },
  HIGH: { label: "High", variant: "warning" },
  URGENT: { label: "Urgent", variant: "destructive" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  TODO: { label: "To Do", color: "text-gray-500" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-600" },
  REVIEW: { label: "Review", color: "text-yellow-600" },
  DONE: { label: "Done", color: "text-emerald-600" },
  CANCELLED: { label: "Cancelled", color: "text-red-500" },
};

export default async function TasksPage() {
  const session = await auth();

  const tasks = await db.task.findMany({
    where: {
      status: { notIn: ["DONE", "CANCELLED"] },
      OR: [
        { assigneeId: session?.user?.id },
        { creatorId: session?.user?.id },
      ],
    },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    include: {
      project: { select: { name: true, code: true } },
      assignee: { select: { name: true, image: true } },
      creator: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">{tasks.length} open tasks</p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">
            <Plus className="h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckSquare className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No open tasks</h3>
            <p className="mt-1 text-sm text-gray-500">All caught up! Create a new task or check completed tasks.</p>
            <Button className="mt-4" asChild>
              <Link href="/tasks/new">
                <Plus className="h-4 w-4" />
                New Task
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const priority = priorityConfig[task.priority] ?? { label: task.priority, variant: "secondary" as const };
            const status = statusConfig[task.status] ?? { label: task.status, color: "text-gray-500" };
            return (
              <Card key={task.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                      <Badge variant={priority.variant}>{priority.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      <span className={status.color}>{status.label}</span>
                      {task.project && (
                        <span className="font-mono">{task.project.code}</span>
                      )}
                      {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
                    </div>
                  </div>
                  {task.assignee && (
                    <Avatar
                      src={task.assignee.image}
                      fallback={task.assignee.name ?? "?"}
                      size="sm"
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

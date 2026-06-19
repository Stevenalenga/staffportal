import type { Metadata } from "next";
import { FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "warning" | "info" | "destructive" | "outline" }> = {
  PLANNING: { label: "Planning", variant: "secondary" },
  ACTIVE: { label: "Active", variant: "default" },
  ON_HOLD: { label: "On Hold", variant: "warning" },
  COMPLETED: { label: "Completed", variant: "info" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true, tasks: true, milestones: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">{projects.length} projects</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first project to track work and milestones.</p>
            <Button className="mt-4" asChild>
              <Link href="/projects/new">
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const status = statusConfig[project.status] ?? { label: project.status, variant: "secondary" as const };
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{project.name}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{project.code}</p>
                      </div>
                      <Badge variant={status.variant} className="shrink-0">{status.label}</Badge>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-3">
                        {project.description}
                      </p>
                    )}
                    {project.funder && (
                      <p className="text-xs text-gray-500 mb-2">Funder: {project.funder}</p>
                    )}
                    <div className="flex gap-3 text-xs text-gray-500 border-t border-gray-100 pt-3 mt-auto">
                      <span>{project._count.members} members</span>
                      <span>{project._count.tasks} tasks</span>
                      <span>{project._count.milestones} milestones</span>
                    </div>
                    {project.endDate && (
                      <p className="text-xs text-gray-400 mt-1">Due {formatDate(project.endDate)}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

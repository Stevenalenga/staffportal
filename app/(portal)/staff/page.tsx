import type { Metadata } from "next";
import { Users, UserPlus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRoleLabel } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = { title: "Staff" };

export default async function StaffPage() {
  const staff = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      department: { select: { name: true } },
      position: { select: { title: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Directory</h1>
          <p className="mt-1 text-sm text-gray-500">
            {staff.length} total employees
          </p>
        </div>
        <Button asChild>
          <Link href="/staff/new">
            <UserPlus className="h-4 w-4" />
            Add Staff Member
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search staff..."
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Staff Grid */}
      {staff.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No staff members yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add your first staff member to get started.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/staff/new">
                <UserPlus className="h-4 w-4" />
                Add Staff Member
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {staff.map((member) => (
            <Link key={member.id} href={`/staff/${member.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={member.image}
                      fallback={member.name ?? member.email}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {member.name ?? "No name"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                      {member.position && (
                        <p className="text-xs text-gray-600 mt-0.5 truncate">
                          {member.position.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">
                      {formatRoleLabel(member.role)}
                    </Badge>
                    {member.department && (
                      <Badge variant="outline">{member.department.name}</Badge>
                    )}
                    {member.employmentStatus !== "ACTIVE" && (
                      <Badge variant="destructive">
                        {member.employmentStatus}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

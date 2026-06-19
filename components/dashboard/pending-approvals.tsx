import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

type LeaveRequest = {
  id: string;
  type: string;
  startDate: Date;
  endDate: Date;
  days: number;
  user: {
    name: string | null;
    image: string | null;
    department: { name: string } | null;
  };
};

const leaveTypeLabels: Record<string, string> = {
  ANNUAL: "Annual",
  SICK: "Sick",
  MATERNITY: "Maternity",
  PATERNITY: "Paternity",
  COMPASSIONATE: "Compassionate",
  STUDY: "Study",
  UNPAID: "Unpaid",
};

export function PendingApprovals({
  leaveRequests,
}: {
  leaveRequests: LeaveRequest[];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4 text-yellow-600" />
            Pending Leave
          </CardTitle>
          <CardDescription className="text-xs">
            Awaiting approval
          </CardDescription>
        </div>
        {leaveRequests.length > 0 && (
          <Link
            href="/staff/leave"
            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {leaveRequests.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">
            No pending leave requests
          </p>
        ) : (
          <div className="space-y-3">
            {leaveRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-3">
                <Avatar
                  src={req.user.image}
                  fallback={req.user.name ?? "?"}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {req.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {req.user.department?.name} ·{" "}
                    {formatDate(req.startDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="warning">
                    {leaveTypeLabels[req.type] ?? req.type}
                  </Badge>
                  <span className="text-xs text-gray-500">{req.days}d</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

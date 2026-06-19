import Link from "next/link";
import {
  Plus,
  Receipt,
  UserPlus,
  Package,
  FolderPlus,
  CheckSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  color: string;
  roles?: string[];
}

const actions: QuickAction[] = [
  {
    label: "New Expense",
    href: "/expenses/new",
    icon: Receipt,
    color: "bg-orange-50 text-orange-700 hover:bg-orange-100",
  },
  {
    label: "Add Staff",
    href: "/staff/new",
    icon: UserPlus,
    color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    roles: ["CEO", "HUMAN_RESOURCES", "IT_ADMIN"],
  },
  {
    label: "Register Asset",
    href: "/assets/new",
    icon: Package,
    color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
    roles: ["CEO", "OPERATIONS", "IT_ADMIN"],
  },
  {
    label: "New Project",
    href: "/projects/new",
    icon: FolderPlus,
    color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    roles: ["CEO", "PROGRAMME_MANAGER", "OPERATIONS"],
  },
  {
    label: "Create Task",
    href: "/tasks/new",
    icon: CheckSquare,
    color: "bg-teal-50 text-teal-700 hover:bg-teal-100",
  },
];

export function QuickActions({ userRole }: { userRole?: string }) {
  const visible = actions.filter(
    (a) => !a.roles || !userRole || a.roles.includes(userRole)
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Plus className="h-4 w-4 text-emerald-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {visible.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center gap-2 rounded-lg p-3 text-center text-xs font-medium transition-colors ${action.color}`}
            >
              <action.icon className="h-5 w-5" />
              {action.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

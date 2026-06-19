import type { Metadata } from "next";
import { Settings, Shield, Bell, Database, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Settings" };

const ADMIN_ROLES = ["CEO", "IT_ADMIN", "OPERATIONS"];

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.role || !ADMIN_ROLES.includes(session.user.role)) {
    redirect("/dashboard");
  }

  const sections = [
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions.",
      icon: Users,
      color: "bg-blue-50 text-blue-700",
      href: "/settings/users",
    },
    {
      title: "Roles & Permissions",
      description: "Configure role-based access control for the portal.",
      icon: Shield,
      color: "bg-purple-50 text-purple-700",
      href: "/settings/roles",
    },
    {
      title: "Notifications",
      description: "Configure email and in-app notification settings.",
      icon: Bell,
      color: "bg-orange-50 text-orange-700",
      href: "/settings/notifications",
    },
    {
      title: "System",
      description: "Database, backup, and system configuration.",
      icon: Database,
      color: "bg-gray-50 text-gray-700",
      href: "/settings/system",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage portal configuration and system settings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${section.color} mb-1`}>
                <section.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{section.title}</CardTitle>
              <CardDescription className="text-xs">{section.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

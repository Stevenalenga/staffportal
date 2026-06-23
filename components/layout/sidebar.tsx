"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Settings,
  Building2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import React from "react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Staff",
    icon: Users,
    children: [
      { label: "All Staff", href: "/staff", icon: Users },
      { label: "Departments", href: "/staff/departments", icon: Building2 },
      { label: "Leave Requests", href: "/staff/leave", icon: CheckSquare },
    ],
  },
  {
    label: "Assets",
    icon: Package,
    children: [
      { label: "Asset Register", href: "/assets", icon: Package },
      { label: "Assignments", href: "/assets/assignments", icon: Users },
      { label: "Maintenance", href: "/assets/maintenance", icon: Settings },
    ],
  },
  {
    label: "Expenses",
    icon: Receipt,
    children: [
      { label: "My Expenses", href: "/expenses", icon: Receipt },
      { label: "Approvals", href: "/expenses/approvals", icon: CheckSquare },
      { label: "Categories", href: "/expenses/categories", icon: FolderKanban },
    ],
  },
  {
    label: "Projects",
    icon: FolderKanban,
    children: [
      { label: "All Projects", href: "/projects", icon: FolderKanban },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["CEO", "IT_ADMIN", "OPERATIONS"],
  },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = React.useState<string[]>([]);

  // Auto-expand active group
  React.useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some(
          (child) => child.href && pathname.startsWith(child.href)
        );
        if (isActive && !openGroups.includes(item.label)) {
          setOpenGroups((prev) => [...prev, item.label]);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const filteredItems = navItems.filter(
    (item) => !item.roles || !userRole || item.roles.includes(userRole)
  );

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-5">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Uthabiti Africa"
            className="h-8 w-auto object-contain"
          />
          <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Portal
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {filteredItems.map((item) => {
            if (item.children) {
              const isOpen = openGroups.includes(item.label);
              const isGroupActive = item.children.some(
                (child) => child.href && pathname.startsWith(child.href)
              );

              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isGroupActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isOpen && (
                    <ul className="mt-0.5 space-y-0.5 pl-4">
                      {item.children.map((child) => {
                        const isActive =
                          child.href && pathname === child.href;
                        return (
                          <li key={child.label}>
                            <Link
                              href={child.href!}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                isActive
                                  ? "bg-emerald-50 font-medium text-emerald-700"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              )}
                            >
                              <child.icon className="h-4 w-4 shrink-0" />
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            const isActive = item.href && pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-3 py-3">
        <p className="px-3 text-xs text-gray-400">© 2026 Uthabiti Africa</p>
      </div>
    </aside>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string,
  currency = "KES"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    CEO: "bg-purple-100 text-purple-800",
    OPERATIONS: "bg-blue-100 text-blue-800",
    FINANCE: "bg-green-100 text-green-800",
    HUMAN_RESOURCES: "bg-pink-100 text-pink-800",
    PROGRAMME_MANAGER: "bg-orange-100 text-orange-800",
    PROJECT_OFFICER: "bg-yellow-100 text-yellow-800",
    STAFF: "bg-gray-100 text-gray-800",
    CONSULTANT: "bg-teal-100 text-teal-800",
    IT_ADMIN: "bg-red-100 text-red-800",
  };
  return colors[role] ?? "bg-gray-100 text-gray-800";
}

export function formatRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    CEO: "CEO",
    OPERATIONS: "Operations",
    FINANCE: "Finance",
    HUMAN_RESOURCES: "Human Resources",
    PROGRAMME_MANAGER: "Programme Manager",
    PROJECT_OFFICER: "Project Officer",
    STAFF: "Staff",
    CONSULTANT: "Consultant",
    IT_ADMIN: "IT Administrator",
  };
  return labels[role] ?? role;
}

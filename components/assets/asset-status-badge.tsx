const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Available",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  ASSIGNED: {
    label: "Assigned",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  IN_MAINTENANCE: {
    label: "Maintenance",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  RETIRED: {
    label: "Retired",
    className: "bg-red-50 text-red-600 ring-red-600/20",
  },
  LOST: {
    label: "Lost",
    className: "bg-gray-100 text-gray-600 ring-gray-500/20",
  },
};

export function AssetStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600 ring-gray-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style.className}`}
    >
      {style.label}
    </span>
  );
}

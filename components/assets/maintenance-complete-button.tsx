"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  id: string;
  assetId: string;
}

export function MaintenanceCompleteButton({ id, assetId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const markComplete = async () => {
    if (!confirm("Mark this maintenance record as resolved? This will set the asset status back to Available.")) return;
    setLoading(true);
    await fetch("/api/assets/maintenance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, assetId, markCompleted: true }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={markComplete}
      disabled={loading}
      className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
      Resolve
    </button>
  );
}

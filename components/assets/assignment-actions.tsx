"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, UserMinus, UserPlus, Loader2, X } from "lucide-react";

interface Props {
  assetId: string;
  assetTag: string;
  assetName: string;
  currentHolder: string;
  status: string;
}

type ActionType = "assign" | "transfer" | "return" | null;

export function AssignmentActions({ assetId, assetTag, assetName, currentHolder, status }: Props) {
  const router = useRouter();
  const [action, setAction] = useState<ActionType>(null);
  const [staffName, setStaffName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAssigned = status === "ASSIGNED";
  const canAct = status !== "IN_MAINTENANCE" && status !== "RETIRED" && status !== "LOST";

  const openModal = (a: ActionType) => {
    setAction(a);
    setStaffName("");
    setNotes("");
    setError("");
  };

  const handleSubmit = async () => {
    if (action !== "return" && !staffName.trim()) {
      setError("Please enter the staff member's name.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/assets/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetId, staffName: staffName.trim(), notes: notes.trim(), action }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setAction(null);
    router.refresh();
  };

  if (!canAct) {
    return <span className="text-xs text-gray-400 italic">{status === "IN_MAINTENANCE" ? "In maintenance" : "Unavailable"}</span>;
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        {!isAssigned && (
          <button
            onClick={() => openModal("assign")}
            className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Assign
          </button>
        )}
        {isAssigned && (
          <>
            <button
              onClick={() => openModal("transfer")}
              className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Transfer
            </button>
            <button
              onClick={() => openModal("return")}
              className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
            >
              <UserMinus className="h-3.5 w-3.5" />
              Return
            </button>
          </>
        )}
      </div>

      {/* Modal */}
      {action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 capitalize">
                  {action === "return" ? "Return Asset" : action === "transfer" ? "Transfer Asset" : "Assign Asset"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {assetTag} — {assetName}
                </p>
              </div>
              <button onClick={() => setAction(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {action === "return" ? (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                  This will mark <strong>{assetTag}</strong> as returned
                  {currentHolder ? ` from ${currentHolder}` : ""} and set it to{" "}
                  <strong>Available</strong>.
                </div>
              ) : (
                <>
                  {action === "transfer" && currentHolder && (
                    <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600">
                      Currently held by: <strong>{currentHolder}</strong>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      {action === "transfer" ? "Transfer to (Staff Name) *" : "Assign to (Staff Name) *"}
                    </label>
                    <input
                      type="text"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setAction(null)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${
                  action === "return"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : action === "transfer"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-emerald-700 hover:bg-emerald-800"
                }`}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {action === "return" ? "Confirm Return" : action === "transfer" ? "Transfer Asset" : "Assign Asset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

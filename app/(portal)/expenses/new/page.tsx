import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { IrfClaimForm } from "@/components/expenses/irf-claim-form";

export const metadata: Metadata = { title: "New Expense Claim — IRF" };

export default async function NewExpensePage() {
  const session = await auth();

  const [projects] = await Promise.all([
    db.project.findMany({
      where: { status: { in: ["PLANNING", "ACTIVE"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
  ]);

  const requestedBy = session?.user?.name ?? session?.user?.email ?? "Staff Member";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/expenses"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to expenses
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">New Expense Claim</h1>
          <p className="mt-1 text-sm text-gray-500">
            Submit an Internal Request Form (IRF) expense claim
          </p>
        </div>
        <a
          href="/forms/irf-form.pdf"
          download="IRF-Form-Uthabiti-Africa.pdf"
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Download IRF Form (PDF)
        </a>
      </div>

      <IrfClaimForm requestedBy={requestedBy} projects={projects} />
    </div>
  );
}

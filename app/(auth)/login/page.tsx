import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Building2 } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="w-full max-w-md">
      {/* Logo & Title */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 shadow-lg">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Uthabiti Africa</h1>
        <p className="mt-1 text-sm text-gray-500">
          Staff Portal — Sign in to your account
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-xs text-gray-400">
        For access, contact the IT Administrator.
      </p>
    </div>
  );
}

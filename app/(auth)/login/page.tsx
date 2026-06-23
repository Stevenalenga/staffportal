import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="w-full max-w-md">
      {/* Logo & Title */}
      <div className="mb-8 flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Uthabiti Africa"
          className="mb-4 h-14 w-auto object-contain"
        />
        <p className="text-sm text-gray-500">
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

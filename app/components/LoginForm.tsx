// components/LoginForm.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
// Added ArrowLeft to imports
import { Eye, EyeClosed, ArrowLeft } from "lucide-react";
import { signIn, type SignInResponse, useSession } from "next-auth/react";

type FormState = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<
    string,
    string[] | string
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { data: session, status } = useSession();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    // Basic client-side validation
    if (!form.email || !form.password) {
      setErrors({ general: "Please provide both email and password." });
      setLoading(false);
      return;
    }

    try {
      // Use next-auth credentials provider
      const result = (await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      })) as SignInResponse | undefined;

      setLoading(false);

      const error =
        result?.error ?? (result?.ok === false ? "Login failed" : undefined);

      if (error) {
        setErrors({
          general: typeof error === "string" ? error : "Login failed",
        });
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (!session?.user) {
        setErrors({ general: "Unable to load user session." });
        return;
      }

      if (session.user.role === "admin") {
        router.push("/admin");
      } else if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ general: "Unexpected error. Please try again." });
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 animate-fade-in-up">
      {/* --- NEW: Back to Homepage Button --- */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Homepage
        </Link>
      </div>
      {/* ------------------------------------ */}

      {/* Header with icon */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-bounce-subtle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Welcome back</h1>
        <p className="text-gray-400">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* EMAIL */}
        <div className="group">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-indigo-300 mb-1.5"
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="block w-full bg-[#0A1530]/60 border border-white/10 text-gray-200 rounded-xl 
                focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                pl-10 pr-4 py-3 transition-all duration-300
                hover:border-white/20 placeholder-gray-500"
              placeholder="you@example.com"
              required
              autoComplete="username"
              aria-invalid={!!errors?.email}
              aria-describedby={errors?.email ? "email-error" : undefined}
            />
          </div>
          {errors?.email && (
            <p
              id="email-error"
              className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-fade-in"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {(errors.email as string) || JSON.stringify(errors.email)}
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="group">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-indigo-300 mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="block w-full bg-[#0A1530]/60 border border-white/10 text-gray-200 rounded-xl 
                focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                pl-10 pr-12 py-3 transition-all duration-300
                hover:border-white/20 placeholder-gray-500"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              aria-invalid={!!errors?.password}
              aria-describedby={errors?.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeClosed className="h-5 w-5" />
              )}
            </button>
          </div>

          {errors?.password && (
            <p
              id="password-error"
              className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-fade-in"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {(errors.password as string) || JSON.stringify(errors.password)}
            </p>
          )}
        </div>

        {/* FORGOT PASSWORD */}
        <div className="flex items-center justify-end">
          <Link
            href="/auth/forgot-pass"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* ERROR MESSAGE */}
        {errors?.general && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Invalid credentials. Please try again.
            </p>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 
            hover:from-indigo-500 hover:to-purple-500
            text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 
            hover:shadow-indigo-500/50 transition-all duration-300 
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 group"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>

        {/* SIGN UP LINK */}
        <p className="text-center text-gray-400 text-sm">
          Do not have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}

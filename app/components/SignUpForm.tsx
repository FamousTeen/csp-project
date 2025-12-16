// components/SignUpForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
// Added ArrowLeft to imports
import { Eye, EyeClosed, ArrowLeft } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export default function SignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<
    string,
    string[] | string
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(
          data.errors ?? { general: data.message ?? "Registration failed" }
        );
        setLoading(false);
        return;
      }

      // Optional: auto-login after register using NextAuth credentials provider
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      // signIn returns an object or undefined; check for error
      if (signInResult?.error) {
        // If auto-login fails, redirect to login page
        router.push("/login");
        return;
      }

      // successful auto-login -> redirect to home
      router.push("/");
    } catch (err) {
      setErrors({ general: "Unexpected error: " + (err as Error).message });
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
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gradient mb-2">
          Create Account
        </h1>
        <p className="text-gray-400">
          Join us and start booking amazing events
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* NAME */}
        <div className="group">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-indigo-300 mb-1.5"
          >
            Full Name
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="block w-full bg-[#0A1530]/60 border border-white/10 text-gray-200 rounded-xl 
                focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                pl-10 pr-4 py-3 transition-all duration-300
                hover:border-white/20 placeholder-gray-500"
              placeholder="John Doe"
              required
              autoFocus
              autoComplete="name"
            />
          </div>
          {errors?.name && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-fade-in">
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
              {(errors.name as string) || JSON.stringify(errors.name)}
            </p>
          )}
        </div>

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
            />
          </div>
          {errors?.email && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-fade-in">
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
              autoComplete="new-password"
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
            <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-fade-in">
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

        {/* CONFIRM PASSWORD */}
        <div className="group">
          <label
            htmlFor="password_confirmation"
            className="block text-sm font-medium text-indigo-300 mb-1.5"
          >
            Confirm Password
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              value={form.password_confirmation}
              onChange={handleChange}
              className="block w-full bg-[#0A1530]/60 border border-white/10 text-gray-200 rounded-xl 
                focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 
                pl-10 pr-12 py-3 transition-all duration-300
                hover:border-white/20 placeholder-gray-500"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors p-1"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeClosed className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors?.password_confirmation && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-1 animate-fade-in">
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
              {(errors.password_confirmation as string) ||
                JSON.stringify(errors.password_confirmation)}
            </p>
          )}
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
              {errors.general}
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
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
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

        {/* SIGN IN LINK */}
        <p className="text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

// components/Layout.tsx
// Repo reference (uploaded file): /mnt/data/cloud-tiket-konser-main.zip

"use client";

import React, { ReactNode, useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Layout({
  children,
  title = "Events",
}: {
  children: ReactNode;
  title?: string;
}) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if link is active
  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Event ticketing" />
      </Head>

      <div className="min-h-screen bg-linear-to-b from-[#0A0F29] via-[#0a1138] to-[#010314] text-white relative">
        {/* Animated Header */}
        <header 
          className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            scrolled 
              ? "py-3 bg-[#0A0F29]/80 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5" 
              : "py-6 bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
            {/* Logo */}
            <Link 
              href="/" 
              className="group flex items-center gap-2 text-xl font-bold text-white transition-all duration-300 hover:scale-105"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <span className="hidden sm:inline text-gradient">Cloud Tiket</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <NavLink href="/events" isActive={isActiveLink("/events")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Events
              </NavLink>

              <NavLink href="/tickets" isActive={isActiveLink("/tickets")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                Tickets
              </NavLink>

              {/* Conditionally render Login link or Profile avatar */}
              {!isAuthenticated ? (
                <Link 
                  href="/auth/login" 
                  className="ml-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 
                    text-white text-sm rounded-lg font-medium shadow-lg shadow-indigo-500/20 
                    hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300"
                >
                  Sign In
                </Link>
              ) : (
                <ProfileAvatar
                  name={session?.user?.name ?? undefined}
                  image={session?.user?.image ?? "/profile_icon.png"}
                  onClick={() => setShowLogoutModal(true)}
                />
              )}
            </nav>
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-20" />

        <main className="animate-fade-in">{children}</main>

        {/* Enhanced Footer */}
        <footer className="py-12 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <span className="font-bold text-lg">Cloud Tiket</span>
              </div>
              
              <div className="flex items-center gap-6">
                <Link href="/events" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                  Events
                </Link>
                <Link href="/tickets" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                  My Tickets
                </Link>
              </div>
              
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Cloud Tiket — All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        {/* Logout confirmation modal with animation */}
        {showLogoutModal && (
          <LogoutModal
            onCancel={() => setShowLogoutModal(false)}
            onConfirm={() => {
              sessionStorage.clear();
              signOut({
                callbackUrl: "/auth/login",
              });
            }}
            userName={session?.user?.name}
          />
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation Link Component                                                  */
/* -------------------------------------------------------------------------- */

function NavLink({ 
  href, 
  children, 
  isActive 
}: { 
  href: string; 
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link 
      href={href} 
      className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-300 ${
        isActive 
          ? "bg-indigo-500/20 text-indigo-300 font-medium" 
          : "text-gray-300 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Simple profile avatar button with accessible markup                       */
/* -------------------------------------------------------------------------- */

function ProfileAvatar({
  name,
  image,
  onClick,
}: {
  name?: string;
  image?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Open account menu"
      title={name ?? "Account"}
      className="relative inline-flex items-center justify-center w-10 h-10 ml-2 rounded-full 
        bg-gradient-to-br from-indigo-500/20 to-purple-500/20 
        hover:from-indigo-500/30 hover:to-purple-500/30 
        border border-white/10 hover:border-indigo-500/50 
        overflow-hidden transition-all duration-300 hover:scale-110 
        hover:shadow-lg hover:shadow-indigo-500/20"
    >
      <Image 
        src={image ?? "/profile_icon.png"} 
        alt={name ?? "Profile"} 
        className="w-full h-full object-cover" 
        width={128} 
        height={128} 
      />
      <span className="sr-only">Open account menu</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Logout confirmation modal component with animations                        */
/* -------------------------------------------------------------------------- */

function LogoutModal({
  onCancel,
  onConfirm,
  userName,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  userName?: string | null;
}) {
  // close modal on ESC or click outside
  const overlayRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onCancel();
  };

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      <div className="w-full max-w-sm bg-[#07102a]/95 border border-white/10 rounded-2xl p-6 shadow-2xl animate-scale-in">
        {/* Icon */}
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        
        <h3 id="logout-title" className="text-lg font-semibold text-white text-center">
          Sign out
        </h3>

        <p className="mt-2 text-sm text-gray-300 text-center">
          {userName ? (
            <>
              Are you sure you want to sign out, <span className="font-medium text-indigo-300">{userName}</span>?
            </>
          ) : (
            "Are you sure you want to sign out?"
          )}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-sm rounded-xl border border-white/10 
              transition-all duration-300 hover:scale-105"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-xl shadow-lg 
              shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-300 hover:scale-105"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

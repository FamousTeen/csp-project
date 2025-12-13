"use client";

import React, { ReactNode, useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

// ... Icons (Keep your existing icon components here) ...
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
);
const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><path d="m9 16 2 2 4-4" /></svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

export default function AdminLayout({
  children,
  title = "Admin Dashboard",
}: {
  children: ReactNode;
  title?: string;
}) {
  // 1. Get Session and Status
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // 2. Auth Protection Logic
  useEffect(() => {
    // Do nothing while loading
    if (status === "loading") return;

    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } 
    // If authenticated but role is NOT 'admin', redirect to home
    // We access 'role' safely using 'as any' or by extending types (see below)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if (session && (session.user as any).role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  // 3. Loading State (Prevents content flash)
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#010314] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-400 text-sm animate-pulse">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // 4. Return null if access is denied (while redirecting)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (status === "unauthenticated" || (session && (session.user as any).role !== "admin")) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{title} | Cloud Tiket Admin</title>
      </Head>

      {/* Main Container */}
      <div className="min-h-screen bg-[#010314] text-white flex relative overflow-hidden font-sans">
        
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* --- SIDEBAR NAVIGATION --- */}
        <aside 
          className={`
            fixed md:sticky top-0 left-0 h-screen z-30
            w-64 flex-shrink-0 
            bg-[#0A0F29] border-r border-white/10
            transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-white/5 bg-[#0a1138]/50">
              <Link href="/admin" className="text-xl font-bold text-white flex items-center gap-2">
                Cloud Tiket <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">ADMIN</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
              <AdminNavLink href="/admin" icon={<DashboardIcon />}>
                Dashboard
              </AdminNavLink>
              
              <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Management
              </div>
              
              <AdminNavLink href="/admin/events" icon={<TicketIcon />}>
                Events
              </AdminNavLink>
              
              <AdminNavLink href="/admin/users" icon={<UsersIcon />}>
                Users
              </AdminNavLink>
            </nav>

            {/* User Profile in Sidebar Footer */}
            <div className="p-4 border-t border-white/5 bg-[#0a1138]/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 border border-white/10">
                   <Image 
                     src={session?.user?.image ?? "/profile_icon.png"} 
                     alt="Admin" 
                     width={36} 
                     height={36} 
                     className="w-full h-full object-cover"
                   />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {session?.user?.name || "Admin User"}
                  </p>
                  <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="text-xs text-red-400 hover:text-red-300 truncate"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Top Header */}
          <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/5 bg-[#0A0F29]/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden p-2 text-gray-400 hover:text-white"
                onClick={() => setSidebarOpen(true)}
              >
                <MenuIcon />
              </button>
              <h1 className="text-lg font-semibold text-gray-100">{title}</h1>
            </div>
            <div className="flex items-center gap-4"></div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-[#010314] to-[#0A0F29]">
            <div className="max-w-6xl mx-auto">
               {children}
            </div>
          </main>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={() => {
            sessionStorage.clear();
            signOut({ callbackUrl: "/auth/login" });
          }}
          userName={session?.user?.name}
        />
      )}
    </>
  );
}

// ... Helper components (AdminNavLink, LogoutModal) remain unchanged ...
function AdminNavLink({ href, children, icon }: { href: string; children: ReactNode; icon: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/admin' && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive 
          ? "bg-indigo-600/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
        }
      `}
    >
      <span className={isActive ? "text-indigo-400" : "text-gray-500 group-hover:text-gray-300"}>
        {icon}
      </span>
      {children}
    </Link>
  );
}

function LogoutModal({ onCancel, onConfirm, userName }: { onCancel: () => void; onConfirm: () => void; userName?: string | null; }) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onCancel(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onCancel()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm bg-[#0A0F29] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white">Sign out</h3>
        <p className="mt-2 text-sm text-gray-400">
          {userName ? <>Leaving admin session for <span className="text-white">{userName}</span>?</> : "Are you sure you want to sign out?"}
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-sm rounded-lg text-gray-300">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-900/50 hover:bg-red-800/80 text-red-200 border border-red-800 text-sm rounded-lg">Sign out</button>
        </div>
      </div>
    </div>
  );
}
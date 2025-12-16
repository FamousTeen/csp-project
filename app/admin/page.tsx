// app/admin/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

// Types for dashboard data
interface DashboardStats {
  totalRevenue: number;
  ticketsSold: number;
  activeEvents: number;
  totalUsers: number;
  revenueGrowth: number;
  ticketsGrowth: number;
  usersGrowth: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  customerEmail: string;
  event: string;
  amount: number;
  qty: number;
  status: string;
  date: string;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  location: string;
  start_at: string;
  qty: number;
  price: number;
}

interface DailySales {
  day: string;
  amount: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    ticketsSold: 0,
    activeEvents: 0,
    totalUsers: 0,
    revenueGrowth: 0,
    ticketsGrowth: 0,
    usersGrowth: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"7" | "30">("7");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [ordersResult, eventsResult, usersResult] = await Promise.all([
        // Get all orders with concert info
        supabase
          .from("orders")
          .select(
            `
            id,
            total_price,
            status,
            qty,
            created_at,
            user_id,
            concerts (title)
          `
          )
          .order("created_at", { ascending: false }),

        // Get all published events
        supabase
          .from("concerts")
          .select("*")
          .eq("published", true)
          .order("start_at", { ascending: true }),

        // Get all users
        supabase
          .from("users")
          .select("id, name, email, created_at")
          .order("created_at", { ascending: false }),
      ]);

      const orders = ordersResult.data || [];
      const events = eventsResult.data || [];
      const users = usersResult.data || [];

      // Calculate date ranges
      const now = new Date();
      const daysAgo = parseInt(selectedPeriod);
      const periodStart = new Date(
        now.getTime() - daysAgo * 24 * 60 * 60 * 1000
      );
      const prevPeriodStart = new Date(
        periodStart.getTime() - daysAgo * 24 * 60 * 60 * 1000
      );

      // Filter orders by period
      const currentPeriodOrders = orders.filter(
        (o) => new Date(o.created_at) >= periodStart
      );
      const prevPeriodOrders = orders.filter(
        (o) =>
          new Date(o.created_at) >= prevPeriodStart &&
          new Date(o.created_at) < periodStart
      );

      // Calculate stats
      const currentRevenue = currentPeriodOrders
        .filter((o) => o.status === "success")
        .reduce((sum, o) => sum + (o.total_price || 0), 0);
      const prevRevenue = prevPeriodOrders
        .filter((o) => o.status === "success")
        .reduce((sum, o) => sum + (o.total_price || 0), 0);

      const currentTickets = currentPeriodOrders
        .filter((o) => o.status === "success")
        .reduce((sum, o) => sum + (o.qty || 0), 0);
      const prevTickets = prevPeriodOrders
        .filter((o) => o.status === "success")
        .reduce((sum, o) => sum + (o.qty || 0), 0);

      // Active events (events with start_at in the future)
      const activeEvents = events.filter(
        (e) => new Date(e.start_at) >= now
      ).length;

      // Users growth
      const currentPeriodUsers = users.filter(
        (u) => new Date(u.created_at) >= periodStart
      ).length;
      const prevPeriodUsers = users.filter(
        (u) =>
          new Date(u.created_at) >= prevPeriodStart &&
          new Date(u.created_at) < periodStart
      ).length;

      // Calculate growth percentages
      const revenueGrowth =
        prevRevenue > 0
          ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
          : currentRevenue > 0
          ? 100
          : 0;
      const ticketsGrowth =
        prevTickets > 0
          ? ((currentTickets - prevTickets) / prevTickets) * 100
          : currentTickets > 0
          ? 100
          : 0;
      const usersGrowth =
        prevPeriodUsers > 0
          ? ((currentPeriodUsers - prevPeriodUsers) / prevPeriodUsers) * 100
          : currentPeriodUsers > 0
          ? 100
          : 0;

      // Set stats
      setStats({
        totalRevenue: orders
          .filter((o) => o.status === "success")
          .reduce((sum, o) => sum + (o.total_price || 0), 0),
        ticketsSold: orders
          .filter((o) => o.status === "success")
          .reduce((sum, o) => sum + (o.qty || 0), 0),
        activeEvents,
        totalUsers: users.length,
        revenueGrowth,
        ticketsGrowth,
        usersGrowth,
      });

      // Format recent orders
      const formattedOrders: RecentOrder[] = orders
        .slice(0, 5)
        .map((order) => ({
          id: `#ORD-${order.id}`,
          customer: "Customer",
          customerEmail: "",
          event: Array.isArray(order.concerts)
            ? order.concerts[0]?.title || "Unknown Event"
            : (order.concerts as { title?: string })?.title || "Unknown Event",
          amount: order.total_price || 0,
          qty: order.qty || 0,
          status: order.status || "pending",
          date: new Date(order.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          }),
        }));
      setRecentOrders(formattedOrders);

      // Format recent users
      const formattedUsers: RecentUser[] = users.slice(0, 4).map((user) => ({
        id: user.id,
        name: user.name || "Anonymous",
        email: user.email || "",
        created_at: user.created_at,
      }));
      setRecentUsers(formattedUsers);

      // Upcoming events
      const upcomingEventsData: UpcomingEvent[] = events
        .filter((e) => new Date(e.start_at) >= now)
        .slice(0, 5)
        .map((e) => ({
          id: e.id,
          title: e.title,
          location: e.location,
          start_at: e.start_at,
          qty: e.qty,
          price: e.price,
        }));
      setUpcomingEvents(upcomingEventsData);

      // Calculate daily sales for chart
      const salesByDay: Record<string, number> = {};
      const dayLabels: string[] = [];

      for (let i = daysAgo - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split("T")[0];
        const dayLabel = date.toLocaleDateString("id-ID", { weekday: "short" });
        salesByDay[dateKey] = 0;
        dayLabels.push(dayLabel);
      }

      orders
        .filter(
          (o) => o.status === "success" && new Date(o.created_at) >= periodStart
        )
        .forEach((order) => {
          const dateKey = new Date(order.created_at)
            .toISOString()
            .split("T")[0];
          if (salesByDay[dateKey] !== undefined) {
            salesByDay[dateKey] += order.total_price || 0;
          }
        });

      const dailySalesData: DailySales[] = Object.entries(salesByDay).map(
        ([, amount], index) => ({
          day: dayLabels[index] || "",
          amount,
        })
      );
      setDailySales(dailySalesData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatGrowth = (value: number) => {
    if (value === 0) return "0%";
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Calculate max value for chart scaling
  const maxSales = Math.max(...dailySales.map((d) => d.amount), 1);

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Loading Overlay */}
      {/* {loading && (
        <div className="absolute inset-0 bg-[#010314]/80 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading dashboard...</p>
          </div>
        </div>
      )} */}

      {/* 1. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          trend={formatGrowth(stats.revenueGrowth)}
          trendUp={
            stats.revenueGrowth > 0
              ? true
              : stats.revenueGrowth < 0
              ? false
              : null
          }
          icon={<DollarIcon />}
          loading={loading}
        />
        <StatCard
          label="Tickets Sold"
          value={stats.ticketsSold.toLocaleString("id-ID")}
          trend={formatGrowth(stats.ticketsGrowth)}
          trendUp={
            stats.ticketsGrowth > 0
              ? true
              : stats.ticketsGrowth < 0
              ? false
              : null
          }
          icon={<TicketIcon />}
          loading={loading}
        />
        <StatCard
          label="Active Events"
          value={stats.activeEvents.toString()}
          trend="upcoming"
          trendUp={null}
          icon={<CalendarIcon />}
          loading={loading}
        />
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString("id-ID")}
          trend={formatGrowth(stats.usersGrowth)}
          trendUp={
            stats.usersGrowth > 0 ? true : stats.usersGrowth < 0 ? false : null
          }
          icon={<UserGroupIcon />}
          loading={loading}
        />
      </div>

      {/* 2. Main Content Split: Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Chart/Activity) - Spans 2 columns */}
        <div className="lg:col-span-2 bg-[#0A0F29]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Sales Overview</h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as "7" | "30")}
              className="bg-black/20 border border-white/10 text-xs text-gray-300 rounded px-3 py-1.5 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>

          {/* Bar Chart */}
          {/* Bar Chart */}
          <div className="h-64 w-full flex justify-between gap-1 px-2">
            {loading ? (
              // --- NEW: Chart Specific Loading State ---
              <div className="w-full h-full flex items-end justify-between gap-2 animate-pulse px-2">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-white/5 rounded-t-sm"
                    // Random heights for skeleton effect
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                ))}
              </div>
            ) : // -----------------------------------------
            dailySales.length > 0 ? (
              dailySales.map((data, i) => {
                const heightPercent =
                  maxSales > 0 ? (data.amount / maxSales) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2 group min-w-0 h-full justify-end"
                  >
                    <div className="relative w-full rounded-t-sm bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-all flex-1 flex items-end">
                      <div
                        style={{ height: `${Math.max(heightPercent, 2)}%` }}
                        className="w-full bg-gradient-to-t from-indigo-900 to-indigo-500 rounded-t-sm relative group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300"
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {formatCurrency(data.amount)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 truncate w-full text-center">
                      {data.day}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No sales data available
              </div>
            )}
          </div>

          {/* Chart Summary */}
          <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">Period Total</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(
                  dailySales.reduce((sum, d) => sum + d.amount, 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Daily Average</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(
                  dailySales.length > 0
                    ? Math.round(
                        dailySales.reduce((sum, d) => sum + d.amount, 0) /
                          dailySales.length
                      )
                    : 0
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Best Day</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(
                  Math.max(...dailySales.map((d) => d.amount), 0)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (Quick Actions & Recent) */}
        <div className="flex flex-col gap-6">
          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-900/30 relative overflow-hidden">
            {/* Decorative background shapes */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>

            <h3 className="text-lg font-bold relative z-10">
              Create New Event
            </h3>
            <p className="text-indigo-100 text-sm mt-1 mb-4 relative z-10">
              Launch a new concert or event in minutes.
            </p>
            <Link
              href="/admin/events/create"
              className="inline-flex items-center gap-2 relative z-10 bg-white text-indigo-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors group"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Event
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {/* New Members */}
          <div className="bg-[#0A0F29]/60 border border-white/5 rounded-2xl p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">New Members</h3>
              <Link
                href="/admin/users"
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                // Skeleton loader
                [...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 animate-pulse"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/10 rounded w-24" />
                      <div className="h-2 bg-white/5 rounded w-32" />
                    </div>
                  </div>
                ))
              ) : recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${
                          ["#EC4899", "#8B5CF6", "#3B82F6", "#10B981"][
                            index % 4
                          ]
                        }, ${
                          ["#F43F5E", "#7C3AED", "#2563EB", "#059669"][
                            index % 4
                          ]
                        })`,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">
                      {getTimeAgo(user.created_at)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent users
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Upcoming Events */}
      <div className="mt-8 bg-[#0A0F29]/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CalendarIcon />
            Upcoming Events
          </h3>
          <Link
            href="/admin/events"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Manage Events
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-16 h-16 bg-white/10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-48" />
                  <div className="h-3 bg-white/5 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="divide-y divide-white/5">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 hover:bg-white/5 transition-colors flex items-center gap-4"
              >
                {/* Date Box */}
                <div className="w-16 h-16 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-indigo-400">
                    {new Date(event.start_at).getDate()}
                  </span>
                  <span className="text-xs text-indigo-300 uppercase">
                    {new Date(event.start_at).toLocaleDateString("id-ID", {
                      month: "short",
                    })}
                  </span>
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">
                    {event.title}
                  </h4>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {event.location}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Tickets Left</p>
                    <p className="font-semibold text-white">{event.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="font-semibold text-indigo-400">
                      {formatCurrency(event.price)}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <Link
                  href={`/admin/events/${event.id}`}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 transition-colors"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-400">No upcoming events</p>
            <Link
              href="/admin/events/create"
              className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block"
            >
              Create your first event →
            </Link>
          </div>
        )}
      </div>

      {/* 4. Recent Transactions Table */}
      <div className="mt-8 bg-[#0A0F29]/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Recent Transactions
          </h3>
          <span className="text-sm text-gray-500">
            Last {recentOrders.length} orders
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 uppercase text-xs font-medium text-gray-300">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-white/10 rounded w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-white/10 rounded w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-white/10 rounded w-8" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-white/10 rounded w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-white/10 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-white/10 rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-indigo-300">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-white">{order.event}</td>
                    <td className="px-6 py-4 text-gray-300">{order.qty}</td>
                    <td className="px-6 py-4 text-white font-medium">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {order.date}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  trend,
  trendUp,
  icon,
  loading,
}: {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean | null;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="bg-[#0A0F29]/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{label}</p>
          {loading ? (
            <div className="h-8 w-28 bg-white/10 rounded mt-1 animate-pulse" />
          ) : (
            <h4 className="text-2xl font-bold text-white mt-1 group-hover:text-indigo-300 transition-colors">
              {value}
            </h4>
          )}
        </div>
        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        {loading ? (
          <div className="h-5 w-20 bg-white/5 rounded animate-pulse" />
        ) : (
          <>
            {trendUp === true && (
              <span className="text-green-400 font-medium bg-green-400/10 px-2 py-0.5 rounded mr-2">
                ↗ {trend}
              </span>
            )}
            {trendUp === false && (
              <span className="text-red-400 font-medium bg-red-400/10 px-2 py-0.5 rounded mr-2">
                ↘ {trend}
              </span>
            )}
            {trendUp === null && (
              <span className="text-gray-400 font-medium bg-gray-400/10 px-2 py-0.5 rounded mr-2">
                {trend}
              </span>
            )}
            <span className="text-gray-500">vs last period</span>
          </>
        )}
      </div>
    </div>
  );
}

function QuickStatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "green" | "blue" | "yellow" | "purple";
}) {
  const colorClasses = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div
      className={`${colorClasses[color]} border rounded-xl p-4 flex items-center gap-3`}
    >
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusLower = status.toLowerCase();
  if (statusLower === "success" || statusLower === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Success
      </span>
    );
  }
  if (statusLower === "pending" || statusLower === "processing") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        Pending
      </span>
    );
  }
  if (statusLower === "failed" || statusLower === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Failed
      </span>
    );
  }
  return <span className="text-gray-400 text-xs">{status}</span>;
}

// Icons
const DollarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const TicketIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const UserGroupIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

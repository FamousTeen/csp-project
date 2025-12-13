// app/admin/page.tsx
"use client";

import React from "react";
import AdminLayout from "../components/AdminLayout";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard Overview">
      {/* 1. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total Revenue" 
          value="Rp 124.500.000" 
          trend="+12.5%" 
          trendUp={true} 
          icon={<DollarIcon />}
        />
        <StatCard 
          label="Tickets Sold" 
          value="1,240" 
          trend="+8.2%" 
          trendUp={true} 
          icon={<TicketIcon />}
        />
        <StatCard 
          label="Active Events" 
          value="12" 
          trend="0%" 
          trendUp={null} 
          icon={<CalendarIcon />}
        />
        <StatCard 
          label="New Users" 
          value="84" 
          trend="+22%" 
          trendUp={true} 
          icon={<UserGroupIcon />}
        />
      </div>

      {/* 2. Main Content Split: Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Chart/Activity) - Spans 2 columns */}
        <div className="lg:col-span-2 bg-[#0A0F29]/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Sales Overview</h3>
            <select className="bg-black/20 border border-white/10 text-xs text-gray-300 rounded px-2 py-1 outline-none focus:border-indigo-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          {/* Mock CSS Bar Chart */}
          <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
            {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full rounded-t-sm bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-all h-full flex items-end">
                   <div 
                    style={{ height: `${height}%` }} 
                    className="w-full bg-gradient-to-t from-indigo-900 to-indigo-500 rounded-t-sm relative group-hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300"
                   >
                     {/* Tooltip */}
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                       {height * 10}
                     </div>
                   </div>
                </div>
                <span className="text-xs text-gray-500">Day {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Quick Actions & Recent) */}
        <div className="flex flex-col gap-8">
           {/* Quick Actions Card */}
           <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-900/20 relative overflow-hidden">
             {/* Decorative background shape */}
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             
             <h3 className="text-lg font-bold relative z-10">Create New Event</h3>
             <p className="text-indigo-100 text-sm mt-1 mb-4 relative z-10">Launch a new concert or webinar in minutes.</p>
             <Link href="/admin/events/create" className="inline-block relative z-10 bg-white text-indigo-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
               + Create Event
             </Link>
           </div>

           {/* Recent Signups */}
           <div className="bg-[#0A0F29]/60 border border-white/5 rounded-2xl p-6 flex-1">
             <h3 className="text-lg font-semibold text-white mb-4">New Members</h3>
             <div className="space-y-4">
               {[1,2,3].map((u) => (
                 <div key={u} className="flex items-center gap-3 pb-3 border-b border-white/5 last:border-0">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xs font-bold">
                     U{u}
                   </div>
                   <div className="flex-1">
                     <p className="text-sm font-medium text-gray-200">New User {u}</p>
                     <p className="text-xs text-gray-500">user{u}@example.com</p>
                   </div>
                   <span className="text-xs text-gray-500">2m ago</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      {/* 3. Recent Transactions Table */}
      <div className="mt-8 bg-[#0A0F29]/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <Link href="/admin/transactions" className="text-sm text-indigo-400 hover:text-indigo-300">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 uppercase text-xs font-medium text-gray-300">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-indigo-300">{order.id}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white">
                      {order.customer.charAt(0)}
                    </div>
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-white">{order.event}</td>
                  <td className="px-6 py-4 text-white">{order.amount}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Components & Mock Data                                                     */
/* -------------------------------------------------------------------------- */

const recentOrders = [
  { id: "#ORD-7782", customer: "Alex Morgan", event: "Jazz Night 2024", amount: "Rp 150.000", status: "Completed", date: "Oct 24" },
  { id: "#ORD-7781", customer: "Sarah Connor", event: "Tech Conference", amount: "Rp 750.000", status: "Processing", date: "Oct 24" },
  { id: "#ORD-7780", customer: "James Bond", event: "VIP Gala", amount: "Rp 2.500.000", status: "Completed", date: "Oct 23" },
  { id: "#ORD-7779", customer: "Ethan Hunt", event: "Jazz Night 2024", amount: "Rp 150.000", status: "Failed", date: "Oct 23" },
];

function StatCard({ label, value, trend, trendUp, icon }: { label: string, value: string, trend: string, trendUp: boolean | null, icon: React.ReactNode }) {
  return (
    <div className="bg-[#0A0F29]/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{label}</p>
          <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
        </div>
        <div className="p-2 bg-white/5 rounded-lg text-indigo-300">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        {trendUp === true && <span className="text-green-400 font-medium bg-green-400/10 px-1.5 py-0.5 rounded mr-2">↗ {trend}</span>}
        {trendUp === false && <span className="text-red-400 font-medium bg-red-400/10 px-1.5 py-0.5 rounded mr-2">↘ {trend}</span>}
        {trendUp === null && <span className="text-gray-400 font-medium bg-gray-400/10 px-1.5 py-0.5 rounded mr-2">- {trend}</span>}
        <span className="text-gray-500">vs last month</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Completed") return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Success</span>;
  if (status === "Processing") return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pending</span>;
  if (status === "Failed") return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Failed</span>;
  return <span className="text-gray-400">{status}</span>;
}

// Icons
const DollarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TicketIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UserGroupIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
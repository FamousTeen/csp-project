"use client";

import AdminLayout from "@/app/components/AdminLayout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "./../../lib/supabaseClient";
import { Concert } from "./../../types/concert";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Concert[]>([]);
  // 1. Initial state is already true, so we don't need to set it again immediately
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Define the function INSIDE the useEffect
    const fetchData = async () => {
      // 3. Removed setLoading(true) - it's already true by default!

      const { data, error } = await supabase
        .from("concerts")
        .select("*")
        .order("start_at", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setEvents(data || []);
      }

      // 4. Set loading to false when done
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const { error } = await supabase.from("concerts").delete().eq("id", id);
    if (!error) {
      // Remove from UI immediately without refetching
      setEvents(events.filter((e) => e.id !== id));
    } else {
      alert("Error deleting event");
    }
  };

  return (
    <AdminLayout title="Events Management">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-sm text-gray-400">
            Manage your concerts and ticket availability.
          </p>
        </div>
        <Link
          href="/admin/events/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          + Create New Event
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-[#0A0F29]/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            {/* Table Header */}
            <thead className="bg-white/5 uppercase text-xs font-medium text-gray-300">
              <tr>
                <th className="px-6 py-4">Event Details</th>
                <th className="px-6 py-4">Start</th>
                <th className="px-6 py-4">End</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-white/5">
              {loading ? (
                // Loading State
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-500">Loading events...</span>
                    </div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                // Empty State
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No events found. Start by creating one!
                  </td>
                </tr>
              ) : (
                // Data Rows
                events.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                            {event.title}
                          </p>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              event.published
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            }`}
                          >
                            {event.published ? "PUBLISHED" : "DRAFT"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex flex-col">
                        <span>
                          {new Date(event.start_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.start_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                     <td className="px-6 py-4 text-gray-300">
                      <div className="flex flex-col">
                        <span>
                          {new Date(event.end_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.end_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-300">
                      {event.location}
                    </td>

                     <td className="px-6 py-4 text-gray-300">
                      {event.qty}
                    </td>

                    <td className="px-6 py-4 text-white font-medium">
                      Rp {event.price.toLocaleString("id-ID")}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="text-indigo-400 hover:text-indigo-300 font-medium text-xs transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-400 hover:text-red-300 font-medium text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "./../components/Layout";
import { supabase } from "../lib/supabaseClient";
import { Order } from "../types/order";
import { useRouter } from "next/navigation";
import {
  FadeIn,
  HoverCard,
  Skeleton,
  GradientText,
  PageTransition,
  PulseDot,
} from "./../components/Animations";

export default function TicketsPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace(`/auth/login?redirect=/tickets`);
        return;
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;

    const fetchOrders = async () => {
      // 1. Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
            id,
            total_price,
            status,
            qty,
            created_at,
            concerts (
              title,
              location,
              start_at
            )
            // If you want to show the category name (VIP/Regular), add this:
            // ticket_categories (
            //   name
            // )
          `
        )
        .eq("user_id", user.id) // <--- THIS WAS MISSING
        .order("created_at", { ascending: false }); // <--- Good practice: Show newest first

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted: Order[] = data.map((item: any) => {
        const concert = Array.isArray(item.concerts) ? item.concerts[0] : null;

        return {
          id: item.id,
          total_price: item.total_price,
          status: item.status,
          qty: item.qty ?? 0,
          created_at: item.created_at,
          concerts: {
            title: concert?.title ?? "",
            location: concert?.location ?? "",
            start_at: concert?.start_at ?? "",
          },
        };
      });

      setOrders(formatted);
      setLoading(false);
    };

    fetchOrders();
  }, [authChecked]);

  if (!authChecked) {
    return (
      <Layout title="checking-auth">
        <div className="min-h-screen flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-300">Checking authentication...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Skeleton loader for tickets
  const TicketSkeleton = () => (
    <div className="bg-[#0F1F45]/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg mb-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-12 w-36 rounded-xl" />
      </div>
    </div>
  );

  return (
    <Layout title="my-tickets">
      <PageTransition>
        <div className="min-h-screen bg-linear-to-b from-[#0A0F29] via-[#0a1138] to-[#010314] text-white py-16 px-6">
          <div className="max-w-5xl my-4 mx-auto">
            {/* Header */}
            <FadeIn animation="fade-in-down">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    <GradientText>My Tickets</GradientText>
                  </h1>
                  <p className="text-gray-400">
                    View and manage your event tickets
                  </p>
                </div>
                <Link
                  href="/events"
                  className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 
                    border border-indigo-400/50 text-indigo-300 rounded-xl
                    hover:bg-indigo-600 hover:border-indigo-600 hover:text-white 
                    transition-all duration-300 group"
                >
                  Browse Events
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 group-hover:translate-x-1 transition-transform"
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
                </Link>
              </div>
            </FadeIn>

            {loading && (
              <div>
                {[1, 2, 3].map((i) => (
                  <TicketSkeleton key={i} />
                ))}
              </div>
            )}

            {!loading && orders.length > 0 && (
              <>
                {/* Ticket count */}
                <FadeIn animation="fade-in">
                  <p className="text-gray-400 mb-6">
                    You have {orders.length} ticket order
                    {orders.length !== 1 ? "s" : ""}
                  </p>
                </FadeIn>

                {orders.map((order, index) => {
                  // Check if event has passed
                  const eventDate = order.concerts?.start_at
                    ? new Date(order.concerts.start_at)
                    : null;
                  const hasEventPassed = eventDate
                    ? eventDate < new Date()
                    : false;

                  return (
                    <FadeIn
                      key={order.id}
                      animation="fade-in-up"
                      delay={index * 100}
                    >
                      <HoverCard
                        className="ticket-card bg-[#0F1F45]/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg mb-6"
                        glowOnHover
                      >
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div className="flex-1">
                            {/* Order ID with status indicator */}
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <div className="text-lg font-semibold text-indigo-300">
                                Order #{order.id}
                              </div>
                              <div className="flex items-center gap-2 px-2.5 py-1 bg-green-500/10 rounded-full">
                                <PulseDot color="green" className="scale-75" />
                                <span className="text-xs text-green-400 capitalize">
                                  {order.status}
                                </span>
                              </div>
                              {/* Event status badge */}
                              {hasEventPassed && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-500/20 rounded-full">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <span className="text-xs text-gray-400">
                                    Event Selesai
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Event title */}
                            {order.concerts?.title && (
                              <div className="text-white font-medium mb-2">
                                {order.concerts.title}
                              </div>
                            )}

                            {/* Order details */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1.5">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-indigo-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                  />
                                </svg>
                                <span>
                                  {order.qty} ticket{order.qty !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-indigo-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>
                                  Rp {order.total_price.toLocaleString("id-ID")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-indigo-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>
                                  {new Date(order.created_at).toLocaleString(
                                    "id-ID",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="min-w-[150px]">
                            <Link
                              href={`/tickets/${order.id}`}
                              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl 
                              font-semibold border border-indigo-400/50 text-indigo-300 
                              hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 
                              hover:border-transparent hover:text-white 
                              transition-all duration-300 group"
                            >
                              View Ticket
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 group-hover:translate-x-1 transition-transform"
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
                            </Link>
                          </div>
                        </div>
                      </HoverCard>
                    </FadeIn>
                  );
                })}
              </>
            )}

            {!loading && orders.length === 0 && (
              <FadeIn animation="scale-in">
                <div className="glass-card p-12 rounded-2xl text-center">
                  <div className="text-6xl mb-4">🎟️</div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">
                    No tickets yet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    You have not purchased any tickets. Start exploring events
                    and get your first ticket!
                  </p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 px-6 py-3 
                      bg-gradient-to-r from-indigo-600 to-purple-600 
                      text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 
                      hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 group"
                  >
                    Browse Events
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
                  </Link>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
}

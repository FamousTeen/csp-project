"use client";

import { useEffect, useState, use } from "react";
import Layout from "../../components/Layout";
import { supabase } from "../../lib/supabaseClient";
import Image from "next/image";
import { Concert } from "../../types/concert";
import { useRouter } from "next/navigation";

type EventParams = {
  id: string;
};

export default function EventDetailPage({
  params,
}: {
  params: Promise<EventParams>;
}) {
  const { id } = use<EventParams>(params);
  const [event, setEvent] = useState<Concert>();
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      console.log("=== SESSION CHECK ===");
      console.log(res.data.session);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("concerts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setEvent(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // Check if event has already started or ended
  const isEventStarted = event ? new Date(event.start_at) <= new Date() : false;
  const isEventEnded = event ? new Date(event.end_at) <= new Date() : false;
  const isEventAvailable = event ? !isEventStarted && !isEventEnded && event.qty > 0 && event.published : false;

  const handleCheckout = async () => {
    if (!event) return;

    // Check if event has already started
    if (new Date(event.start_at) <= new Date()) {
      alert("Sorry , this event has already started. Ticket sales are closed.");
      return;
    }

    // Check if event has ended
    if (new Date(event.end_at) <= new Date()) {
      alert("Sorry, this event has ended.");
      return;
    }

    // Check stock availability
    if (event.qty <= 0) {
      alert("Sorry, tickets for this event are sold out.");
      return;

    }

    if (qty <= 0) {
      alert("Please select at least one ticket to proceed.");
      return;
    }

    if (qty > event.qty) {
      alert(`Only ${event.qty} tickets are left.`);
      return;
    }

    // Check authentication when checking out
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/auth/login?redirect=/events/${id}`);
      return;
    }

    // Show confirmation modal
    setShowModal(true);
  };

  const confirmCheckout = async () => {
    setShowModal(false);
    await createOrder();
  };

  const createOrder = async () => {
    if (!event) return;

    const total = qty * event.price;

    const {
      data: { session },
    } = await supabase. auth.getSession();

    if (!session?.user?.id) {
      alert("User tidak ditemukan. Silakan login ulang.");
      return;
    }

    const userId = session.user.id;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        concert_id: event.id,
        qty,
        total_price: total,
        status:  "success",
      })
      .select()
      .single();

    if (error) {
      console.error("ORDER ERROR:", error);
      alert("Gagal membuat order.");
      return;
    }

    await supabase
      .from("concerts")
      .update({ qty: event.qty - qty })
      .eq("id", event.id);

    router.push(`/tickets/${order.id}`);
  };

  const incrementQty = () => {
    if (event && qty < event.qty) {
      setQty(qty + 1);
    }
  };

  const decrementQty = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  if (loading) {
    return (
      <Layout title="loading">
        <div className="min-h-screen flex justify-center items-center text-gray-300">
          Loading event details...
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout title="not-found">
        <div className="min-h-screen flex justify-center items-center text-red-400">
          Event not found. 
        </div>
      </Layout>
    );
  }

  // Check event status for display
  const eventStartDate = new Date(event.start_at);
  const eventEndDate = new Date(event.end_at);
  const now = new Date();
  const hasStarted = eventStartDate <= now;
  const hasEnded = eventEndDate <= now;
  const isSoldOut = event.qty <= 0;

  const imageSrc = event. image?.startsWith("http")
    ? event.image
    :  "/" + event.image;

  return (
    <Layout title={event.title}>
      <div className="min-h-screen text-white">
        {/* Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#101935] border border-indigo-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                Confirm Your Order
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Event: </span>
                  <span className="text-white font-medium">{event.title}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Quantity:</span>
                  <span className="text-white font-medium">
                    {qty} ticket(s)
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Price per ticket:</span>
                  <span className="text-white font-medium">
                    Rp {event.price.toLocaleString("id-ID")}
                  </span>
                </div>
                <hr className="border-indigo-500/20" />
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-200">Total:</span>
                  <span className="text-indigo-400">
                    Rp {(qty * event.price).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-6">
                Are you sure you want to proceed with this purchase?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckout}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="relative bg-linear-to-b from-[#0A0F29] via-[#0a1138] to-[#010314] py-20 px-6 shadow-lg">
          <div className="max-w-4xl mx-auto text-center">
            {event.image && (
              <div className="relative w-full h-100 mb-10 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={imageSrc}
                  alt={event. title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <h1 className="text-4xl md: text-5xl font-extrabold">
              {event.title}
            </h1>

            <p className="mt-5 text-gray-300 text-lg max-w-2xl mx-auto">
              {event.description}
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg mx-auto">
              <div className="bg-[#0F1530]/60 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-4 flex items-center space-x-3">
                <div className="text-indigo-400 text-sm font-semibold">
                  Date
                </div>
                <div className="flex-1 text-gray-200">
                  {new Date(event. start_at).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="bg-[#0F1530]/60 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-4 flex items-center space-x-3">
                <div className="text-indigo-400 text-sm font-semibold">
                  Venue
                </div>
                <div className="flex-1 text-gray-200">{event. location}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#050718] px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Available Ticket</h2>

            {/* Event Status Banner */}
            {(hasEnded || hasStarted || isSoldOut) && (
              <div className={`mb-6 p-4 rounded-xl border ${
                hasEnded 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : hasStarted 
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-orange-500/10 border-orange-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    hasEnded 
                      ? 'bg-red-500/20' 
                      : hasStarted 
                        ? 'bg-yellow-500/20'
                        : 'bg-orange-500/20'
                  }`}>
                    {hasEnded ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : hasStarted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      hasEnded ? 'text-red-400' : hasStarted ? 'text-yellow-400' : 'text-orange-400'
                    }`}>
                      {hasEnded 
                        ? 'Event Has Ended' 
                        : hasStarted 
                          ? 'Event Has Started'
                          : 'Tickets Sold Out'}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {hasEnded 
                        ? 'Event Has Ended. Thank You For Your Interest!'
                        : hasStarted 
                          ? 'Ticket sales have been closed because the event has started.'
                          : 'All tickets for this event have been sold out.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={`bg-gradient-to-br from-[#101935] to-[#0a1128] rounded-2xl p-6 border border-indigo-500/20 shadow-lg ${
              (hasEnded || hasStarted || isSoldOut) ? 'opacity-60' : ''
            }`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Ticket Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-indigo-400"
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
                    </div>
                    <h4 className="text-xl font-semibold text-white">
                     Ticket
                    </h4>
                  </div>
                  <p className="text-2xl font-bold text-indigo-400">
                    Rp {event.price.toLocaleString("id-ID")}
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      / ticket
                    </span>
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full">
                    <span className={`w-2 h-2 rounded-full ${
                      hasEnded || hasStarted || isSoldOut 
                        ? 'bg-red-400' 
                        : 'bg-green-400 animate-pulse'
                    }`}></span>
                    <span className="text-xs text-gray-300">
                      {hasEnded 
                        ? 'Event ended' 
                        : hasStarted 
                          ? 'Event started' 
                          : isSoldOut 
                            ? 'Sold out'
                            : `${event.qty} tickets available`}
                    </span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-sm text-gray-400 font-medium">
                    Select Quantity
                  </span>
                  <div className="flex items-center gap-1 bg-[#0C1128] rounded-2xl p-1. 5 border border-indigo-500/20">
                    <button
                      onClick={decrementQty}
                      disabled={qty <= 1 || hasEnded || hasStarted || isSoldOut}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-indigo-500/25"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>

                    <div className="w-20 h-12 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white tabular-nums">
                        {qty}
                      </span>
                    </div>

                    <button
                      onClick={incrementQty}
                      disabled={qty >= event.qty || hasEnded || hasStarted || isSoldOut}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled: from-gray-700 disabled: to-gray-800 disabled: cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover: shadow-indigo-500/25"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex flex-col items-end gap-1 min-w-[140px]">
                  <span className="text-sm text-gray-400">Subtotal</span>
                  <span className="text-2xl font-bold text-white">
                    Rp {(qty * event.price).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                onClick={handleCheckout}
                disabled={hasEnded || hasStarted || isSoldOut}
                className={`group relative px-8 py-4 font-semibold rounded-xl shadow-lg transition-all duration-300 w-full md:w-auto overflow-hidden ${
                  hasEnded || hasStarted || isSoldOut
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {hasEnded 
                    ? 'Event Ended'
                    : hasStarted 
                      ? 'Event Has Started'
                      : isSoldOut 
                        ? 'Tickets Sold Out'
                        : 'Proceed to Payment'}
                  {!hasEnded && !hasStarted && !isSoldOut && (
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
                  )}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
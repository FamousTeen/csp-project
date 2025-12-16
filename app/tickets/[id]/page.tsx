"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Layout from "../../components/Layout";
import { supabase } from "../../lib/supabaseClient";
import { useParams } from "next/navigation";
import { Order } from "../../types/order";
import Link from "next/link";
import { FadeIn, GradientText, PageTransition } from "../../components/Animations";

export default function TicketDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function loadOrder() {
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
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Load order error:", error);
      setLoading(false);
      return;
    }

    console.log("DATA SUPABASE:", data);

    const rawConcert = Array.isArray(data.concerts) ? data.concerts[0] : data.concerts;
    const concert = rawConcert ?? {
      title: "",
      location: "",
      start_at: "",
    };

    const formatted: Order = {
      id: data.id,
      total_price: data.total_price,
      status: data.status,
      qty: data.qty,
      created_at: data.created_at,
      concerts: {
        title: concert?.title ?? "",
        location: concert?.location ?? "",
        start_at: concert?.start_at ?? "",
      },
    };

    setOrder(formatted);
    setLoading(false);
  }

  loadOrder();
}, [id]);


  if (loading) return (
    <Layout title="loading">
      <div className="min-h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300">Loading your ticket...</p>
        </div>
      </div>
    </Layout>
  );
  
  if (!order) return (
    <Layout title="not-found">
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-200 mb-2">Order not found</h2>
          <p className="text-gray-400 mb-6">The ticket you are looking for does not exist.</p>
          <Link 
            href="/tickets" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
          >
            Back to My Tickets
          </Link>
        </div>
      </div>
    </Layout>
  );

  const concert = order.concerts;

  // Check if event has passed
  const eventDate = concert.start_at ? new Date(concert.start_at) : null;
  const hasEventPassed = eventDate ? eventDate < new Date() : false;

  const items = [
    {
      ticket_type_name: "Basic Ticket",
      quantity: order.qty,
      event: {
        title: concert.title,
        venue: concert.location,
        date: concert.start_at,
      },
    },
  ];

  return (
    <Layout title="ticket-details">
      <PageTransition>
        <div className="min-h-screen bg-linear-to-b from-[#0A0F29] via-[#0a1138] to-[#010314] text-white py-16 px-6">
          <div className="max-w-4xl my-4 mx-auto">
            
            {/* Back button */}
            <FadeIn animation="fade-in-left">
              <Link 
                href="/tickets"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 group-hover:-translate-x-1 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to My Tickets
              </Link>
            </FadeIn>

            {/* Event Passed Notice */}
            {hasEventPassed && (
              <FadeIn animation="fade-in-down">
                <div className="mb-6 p-4 rounded-xl bg-gray-500/10 border border-gray-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-300">Event Has Ended</h4>
                      <p className="text-sm text-gray-500">This event has already taken place. Thank you for attending!</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            <FadeIn animation="fade-in-up">
              <h1 className="text-4xl font-bold mb-2">
                <GradientText>Ticket Order #{order.id}</GradientText>
              </h1>
              <p className="text-gray-400 mb-8">Your ticket details and QR code</p>
            </FadeIn>

            <FadeIn animation="fade-in-up" delay={100}>
              <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
                {/* Decorative gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left side - Order info */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Order Summary
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#0A1530]/60 rounded-xl border border-white/5">
                        <span className="text-gray-400">Total Amount</span>
                        <span className="text-xl font-bold text-gradient">
                          Rp {order.total_price.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#0A1530]/60 rounded-xl border border-white/5">
                        <span className="text-gray-400">Status</span>
                        <span className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-green-400 capitalize font-medium">{order.status}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#0A1530]/60 rounded-xl border border-white/5">
                        <span className="text-gray-400">Order Date</span>
                        <span className="text-gray-200">
                          {new Date(order.created_at).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      <h3 className="text-lg font-semibold text-indigo-300 mb-3">Event Details</h3>
                      <div className="space-y-2 text-gray-300">
                        <p className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                          </svg>
                          {items[0].event.title}
                        </p>
                        <p className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {items[0].event.venue}
                        </p>
                        <p className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(items[0].event.date).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side - QR Code */}
                  <div className="lg:w-80">
                    <div className="ticket-card p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold text-center mb-4">Your Ticket QR Code</h3>
                      <div className="bg-white p-4 rounded-xl flex justify-center">
                        <QRCodeSVG 
                          value={JSON.stringify({
                            order_id: order.id,
                            ticket_type: items[0].ticket_type_name,
                            quantity: items[0].quantity,
                            event: items[0].event.title,
                            venue: items[0].event.venue,
                            date: items[0].event.date,
                          })} 
                          size={200}
                          level="H"
                        />
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-400">
                          Show this QR code at the venue entrance
                        </p>
                        <div className="mt-3 flex items-center justify-center gap-2 text-indigo-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                          </svg>
                          <span className="font-medium">{order.qty} ticket{order.qty !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important info */}
                <div className="mt-8 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-1">Important Information</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Please arrive at least 30 minutes before the event starts</li>
                        <li>• Bring a valid ID that matches your booking details</li>
                        <li>• This QR code is your entry pass - do not share it</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </PageTransition>
    </Layout>
  );
}
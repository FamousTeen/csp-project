"use client";

import { useState } from "react";
import Layout from "./../../components/Layout";

export default function EventDetailPage({ params }: { params: { id: string } }) {
  
  // Dummy
  const event = {
    id: params.id,
    title: "Music Fest Jakarta",
    description: "A night full of music and entertainment!",
    start_at: "2025-03-12 19:00",
    venue: "Istora Senayan",
    price: 150000,
    stock: 100,
  };

  const [qty, setQty] = useState(0);

  const handleCheckout = () => {
    if (qty <= 0) {
      alert("Pilih jumlah tiket dulu.");
      return;
    }
  };

  return (
    <Layout title="home-page">
      <div className="min-h-screen text-white">

        <section className="relative bg-linear-to-b from-[#0A0F29] via-[#0a1138] to-[#010314] py-20 px-6 shadow-lg">
          <div className="max-w-4xl mx-auto text-center">

            <h1 className="text-4xl md:text-5xl font-extrabold">
              {event.title}
            </h1>

            <p className="mt-5 text-gray-300 text-lg max-w-2xl mx-auto">
              {event.description}
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg mx-auto">

              <div className="bg-[#0F1530]/60 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-4 flex items-center space-x-3">
                <div className="text-indigo-400 text-sm font-semibold">Date</div>
                <div className="flex-1 text-gray-200">
                  {new Date(event.start_at).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="bg-[#0F1530]/60 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-4 flex items-center space-x-3">
                <div className="text-indigo-400 text-sm font-semibold">Venue</div>
                <div className="flex-1 text-gray-200">{event.venue}</div>
              </div>

            </div>
          </div>
        </section>

        <section className="bg-[#050718] px-6 py-16">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-bold mb-6">Available Ticket</h2>

            <div className="bg-[#101935] rounded-2xl p-6 border border-indigo-500/20 shadow-lg">

              <div className="flex items-center justify-between">

                <div>
                  <h4 className="text-xl font-semibold text-white">Basic Ticket</h4>

                  <p className="mt-1 text-sm text-gray-300">
                    Rp {event.price.toLocaleString("id-ID")}
                    <span className="ml-2 text-xs text-indigo-300">
                      • Stock: {event.stock}
                    </span>
                  </p>
                </div>

                <div className="w-24">
                  <input
                    type="number"
                    min={0}
                    max={event.stock}
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value))}
                    className="w-full text-center bg-[#0C1128] border border-indigo-400/30 rounded-lg py-1 text-white"
                  />
                </div>

              </div>

            </div>


            <div className="mt-10">

              {/* nanti ganti Supabase auth */}
              <button
                onClick={handleCheckout}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition w-full md:w-auto"
              >
                Proceed to Payment →
              </button>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}

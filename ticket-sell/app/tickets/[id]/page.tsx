"use client";

import { QRCodeSVG } from "qrcode.react";
import Layout from "./../../components/Layout";

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  
    //Dummy
    const order = {
    id: params.id,
    total: 250000,
    status: "paid",
    date: "2025-03-10 14:22",
    items: [
      {
        ticket_type_name: "Basic Ticket",
        quantity: 2,
        event: {
          title: "Music Fest Jakarta",
          venue: "Istora Senayan",
          date: "2025-03-12 19:00"
        }
      }
    ]
  };

  return (
    <Layout title="home-page">
        <div className="min-h-screen bg-linear-to-b from-[#0A0F29] via-[#0a1138] to-[#010314] text-white py-16 px-6">
        <div className="max-w-4xl my-4 mx-auto">

            <h1 className="text-4xl font-bold mb-8">
            Ticket Order #{order.id}
            </h1>

            <div className="bg-[#0F1F45]/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-xl">

            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 text-gray-300">
                <p>
                <span className="font-semibold text-indigo-300">Total:</span>{" "}
                Rp {order.total.toLocaleString("id-ID")}
                </p>
                <p>
                <span className="font-semibold text-indigo-300">Status:</span>{" "}
                <span className="capitalize">{order.status}</span>
                </p>
                <p>
                <span className="font-semibold text-indigo-300">Date:</span>{" "}
                {order.date}
                </p>
            </div>

            <div className="mt-6 space-y-1 text-gray-300">
                <p>
                <span className="font-semibold text-indigo-300">Event:</span>{" "}
                {order.items[0].event.title}
                </p>
                <p>
                <span className="font-semibold text-indigo-300">Venue:</span>{" "}
                {order.items[0].event.venue}
                </p>
                <p>
                <span className="font-semibold text-indigo-300">Event Date:</span>{" "}
                {order.items[0].event.date}
                </p>
            </div>

            <hr className="my-6 border-white/10" />

            <h2 className="text-2xl font-semibold mb-4">Your Tickets</h2>

            {order.items.map((item, index) => {
                const ticketData = {
                order_id: order.id,
                ticket_type: item.ticket_type_name,
                quantity: item.quantity,
                event: item.event.title,
                venue: item.event.venue,
                date: item.event.date
                };

                return (
                <div
                    key={index}
                    className="bg-[#0A1530] p-6 rounded-xl border border-white/10 shadow-lg 
                    flex flex-col lg:flex-row lg:items-center gap-6 mb-6"
                >
                    <div className="flex justify-center items-center bg-[#0F1F45] p-4 rounded-xl border border-white/10">
                    <QRCodeSVG value={JSON.stringify(ticketData)} size={180} />
                    </div>

                    <div className="text-gray-300 space-y-1">
                    <p>
                        <span className="text-indigo-300 font-semibold">Ticket Type:</span>{" "}
                        {item.ticket_type_name}
                    </p>
                    <p>
                        <span className="text-indigo-300 font-semibold">Quantity:</span>{" "}
                        {item.quantity}
                    </p>
                    <p>
                        <span className="text-indigo-300 font-semibold">Event:</span>{" "}
                        {item.event.title}
                    </p>
                    <p>
                        <span className="text-indigo-300 font-semibold">Venue:</span>{" "}
                        {item.event.venue}
                    </p>
                    <p>
                        <span className="text-indigo-300 font-semibold">Date:</span>{" "}
                        {item.event.date}
                    </p>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
        </div>
    </Layout>
  );
}

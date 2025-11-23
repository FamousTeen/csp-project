import Image from "next/image";
import Link from "next/link";

export default function EventsPage() {
  const events = [
    {
      id: 1,
      image: "/banner1.jpg",
      min_price: 150000,
      max_price: 450000,
      title: "Music Fest Jakarta",
      start_at: "2025-03-12",
      venue: "Istora Senayan",
    },
    {
      id: 2,
      image: "/banner1.jpg",
      min_price: 100000,
      max_price: 250000,
      title: "Comedy Night Live",
      start_at: "2025-05-20",
      venue: "Balai Sarbini",
    },
    {
      id: 3,
      image: "/banner1.jpg",
      min_price: 50000,
      max_price: 150000,
      title: "Art Expo 2025",
      start_at: "2025-08-01",
      venue: "JCC",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-[#0A0F29] via-[#0a1138] to-[#010314] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto my-4">

        <h1 className="text-4xl font-bold mb-10">All Events</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map(event => (
            <div
              key={event.id}
              className="bg-[#0F1F45] rounded-2xl overflow-hidden shadow-lg border border-white/5"
            >
              <div className="relative w-full h-52">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-300">
                  Rp{event.min_price.toLocaleString()} – Rp{event.max_price.toLocaleString()}
                </p>

                <h2 className="text-xl font-semibold mt-2">{event.title}</h2>

                <p className="text-gray-400 text-sm mt-1">
                  {new Date(event.start_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  | {event.venue}
                </p>

                <Link
                  href={`/events/${event.id}`}
                  className="mt-5 block text-center py-3 border border-indigo-400 rounded-xl 
                             hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition"
                >
                  View Event →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

"use client";

import Layout from "./../components/Layout";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "./../lib/supabaseClient";
import { Concert } from "./../types/concert";
import { 
  FadeIn, 
  HoverCard, 
  EventCardSkeleton,
  GradientText,
  PageTransition 
} from "./../components/Animations";

export default function EventsPage() {
  const [events, setEvents] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("concerts")
        .select("*")
        .eq("published", true)
        .order("start_at", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setEvents(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filter events based on search term
  // Also separate upcoming vs past events
  const now = new Date();
  const filteredEvents = events
    .filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(event => ({
      ...event,
      isStarted: new Date(event.start_at) <= now,
      isEnded: new Date(event.end_at) <= now,
      isSoldOut: event.qty <= 0
    }))
    // Sort: upcoming first, then started, then ended
    .sort((a, b) => {
      if (a.isEnded !== b.isEnded) return a.isEnded ? 1 : -1;
      if (a.isStarted !== b.isStarted) return a.isStarted ? 1 : -1;
      return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
    });

  return (
    <Layout title="events-page">
      <PageTransition>
        <div className="min-h-screen bg-linear-to-b from-[#0A0F29] via-[#0a1138] to-[#010314] text-white py-16 px-6">
          <div className="max-w-6xl mx-auto my-4">
            
            {/* Header Section */}
            <FadeIn animation="fade-in-down">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  <GradientText>Discover Events</GradientText>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Find and book tickets for the most exciting concerts, festivals, and shows
                </p>
              </div>
            </FadeIn>

            {/* Search Bar */}
            <FadeIn animation="fade-in-up" delay={100}>
              <div className="mb-10">
                <div className="relative max-w-xl mx-auto">
                  <input
                    type="text"
                    placeholder="Search events by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-6 py-4 pl-14 bg-[#0F1F45]/60 backdrop-blur-xl border border-white/10 
                      rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 
                      focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                  />
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Results count */}
            {!loading && searchTerm && (
              <FadeIn animation="fade-in">
                <p className="text-gray-400 mb-6 text-center">
                  Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} 
                  {searchTerm && ` for "${searchTerm}"`}
                </p>
              </FadeIn>
            )}

            {loading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <FadeIn animation="scale-in">
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No events found</h3>
                  <p className="text-gray-400">
                    {searchTerm 
                      ? "Try adjusting your search terms" 
                      : "Check back later for new events"}
                  </p>
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="mt-4 text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </FadeIn>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {filteredEvents.map((event, index) => {
                  const imageSrc = event.image?.startsWith("http")
                    ? event.image
                    : "/" + event.image;

                  return (
                    <FadeIn key={event.id} animation="fade-in-up" delay={index * 80}>
                      <HoverCard 
                        className="bg-[#0F1F45] rounded-2xl overflow-hidden shadow-lg border border-white/5 h-full flex flex-col"
                        glowOnHover
                      >
                        <div className="relative w-full h-52 overflow-hidden">
                          <Image
                            src={imageSrc}
                            alt={event.title}
                            fill
                            className={`object-cover transition-transform duration-700 hover:scale-110 ${
                              event.isEnded ? 'grayscale' : ''
                            }`}
                            priority={index < 3}
                          />
                          {/* Price badge */}
                          <div className="absolute top-4 right-4 px-3 py-1.5 bg-indigo-600/90 backdrop-blur-sm rounded-full text-sm font-semibold shadow-lg">
                            Rp{event.price.toLocaleString("id-ID")}
                          </div>
                          {/* Status badge */}
                          {(event.isEnded || event.isStarted || event.isSoldOut) && (
                            <div className={`absolute top-4 left-4 px-3 py-1.5 backdrop-blur-sm rounded-full text-xs font-semibold shadow-lg ${
                              event.isEnded 
                                ? 'bg-red-500/90 text-white' 
                                : event.isStarted 
                                  ? 'bg-yellow-500/90 text-black'
                                  : 'bg-orange-500/90 text-white'
                            }`}>
                              {event.isEnded ? 'Berakhir' : event.isStarted ? 'Berlangsung' : 'Habis'}
                            </div>
                          )}
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1F45] via-transparent to-transparent opacity-60" />
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                          <h2 className="text-xl font-semibold mb-2 line-clamp-1">{event.title}</h2>

                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(event.start_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                            <span className="text-gray-600">•</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{event.location}</span>
                          </div>

                          <Link
                            href={`/events/${event.id}`}
                            className={`mt-5 flex items-center justify-center gap-2 text-center py-3 
                              rounded-xl font-medium transition-all duration-300 group ${
                              event.isEnded 
                                ? 'bg-gray-700/50 text-gray-400 border border-gray-600/30 cursor-default'
                                : event.isStarted || event.isSoldOut
                                  ? 'bg-gray-700/50 text-gray-300 border border-gray-500/30'
                                  : 'border border-indigo-400/50 text-indigo-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:border-transparent hover:text-white'
                            }`}
                          >
                            {event.isEnded 
                              ? 'Event Berakhir' 
                              : event.isStarted 
                                ? 'Lihat Detail'
                                : event.isSoldOut 
                                  ? 'Tiket Habis'
                                  : 'Get Tickets'}
                            {!event.isEnded && (
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4 group-hover:translate-x-1 transition-transform" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            )}
                          </Link>
                        </div>
                      </HoverCard>
                    </FadeIn>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </PageTransition>
    </Layout>
  );
}

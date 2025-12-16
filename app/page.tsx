"use client";

import Image from "next/image";
import Link from "next/link";
import Layout from "./components/Layout";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { Concert } from "./types/concert";
import { 
  FadeIn, 
  HoverCard, 
  EventCardSkeleton,
  GradientText,
  FloatingParticles 
} from "./components/Animations";

export default function Home() {
  const [featured, setFeatured] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("concerts")
        .select("*")
        .eq("featured", true)
        .eq("published", true)
        .gt("start_at", now) // Only show events that haven't started yet
        .order("start_at", { ascending: true })
        .limit(6);

      if (error) {
        console.error(error);
      } else {
        setFeatured(data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <Layout title="home-page">
      <div className="min-h-screen bg-linear-to-b from-[#0A0F29] via-[#0a1138] to-[#010314] text-white">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          {/* Animated background particles */}
          <FloatingParticles />
          
          {/* Gradient orbs for visual interest */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          
          <div className="relative w-full max-w-7xl mx-auto px-4 md:px-0 grid md:grid-cols-2 gap-12 items-center">
            <FadeIn animation="fade-in-left" delay={0}>
              <div className="px-2">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                  Book your <br />
                  <GradientText className="text-4xl md:text-6xl font-extrabold">
                    Tickets for Event!
                  </GradientText>
                </h1>

                <p className="mt-6 text-gray-300 text-lg leading-relaxed">
                  Safe, Secure, Reliable ticketing.
                  <br />
                  Your ticket to live entertainment!
                </p>

                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 
                    text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 
                    hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 
                    btn-glow group"
                >
                  Explore Events
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 gap-4 md:gap-5">
              <FadeIn animation="fade-in-up" delay={100}>
                <div className="group">
                  <Image
                    src="/banner1.jpg"
                    width={500}
                    height={300}
                    alt="Banner 1"
                    className="rounded-xl shadow-lg object-cover h-48 md:h-64 w-full 
                      group-hover:scale-105 group-hover:shadow-2xl transition-all duration-500"
                  />
                </div>
              </FadeIn>
              <FadeIn animation="fade-in-up" delay={200}>
                <div className="group mt-10">
                  <Image
                    src="/banner2.jpg"
                    width={500}
                    height={300}
                    alt="Banner 2"
                    className="rounded-xl shadow-lg object-cover h-48 md:h-64 w-full 
                      group-hover:scale-105 group-hover:shadow-2xl transition-all duration-500"
                  />
                </div>
              </FadeIn>
              <FadeIn animation="fade-in-up" delay={300}>
                <div className="group">
                  <Image
                    src="/banner3.jpg"
                    width={500}
                    height={300}
                    alt="Banner 3"
                    className="rounded-xl shadow-lg object-cover h-48 md:h-64 w-full 
                      group-hover:scale-105 group-hover:shadow-2xl transition-all duration-500"
                  />
                </div>
              </FadeIn>
              <FadeIn animation="fade-in-up" delay={400}>
                <div className="group mt-10">
                  <Image
                    src="/banner4.jpg"
                    width={500}
                    height={300}
                    alt="Banner 4"
                    className="rounded-xl shadow-lg object-cover h-48 md:h-64 w-full 
                      group-hover:scale-105 group-hover:shadow-2xl transition-all duration-500"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="py-20 relative">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-0">
            <FadeIn animation="fade-in-up">
              <div className="glass-card p-10 rounded-3xl shadow-xl relative overflow-hidden">
                {/* Decorative gradient line at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">
                      <GradientText>Featured Events</GradientText>
                    </h2>
                    <p className="text-gray-300">
                      Be sure not to miss these amazing events!
                    </p>
                  </div>
                  <Link 
                    href="/events"
                    className="mt-4 md:mt-0 text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group"
                  >
                    View all events
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {loading ? (
                  <div className="grid md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                      <EventCardSkeleton key={i} />
                    ))}
                  </div>
                ) : featured.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎭</div>
                    <p className="text-gray-400 text-lg">No featured events found.</p>
                    <Link 
                      href="/events" 
                      className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Browse all events
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-8">
                    {featured.map((event, index) => (
                      <FadeIn key={event.id} animation="fade-in-up" delay={index * 100}>
                        <HoverCard className="bg-[#0F1F45] rounded-2xl overflow-hidden shadow-lg border border-white/5 h-full">
                          <div className="relative overflow-hidden">
                            <Image
                              src={
                                event.image.startsWith("http")
                                  ? event.image
                                  : event.image.startsWith("/")
                                  ? event.image
                                  : "/" + event.image
                              }
                              width={500}
                              height={300}
                              alt={event.title}
                              className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                            />
                            {/* Price badge */}
                            <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-600/90 backdrop-blur-sm rounded-full text-sm font-semibold">
                              Rp{event.price.toLocaleString("id-ID")}
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="font-bold text-xl mb-2 line-clamp-1">
                              {event.title}
                            </div>

                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(event.start_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )}
                              <span className="text-gray-600">•</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{event.location}</span>
                            </div>

                            <Link
                              href={`/events/${event.id}`}
                              className="mt-6 block w-full text-center py-3 rounded-xl font-semibold 
                                border border-indigo-400/50 text-indigo-300
                                hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 
                                hover:border-transparent hover:text-white 
                                transition-all duration-300 group flex items-center justify-center gap-2"
                            >
                              Get Tickets
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4 group-hover:translate-x-1 transition-transform" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </Link>
                          </div>
                        </HoverCard>
                      </FadeIn>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-0">
            <FadeIn animation="fade-in-up">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Events", value: "500+", icon: "🎭" },
                  { label: "Tickets Sold", value: "50K+", icon: "🎟️" },
                  { label: "Happy Customers", value: "30K+", icon: "😊" },
                  { label: "Cities", value: "25+", icon: "🏙️" },
                ].map((stat, index) => (
                  <div 
                    key={stat.label}
                    className="glass-card p-6 rounded-2xl text-center hover-lift"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl md:text-3xl font-bold text-gradient">{stat.value}</div>
                    <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-0">
            <FadeIn animation="scale-in">
              <div className="relative glass-card p-12 md:p-16 rounded-3xl text-center overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 animate-gradient" />
                
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Ready to experience amazing events?
                  </h2>
                  <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                    Join thousands of event-goers and never miss out on the best concerts, festivals, and shows in your city.
                  </p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 
                      text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 
                      hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 group"
                  >
                    Browse All Events
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>
    </Layout>
  );
}

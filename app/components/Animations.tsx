// components/Animations.tsx
"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";

/* ========================================
   FADE IN COMPONENT
   Wrapper that animates children with fade-in effect
   ======================================== */

type AnimationType = 
  | "fade-in" 
  | "fade-in-up" 
  | "fade-in-down" 
  | "fade-in-left" 
  | "fade-in-right" 
  | "scale-in";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  animation?: AnimationType;
  className?: string;
  once?: boolean; // If true, animation only plays once when entering viewport
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 600,
  animation = "fade-in-up",
  className = "",
  once = true
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [once]);

  const animationClass = `animate-${animation}`;
  
  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? animationClass : "opacity-0"}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ========================================
   STAGGERED CHILDREN COMPONENT
   Animates children with staggered delays
   ======================================== */

interface StaggeredChildrenProps {
  children: ReactNode[];
  staggerDelay?: number;
  animation?: AnimationType;
  className?: string;
  childClassName?: string;
}

export function StaggeredChildren({
  children,
  staggerDelay = 100,
  animation = "fade-in-up",
  className = "",
  childClassName = "",
}: StaggeredChildrenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const animationClass = `animate-${animation}`;

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={`${childClassName} ${isVisible ? animationClass : "opacity-0"}`}
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: "forwards",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/* ========================================
   PAGE TRANSITION COMPONENT
   Wraps page content with smooth entrance animation
   ======================================== */

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`animate-fade-in-up ${className}`}>
      {children}
    </div>
  );
}

/* ========================================
   ANIMATED COUNTER COMPONENT
   Animates a number counting up
   ======================================== */

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 2000,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString("id-ID")}{suffix}
    </span>
  );
}

/* ========================================
   HOVER CARD COMPONENT
   Card with lift effect on hover
   ======================================== */

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  glowOnHover?: boolean;
}

export function HoverCard({ children, className = "", glowOnHover = false }: HoverCardProps) {
  return (
    <div 
      className={`
        hover-lift card-shine transition-all duration-300
        ${glowOnHover ? "hover:shadow-indigo-500/20" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* ========================================
   SKELETON LOADER COMPONENT
   Animated placeholder while content loads
   ======================================== */

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "image" | "circle";
}

export function Skeleton({ className = "", variant = "text" }: SkeletonProps) {
  const baseClasses = "skeleton rounded";
  
  const variantClasses = {
    text: "h-4 w-full",
    card: "h-48 w-full rounded-2xl",
    image: "h-52 w-full rounded-2xl",
    circle: "h-12 w-12 rounded-full",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
}

/* ========================================
   LOADING CARD SKELETON
   Full event card skeleton for loading states
   ======================================== */

export function EventCardSkeleton() {
  return (
    <div className="bg-[#0F1F45] rounded-2xl overflow-hidden shadow-lg border border-white/5">
      <Skeleton variant="image" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-full rounded-xl mt-4" />
      </div>
    </div>
  );
}

/* ========================================
   ANIMATED BUTTON COMPONENT
   Button with ripple and glow effects
   ======================================== */

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function AnimatedButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  type = "button",
}: AnimatedButtonProps) {
  const baseClasses = "relative overflow-hidden font-semibold rounded-xl transition-all duration-300 ripple";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 btn-glow",
    secondary: "bg-[#0F1F45] hover:bg-[#152856] text-white border border-white/10",
    outline: "border border-indigo-400 text-indigo-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

/* ========================================
   FLOATING PARTICLES BACKGROUND
   Decorative animated background
   ======================================== */

// Pre-computed random positions for particles (pure values)
const PARTICLE_POSITIONS = [
  { left: 5, top: 10, delay: 0.2, duration: 3.5 },
  { left: 15, top: 25, delay: 1.1, duration: 4.2 },
  { left: 25, top: 60, delay: 0.8, duration: 3.8 },
  { left: 35, top: 15, delay: 2.3, duration: 4.5 },
  { left: 45, top: 80, delay: 0.5, duration: 3.2 },
  { left: 55, top: 35, delay: 1.8, duration: 4.8 },
  { left: 65, top: 70, delay: 2.9, duration: 3.6 },
  { left: 75, top: 20, delay: 0.1, duration: 4.1 },
  { left: 85, top: 55, delay: 1.5, duration: 3.9 },
  { left: 95, top: 45, delay: 2.6, duration: 4.4 },
  { left: 10, top: 90, delay: 0.9, duration: 3.3 },
  { left: 20, top: 40, delay: 2.1, duration: 4.7 },
  { left: 30, top: 75, delay: 1.3, duration: 3.7 },
  { left: 40, top: 5, delay: 0.6, duration: 4.0 },
  { left: 50, top: 50, delay: 2.4, duration: 3.4 },
  { left: 60, top: 85, delay: 1.0, duration: 4.3 },
  { left: 70, top: 30, delay: 2.7, duration: 3.1 },
  { left: 80, top: 65, delay: 0.3, duration: 4.6 },
  { left: 90, top: 12, delay: 1.7, duration: 3.0 },
  { left: 98, top: 78, delay: 2.0, duration: 4.9 },
];

export function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLE_POSITIONS.map((particle, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-indigo-500/20 rounded-full animate-float"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ========================================
   GRADIENT TEXT COMPONENT
   Text with animated gradient effect
   ======================================== */

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export function GradientText({ children, className = "" }: GradientTextProps) {
  return (
    <span className={`text-gradient ${className}`}>
      {children}
    </span>
  );
}

/* ========================================
   PULSE DOT INDICATOR
   Animated status indicator
   ======================================== */

interface PulseDotProps {
  color?: "green" | "red" | "yellow" | "indigo";
  className?: string;
}

export function PulseDot({ color = "green", className = "" }: PulseDotProps) {
  const colorClasses = {
    green: "bg-green-400",
    red: "bg-red-400",
    yellow: "bg-yellow-400",
    indigo: "bg-indigo-400",
  };

  return (
    <span className={`relative flex h-3 w-3 ${className}`}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClasses[color]} opacity-75`} />
      <span className={`relative inline-flex rounded-full h-3 w-3 ${colorClasses[color]}`} />
    </span>
  );
}

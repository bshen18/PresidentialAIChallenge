import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Starfield } from "@/components/Starfield";
import { LaunchCountdown } from "@/components/LaunchCountdown";
import { LaunchAnimation } from "@/components/LaunchAnimation";

export default function Home() {
  return (
    <>
      <Starfield />
      <main className="relative z-10">
        {/* Section 1: Logo & Hero */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse-slow" />
            <h1 className="relative text-7xl md:text-[12rem] font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 leading-none">
              Lumina
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            The next generation of space exploration and product discovery.
          </p>
          <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Link
              href="/search"
              className="group relative px-10 py-4 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-all active:scale-95 text-lg"
            >
              Start Searching
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="absolute bottom-12 animate-bounce">
            <p className="text-xs uppercase tracking-[0.5em] text-white/30">Scroll to Launch</p>
          </div>
        </section>

        {/* Section 2: Launch Animation */}
        <LaunchAnimation />

        {/* Section 3: Countdown */}
        <section className="py-24 px-4 bg-black/50 backdrop-blur-3xl min-h-screen flex flex-col justify-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Mission Manifest</h2>
              <p className="text-muted-foreground">Live telemetry and scheduling for upcoming orbital maneuvers.</p>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <LaunchCountdown />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

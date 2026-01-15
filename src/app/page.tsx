import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse-slow" />
        <h1 className="relative text-6xl md:text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          Lumina
        </h1>
      </div>
      <p className="text-xl text-muted-foreground max-w-lg mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
        The next generation of product discovery and comparison.
      </p>

      <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
        <Link
          href="/search"
          className="group relative px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-all active:scale-95"
        >
          Start Searching
          <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

      </div>
    </main>
  );
}

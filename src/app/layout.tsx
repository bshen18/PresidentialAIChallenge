import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter for clean look
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lumina | Next-Gen Search",
  description: "Experience the future of product discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden")}>
        <Navbar />
        <div className="relative flex flex-col min-h-screen">
          {/* Background Gradients */}
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-pulse-slow pointer-events-none" />
          <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-pulse-slow delay-1000 pointer-events-none" />

          <main className="flex-1 flex flex-col pt-24">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

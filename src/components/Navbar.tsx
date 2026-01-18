import Link from "next/link";
import { Search, Scale } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-6 left-0 right-0 px-8 flex justify-between items-center z-50">
            <Link href="/" className="group flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    LUMINA
                </span>
            </Link>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/60 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-full p-2 shadow-2xl ring-1 ring-black/5">
                <NavLink href="/search" icon={<Search className="w-4 h-4" />}>
                    Search
                </NavLink>
                <div className="w-px h-4 bg-border mx-1" />
                <NavLink href="/comparison" icon={<Scale className="w-4 h-4" />}>
                    Compare
                </NavLink>
            </div>
            <div className="w-32" /> {/* Spacer to keep navbar centered */}
        </nav>
    );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 active:scale-95"
        >
            {icon}
            <span>{children}</span>
        </Link>
    );
}

import Link from "next/link";
import { Search, Scale } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-1 bg-background/60 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-full p-2 shadow-2xl ring-1 ring-black/5">
                <NavLink href="/search" icon={<Search className="w-4 h-4" />}>
                    Search
                </NavLink>
                <div className="w-px h-4 bg-border mx-1" />
                <NavLink href="/comparison" icon={<Scale className="w-4 h-4" />}>
                    Compare
                </NavLink>
            </div>
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

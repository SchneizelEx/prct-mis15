"use client";

import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { User, LogOut, ChevronDown } from "lucide-react";

interface UserMenuProps {
    name: string;
}

export default function UserMenu({ name }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors group focus:outline-none"
            >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary shadow-sm group-hover:shadow-md transition-all">
                    <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {name}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Signed in as</p>
                        <p className="text-sm font-medium text-foreground truncate">{name}</p>
                    </div>

                    <div className="p-1">
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg flex items-center gap-2 transition-colors font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, ChevronDown, BookOpen } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ "/register": true });

    const toggleExpand = (href: string) => {
        setExpanded(prev => ({ ...prev, [href]: !prev[href] }));
    };

    const links = [
        { href: "/", label: "หน้าหลัก", icon: LayoutDashboard },
        {
            href: "/register",
            label: "ทะเบียน",
            icon: FileText,
            submenu: [
                { href: "/register/moodle", label: "Moodle", icon: BookOpen },
                { href: "/register/classroom", label: "ห้องเรียน", icon: FileText }
            ]
        },
        {
            href: "/academic",
            label: "วิชาการ",
            icon: BookOpen,
            submenu: [
                { href: "/academic/course", label: "รายวิชา", icon: FileText },
                { href: "/academic/open-course", label: "รายวิชาที่เปิด", icon: FileText }
            ]
        },
    ];

    return (
        <aside className="w-20 md:w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-40 transition-all duration-300">
            {/* Header / Logo */}
            <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-100 flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-blue-500/30 shadow-md flex-shrink-0">
                    H
                </div>
                <span className="ml-3 font-bold text-xl tracking-tight text-foreground hidden md:block truncate">
                    {process.env.NEXT_PUBLIC_SITE_NAME || "HostSphere"}
                </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-2 md:p-4 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                    const hasSubmenu = link.submenu && link.submenu.length > 0;
                    const isExpanded = expanded[link.href];

                    return (
                        <div key={link.href} className="space-y-1">
                            {/* Main Menu Item */}
                            {!hasSubmenu ? (
                                <Link
                                    href={link.href}
                                    title={link.label}
                                    className={clsx(
                                        "flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                                    )}
                                >
                                    <Icon className={clsx("w-6 h-6 md:w-5 md:h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                    <span className="hidden md:block truncate">{link.label}</span>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => toggleExpand(link.href)}
                                    title={link.label}
                                    className={clsx(
                                        "w-full flex items-center justify-center md:justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                        isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={clsx("w-6 h-6 md:w-5 md:h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                        <span className="hidden md:block truncate">{link.label}</span>
                                    </div>
                                    <ChevronDown className={clsx("w-4 h-4 transition-transform duration-200 hidden md:block", isExpanded ? "rotate-180" : "")} />
                                </button>
                            )}

                            {/* Submenu */}
                            {hasSubmenu && isExpanded && (
                                <div className="md:pl-9 space-y-1 animate-in slide-in-from-top-2 fade-in duration-200">
                                    {link.submenu.map((sub) => {
                                        const isSubActive = pathname === sub.href;
                                        const SubIcon = sub.icon;
                                        return (
                                            <Link
                                                key={sub.href}
                                                href={sub.href}
                                                title={sub.label}
                                                className={clsx(
                                                    "block px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center md:justify-start gap-2",
                                                    isSubActive
                                                        ? "text-primary bg-primary/10"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                                                )}
                                            >
                                                <SubIcon className="w-5 h-5 md:w-4 md:h-4 opacity-70" />
                                                <span className="hidden md:block truncate">{sub.label}</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="py-4 border-t border-gray-100 text-xs text-center text-muted-foreground flex-shrink-0 hidden md:block">
                &copy; 2026 HostSphere
            </div>
        </aside>
    );
}

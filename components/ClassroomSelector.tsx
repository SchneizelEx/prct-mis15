"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, Check, School } from "lucide-react";
import { clsx } from "clsx";

interface Classroom {
    ClassId: string;
    Classroom: string;
}

interface ClassroomSelectorProps {
    classrooms: Classroom[];
}

export default function ClassroomSelector({ classrooms }: ClassroomSelectorProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentClassId = searchParams.get("classId") || "";
    const [isOpen, setIsOpen] = useState(false);

    const pathname = usePathname();
    // Close dropdown when picking an item
    const handleSelect = (classId: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("classId", classId);
        router.push(`${pathname}?${params.toString()}`);
        setIsOpen(false);
    };

    const selectedClass = classrooms.find((c) => String(c.ClassId) === currentClassId);

    return (
        <div className="relative w-full md:w-80">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกห้องเรียน (Select Classroom)
                {selectedClass && <span className="text-primary ml-2 font-semibold">({selectedClass.Classroom})</span>}
            </label>

            {/* Custom Select Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-left flex items-center justify-between shadow-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
                <span className={clsx("block truncate", !selectedClass && "text-muted-foreground")}>
                    {selectedClass ? selectedClass.Classroom : "-- กรุณาเลือกห้องเรียน --"}
                </span>
                <ChevronDown className={clsx("w-5 h-5 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {/* Styled Options List (ListBox) */}
            {isOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-1 max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-200">
                    {classrooms.length > 0 ? (
                        classrooms.map((room) => {
                            const isSelected = room.ClassId === currentClassId;
                            return (
                                <button
                                    key={room.ClassId}
                                    onClick={() => handleSelect(room.ClassId)}
                                    className={clsx(
                                        "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group transition-colors",
                                        isSelected ? "bg-blue-50 text-primary font-medium" : "text-foreground hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("p-1.5 rounded-lg", isSelected ? "bg-blue-100 text-primary" : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm")}>
                                            <School className="w-4 h-4" />
                                        </div>
                                        <span>{room.Classroom}</span>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                                </button>
                            )
                        })
                    ) : (
                        <div className="px-4 py-3 text-sm text-center text-muted-foreground">ไม่พบห้องเรียน</div>
                    )}
                </div>
            )}

            {/* Fallback overlay to close when clicking outside */}
            {isOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
}

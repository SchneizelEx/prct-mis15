"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { createOpenCourse } from "./actions";
import { useTransition } from "react";

export default function CreateOpenCourseForm({
    years,
    semesters,
    partials,
    classrooms,
    subjects,
    teachers,
    defaults
}: {
    years: any[];
    semesters: any[];
    partials: any[];
    classrooms: any[];
    subjects: any[];
    teachers: any[];
    defaults: { year: string; semesterId: string; classId: string };
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set(key, value);

        // Reset dependent fields
        if (key === 'year') {
            params.delete('semester_id');
            params.delete('class_id');
        } else if (key === 'semester_id') {
            params.delete('class_id');
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <form action={createOpenCourse} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-4">เพิ่มรายวิชาที่เปิดสอน</h2>

            {/* Hidden Field for redirect/filter context */}
            <input type="hidden" name="semester_id" value={defaults.semesterId} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Year */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ปีการศึกษา</label>
                    <select
                        name="year"
                        value={defaults.year}
                        onChange={(e) => handleFilterChange("year", e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                {/* Semester */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">เทอม</label>
                    <select
                        name="semester_id"
                        value={defaults.semesterId}
                        onChange={(e) => handleFilterChange("semester_id", e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        {semesters.map((s) => (
                            <option key={s.SemesterId} value={s.SemesterId}>{s.Semester}</option>
                        ))}
                    </select>
                </div>

                {/* Partial Semester */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ช่วงเวลาเรียน <span className="text-red-500">*</span></label>
                    <select
                        name="ps_id"
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">-- เลือกช่วงเวลา --</option>
                        {partials.map((p) => (
                            <option key={p.psId} value={p.psId}>ส่วนที่ {p.Part} ({p.comment})</option>
                        ))}
                    </select>
                </div>

                {/* Classroom */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ห้องเรียน <span className="text-red-500">*</span></label>
                    <select
                        name="class_id"
                        value={defaults.classId}
                        onChange={(e) => handleFilterChange("class_id", e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        <option value="">-- เลือกห้องเรียน --</option>
                        {classrooms.map((c) => (
                            <option key={c.ClassId} value={c.ClassId}>{c.Classroom}</option>
                        ))}
                    </select>
                </div>

                {/* Subject */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">วิชา <span className="text-red-500">*</span></label>
                    <select
                        name="subject_id"
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">-- เลือกวิชา (เลือกห้องเรียนก่อน) --</option>
                        {subjects.map((s) => (
                            <option key={`${s.SujId}|${s.CourseId}`} value={`${s.SujId}|${s.CourseId}`}>
                                {s.SujId} - {s.Name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Teacher */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ผู้สอน <span className="text-red-500">*</span></label>
                    <select
                        name="teacher_id"
                        required
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">-- เลือกผู้สอน --</option>
                        {teachers.map((t) => (
                            <option key={t.Eid} value={t.Eid}>
                                {t.Title}{t.F_Name} {t.L_Name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    ยกเลิก
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    บันทึกข้อมูล
                </button>
            </div>
        </form>
    );
}

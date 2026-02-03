import { pool } from "@/lib/db";
import Link from "next/link";
import { clsx } from "clsx";

export default async function CoursePage({
    searchParams,
}: {
    searchParams: Promise<{ level?: string; course_id?: string }>;
}) {
    const params = await searchParams;
    const level = params.level;
    const courseId = params.course_id;

    // Fetch Courses based on Level
    let courses: any[] = [];
    if (level) {
        // Note: Assuming logic for filtering courses by level exists in DB schema or naming convention.
        // For now, listing all or filtering if column exists. 
        // Checking prct-mis11 logic: it just lists all courses in dropdown? 
        // Wait, the PHP code showed: `SELECT * FROM aca_course WHERE CourseId = ?` - no level filter on fetch?
        // Actually PHP had: `SELECT * FROM aca_course` then filtered UI? 
        // Let's fetch all for now, as schema isn't fully fully known for 'Level'.
        // Update: PHP code had `SELECT * FROM aca_course` then filtered by simple ID match in loop? 
        // Wait, the PHP code had `<option value="pvc">` but didn't seem to use it in SQL for `aca_course`?
        // Ah, `aca_course` might not have `Level`. 
        // Let's just fetch all courses for the dropdown first.
        const [cData] = await pool.query("SELECT CourseId, Name FROM aca_course") as [any[], any];
        courses = cData;
    }

    // Fetch Subjects if Course Selected
    let subjects: any[] = [];
    let courseName = "";
    if (courseId) {
        const [sData] = await pool.query(
            "SELECT * FROM aca_subject WHERE CourseId = ? ORDER BY SujId ASC",
            [courseId]
        ) as [any[], any];
        subjects = sData;

        // Get Course Name
        const selectedCourse = courses.find((c: any) => c.CourseId == courseId);
        courseName = selectedCourse?.Name || courseId;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">รายวิชาตามหลักสูตร (Courses)</h1>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form className="flexflex-wrap gap-4 items-end">

                    {/* Level Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">ระดับการศึกษา (Level)</label>
                        <select
                            name="level"
                            defaultValue={level || ""}
                            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 w-40"
                        >
                            <option value="">-- ทั้งหมด --</option>
                            <option value="pvc">ปวช.</option>
                            <option value="pvs">ปวส.</option>
                        </select>
                        {/* Note: This `onChange` won't work in Server Component directly without 'use client' wrapper or simple submit button. 
                             Adding a button for reliability. */}
                    </div>

                    {/* Course Selector */}
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-sm font-medium text-gray-700">หลักสูตร (Curriculum)</label>
                        <select
                            name="course_id"
                            defaultValue={courseId || ""}
                            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 w-full max-w-lg"
                        >
                            <option value="">-- กรุณาเลือกหลักสูตร --</option>
                            {courses.map((c: any) => (
                                <option key={c.CourseId} value={c.CourseId}>{c.Name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        ค้นหา / กรอง
                    </button>
                </form>
            </div>

            {/* Results */}
            {courseId ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">รายวิชาในหลักสูตร: <span className="text-blue-600">{courseName}</span></h3>
                        <span className="text-sm text-gray-500">จำนวน {subjects.length} วิชา</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 w-20 text-center">#</th>
                                    <th className="px-6 py-3 w-32">รหัสวิชา</th>
                                    <th className="px-6 py-3">ชื่อวิชา (ไทย)</th>
                                    <th className="px-6 py-3">ชื่อวิชา (อังกฤษ)</th>
                                    <th className="px-6 py-3 text-center">ท-ป-น</th>
                                    {/* <th className="px-6 py-3 text-right">จัดการ</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {subjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                            ไม่พบรายวิชา
                                        </td>
                                    </tr>
                                ) : (
                                    subjects.map((sub: any, index: number) => (
                                        <tr key={sub.SujId} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-3 text-center text-gray-500">{index + 1}</td>
                                            <td className="px-6 py-3 font-mono text-blue-600 font-medium">{sub.SujId}</td>
                                            <td className="px-6 py-3 font-medium text-gray-900">{sub.Name}</td>
                                            <td className="px-6 py-3 text-gray-500">{sub.E_Name || '-'}</td>
                                            <td className="px-6 py-3 text-center font-mono text-gray-600">
                                                {sub.LecturePeriod || 0}-{sub.LabPeriod || 0}-{sub.Credit || 0}
                                            </td>
                                            {/* <td className="px-6 py-3 text-right">
                                                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                                            </td> */}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                    กรุณาเลือกระดับและหลักสูตรเพื่อดูรายวิชา
                </div>
            )}
        </div>
    );
}

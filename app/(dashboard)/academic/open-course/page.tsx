import { pool } from "@/lib/db";
import Link from "next/link";

export default async function OpenCoursePage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string; semester_id?: string; ps_id?: string }>;
}) {
    const params = await searchParams;

    // --- 0. Resolve Defaults from Parameter Table ---
    let defaultYear = null;
    let defaultSemesterId = null;

    if (!params.year && !params.semester_id) {
        try {
            // Assuming table name is 'parameter' or 'paramater' as per user. Using 'parameter' first.
            // Query parameter table for active semesterid
            const [pRows] = await pool.query("SELECT semesterid FROM parameter LIMIT 1") as [any[], any];
            if (pRows.length > 0) {
                defaultSemesterId = pRows[0].semesterid;
                // Get the year for this semester
                const [sRows] = await pool.query("SELECT aYear FROM aca_semester WHERE SemesterId = ?", [defaultSemesterId]) as [any[], any];
                if (sRows.length > 0) {
                    defaultYear = sRows[0].aYear;
                }
            }
        } catch (error) {
            console.error("Error fetching defaults from parameter table:", error);
        }
    }

    // --- 1. Fetch Dropdowns ---
    // Years
    const [yearsData] = await pool.query("SELECT DISTINCT aYear FROM aca_semester ORDER BY aYear DESC") as [any[], any];
    const years = yearsData.map((y: any) => y.aYear);

    // Default Year
    const selectedYear = params.year || defaultYear || years[0];

    // Semesters for Year
    let semesters: any[] = [];
    if (selectedYear) {
        const [semData] = await pool.query(
            "SELECT SemesterId, Semester FROM aca_semester WHERE aYear = ? ORDER BY Semester DESC",
            [selectedYear]
        ) as [any[], any];
        semesters = semData;
    }

    // Default Semester
    let semesterId = params.semester_id;
    if (!semesterId) {
        if (defaultSemesterId && selectedYear == defaultYear) {
            semesterId = defaultSemesterId;
        } else if (semesters.length > 0) {
            semesterId = semesters[0].SemesterId;
        }
    }

    // Partials for Semester
    let partials: any[] = [];
    if (semesterId) {
        const [pData] = await pool.query(
            "SELECT psId, Part, comment FROM aca_partial_semester_normal WHERE SemesterId = ? ORDER BY Part ASC",
            [semesterId]
        ) as [any[], any];
        partials = pData;
    }
    const psId = params.ps_id;

    // --- 2. Fetch Open Courses ---
    let openCourses: any[] = [];
    if (semesterId) {
        let sql = `
            SELECT 
                o.*,
                s.Name as SubjectName, s.Credit,
                u.Title as TeacherTitle, u.F_Name as TeacherFName, u.L_Name as TeacherLName,
                c.Classroom,
                p.Part, p.comment as PartComment
            FROM aca_open_course_normal o
            JOIN aca_partial_semester_normal p ON o.psId = p.psId
            LEFT JOIN aca_subject s ON o.SujId = s.SujId AND o.CourseId = s.CourseId
            LEFT JOIN hr_employee u ON o.UserId = u.Eid
            LEFT JOIN reg_classroom c ON o.ClassId = c.ClassId
            WHERE p.SemesterId = ?
        `;

        const queryParams = [semesterId];

        if (psId) {
            sql += " AND o.psId = ?";
            queryParams.push(psId);
        }

        sql += " ORDER BY c.Classroom ASC, o.SujId ASC";

        const [rows] = await pool.query(sql, queryParams) as [any[], any];
        openCourses = rows;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">วิชาที่เปิดสอน (Open Courses)</h1>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form className="flex flex-wrap items-end gap-6 w-full">

                    {/* Year Selector */}
                    <div className="flex flex-col gap-1 w-40">
                        <label className="text-sm font-medium text-gray-700">ปีการศึกษา (Year)</label>
                        <select
                            name="year"
                            defaultValue={selectedYear}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            {years.map((y: any) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Semester Selector */}
                    <div className="flex flex-col gap-1 w-40">
                        <label className="text-sm font-medium text-gray-700">ภาคเรียน (Semester)</label>
                        <select
                            name="semester_id"
                            defaultValue={semesterId || ""}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            {semesters.map((s: any) => (
                                <option key={s.SemesterId} value={s.SemesterId}>{s.Semester}</option>
                            ))}
                        </select>
                    </div>

                    {/* Part Selector */}
                    <div className="flex flex-col gap-1 w-48">
                        <label className="text-sm font-medium text-gray-700">ภาคเรียนย่อย (Part)</label>
                        <select
                            name="ps_id"
                            defaultValue={psId || ""}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">ทั้งหมด (All)</option>
                            {partials.map((p: any) => (
                                <option key={p.psId} value={p.psId}>
                                    ส่วนที่ {p.Part}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ค้นหา
                    </button>

                    <div className="flex-1 text-right">
                        <Link
                            href="/academic/open-course/create"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <span>+ เพิ่มวิชาที่เปิดสอน</span>
                        </Link>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">รายการวิชาที่เปิดสอน</h3>
                    <span className="text-sm text-gray-500">จำนวน {openCourses.length} รายการ</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">กลุ่มเรียน</th>
                                <th className="px-6 py-4">รหัสวิชา</th>
                                <th className="px-6 py-4">ชื่อวิชา</th>
                                <th className="px-6 py-4">ครูผู้สอน</th>
                                <th className="px-6 py-4 text-center">หน่วยกิต</th>
                                <th className="px-6 py-4 text-center">ช่วงเวลา</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {openCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            ) : (
                                openCourses.map((course: any) => (
                                    <tr key={`${course.SujId}-${course.Classroom}-${course.Part}`} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {course.Classroom}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-blue-600">
                                            {course.SujId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 font-medium">{course.SubjectName}</div>
                                            <div className="text-gray-500 text-xs">CourseId: {course.CourseId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {course.TeacherFName ? (
                                                <span>{course.TeacherTitle} {course.TeacherFName} {course.TeacherLName}</span>
                                            ) : (
                                                <span className="italic text-gray-300">Unknown</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            {course.Credit}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            ส่วนที่ {course.Part}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

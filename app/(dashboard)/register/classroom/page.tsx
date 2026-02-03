import { pool } from "@/lib/db";
import Link from "next/link";

export default async function ClassroomPage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string; semester_id?: string }>;
}) {
    const params = await searchParams;

    // --- 1. Fetch Dropdowns ---
    // Years
    const [yearsData] = await pool.query("SELECT DISTINCT aYear FROM aca_semester ORDER BY aYear DESC") as [any[], any];
    const years = yearsData.map((y: any) => y.aYear);

    // Default Year
    const selectedYear = params.year || years[0];

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
    let selectedSemesterId = params.semester_id;
    if (!selectedSemesterId && semesters.length > 0) {
        // Fetch parameter default if exists (optional logic, sticking to first for simplicity similar to before)
        selectedSemesterId = semesters[0].SemesterId;
    }

    // --- 2. Fetch Classrooms ---
    let classrooms: any[] = [];
    if (selectedSemesterId) {
        // Query to fetch classrooms with Teacher Name
        const sql = `
            SELECT 
                c.*, 
                t.Title, t.F_Name, t.L_Name,
                (SELECT COUNT(*) FROM reg_class_register r WHERE r.ClassId = c.ClassId) as StudentCount
            FROM reg_classroom c
            LEFT JOIN hr_employee t ON c.TeacherId = t.Eid
            WHERE c.SemesterId = ?
            ORDER BY c.Classroom ASC
        `;
        const [rows] = await pool.query(sql, [selectedSemesterId]) as [any[], any];
        classrooms = rows;
    }

    // Helper to decode Level (50->Pvc, 60->Pvs)
    const getLevelText = (levelObj: any) => {
        const levelCode = String(levelObj);
        if (levelCode.length === 2) {
            const prefix = levelCode[0];
            const year = levelCode[1];
            if (prefix === '5') return `ปวช. ${year}`;
            if (prefix === '6') return `ปวส. ${year}`;
        }
        return levelCode;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Classroom Browser</h1>
                <Link
                    href="/register/classroom/create"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <span className="font-medium">+ เพิ่มห้องเรียน</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form className="flex flex-wrap items-end gap-4">
                    {/* Year Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">ปีการศึกษา</label>
                        <select
                            name="year"
                            defaultValue={selectedYear}
                            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 w-32"
                        >
                            {years.map((y: any) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        {/* Note: onChange needs 'use client' or Button. Using Button below for robust server component. */}
                    </div>

                    {/* Semester Selector */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">ภาคเรียน</label>
                        <select
                            name="semester_id"
                            defaultValue={selectedSemesterId}
                            className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 w-48"
                        >
                            {semesters.map((s: any) => (
                                <option key={s.SemesterId} value={s.SemesterId}>{s.Semester}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        ค้นหา
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">รายการห้องเรียน</h3>
                    <span className="text-sm text-gray-500">จำนวน {classrooms.length} ห้อง</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 w-16 text-center">#</th>
                                <th className="px-6 py-3">ชื่อห้องเรียน</th>
                                <th className="px-6 py-3">ระดับชั้น</th>
                                <th className="px-6 py-3 text-center">จำนวน</th>
                                <th className="px-6 py-3">กลุ่มเรียน</th>
                                <th className="px-6 py-3">ครูที่ปรึกษา</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {classrooms.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                                        ไม่พบข้อมูลห้องเรียน
                                    </td>
                                </tr>
                            ) : (
                                classrooms.map((room: any, index: number) => (
                                    <tr key={room.ClassId} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-3 text-center text-gray-500">{index + 1}</td>
                                        <td className="px-6 py-3 font-medium text-gray-900">{room.Classroom}</td>
                                        <td className="px-6 py-3 text-gray-600">{getLevelText(room.Level)}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {room.StudentCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={clsx(
                                                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                                                room.StudyGroup == 0 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                                            )}>
                                                {room.StudyGroup == 0 ? 'ปกติ' : (room.StudyGroup == 1 ? 'สมทบ' : room.StudyGroup)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600">
                                            {room.F_Name ? `${room.Title}${room.F_Name} ${room.L_Name}` : <span className="text-gray-300 italic">Unknown</span>}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Actions not fully wired yet, placeholders */}
                                                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                                                <button className="text-red-400 hover:text-red-600">Delete</button>
                                            </div>
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

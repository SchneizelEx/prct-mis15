
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { BookOpen, GraduationCap, Users, User, ArrowRight } from "lucide-react";
import ClassroomSelector from "@/components/ClassroomSelector";

interface Classroom extends RowDataPacket {
    ClassId: string;
    Classroom: string;
    SemesterId: number;
}

interface Student extends RowDataPacket {
    Sid: string;
    Title: string;
    F_Name: string;
    L_Name: string;
}

export default async function MoodlePage({
    searchParams,
}: {
    searchParams: Promise<{ classId?: string }>;
}) {
    const { classId } = await searchParams;
    const selectedClassId = classId;

    // 1. Fetch Classrooms for Selector (Semester 34)
    let classrooms: Classroom[] = [];
    try {
        const [rows] = await pool.query<Classroom[]>(
            "SELECT ClassId, Classroom, SemesterId FROM reg_classroom WHERE SemesterId = ? ORDER BY Classroom ASC",
            [34]
        );
        classrooms = rows;
    } catch (error) {
        console.error("Failed to fetch classrooms:", error);
    }

    // 2. Fetch Students if a ClassId is selected
    let students: Student[] = [];
    let selectedClassInfo: Classroom | undefined;

    if (selectedClassId) {
        selectedClassInfo = classrooms.find(c => String(c.ClassId) === selectedClassId);
        try {
            const [rows] = await pool.query<Student[]>(
                `SELECT s.Sid, s.Title, s.F_Name, s.L_Name 
             FROM reg_student s
             JOIN reg_class_register r ON s.Sid = r.Sid
             WHERE r.ClassId = ?
             ORDER BY s.Sid ASC`,
                [selectedClassId]
            );
            students = rows;
        } catch (error) {
            console.error("Failed to fetch students:", error);
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Moodle Integration</h1>
                        <p className="text-muted-foreground mt-1">ระบบตรวจสอบรายชื่อนักศึกษา (ภาคเรียนที่ 34)</p>
                    </div>
                </div>
            </div>

            {/* Selector Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                    <ClassroomSelector classrooms={classrooms} />
                </div>
                {selectedClassId && (
                    <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-xl text-primary text-sm font-medium border border-blue-100 animate-in fade-in">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        Processing Class: {selectedClassInfo?.Classroom || selectedClassId}
                    </div>
                )}
            </div>

            {/* Results Section */}
            {selectedClassId ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                    <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
                        <div>
                            <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                รายชื่อนักศึกษา
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                ห้อง: <span className="font-semibold text-gray-700">{selectedClassInfo?.Classroom || selectedClassId}</span>
                            </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                            รวมทั้งสิ้น {students.length} คน
                        </span>
                    </div>

                    {students.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/80 text-gray-600 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 w-20 text-center">ลำดับ</th>
                                        <th className="px-6 py-4 w-40">รหัสนักศึกษา</th>
                                        <th className="px-6 py-4">ชื่อ - นามสกุล</th>
                                        <th className="px-6 py-4 w-32 text-center">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {students.map((student, index) => (
                                        <tr key={student.Sid} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4 text-center text-muted-foreground font-mono">{index + 1}</td>
                                            <td className="px-6 py-4 font-mono font-medium text-primary group-hover:text-blue-700">
                                                {student.Sid}
                                            </td>
                                            <td className="px-6 py-4 text-foreground font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <span>
                                                        <span className="text-muted-foreground mr-1.5">{student.Title}</span>
                                                        {student.F_Name} {student.L_Name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">ไม่พบรายชื่อนักศึกษา</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                ยังไม่มีนักศึกษาลงทะเบียนในห้องเรียน
                                <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded mx-1">{selectedClassInfo?.Classroom || selectedClassId}</span>
                                นี้ครับ
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl">
                    <div className="w-16 h-16 bg-white text-primary rounded-2xl shadow-sm flex items-center justify-center mb-6 animate-bounce duration-[2000ms]">
                        <ArrowRight className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">กรุณาเลือกห้องเรียน</h3>

                </div>
            )}
        </div>
    );
}

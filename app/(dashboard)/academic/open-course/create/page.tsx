import { pool } from "@/lib/db";
import CreateOpenCourseForm from "./form";
import { redirect } from "next/navigation";

export default async function CreateOpenCoursePage({
    searchParams,
}: {
    searchParams: Promise<{ year?: string; semester_id?: string; class_id?: string }>;
}) {
    const params = await searchParams;

    // --- 1. Fetch Defaults (Current Semester) ---
    const [defaultParams] = await pool.query(
        "SELECT p.SemesterId, a.aYear FROM parameter p JOIN aca_semester a ON p.SemesterId = a.SemesterId ORDER BY p.SemesterId DESC LIMIT 1"
    ) as [any[], any];

    const currentParam = defaultParams[0] || {};
    const defaultSemesterId = currentParam.SemesterId;
    const defaultYear = currentParam.aYear;

    // --- 2. Determine Selected Filters ---
    // Years
    const [yearsData] = await pool.query("SELECT DISTINCT aYear FROM aca_semester ORDER BY aYear DESC") as [any[], any];
    const years = yearsData.map((y: any) => y.aYear);

    const selectedYear = params.year || defaultYear || years[0];

    // Semesters
    let semesters: any[] = [];
    if (selectedYear) {
        const [semData] = await pool.query(
            "SELECT SemesterId, Semester FROM aca_semester WHERE aYear = ? ORDER BY Semester DESC",
            [selectedYear]
        ) as [any[], any];
        semesters = semData;
    }

    let selectedSemesterId = params.semester_id;
    if (!selectedSemesterId && semesters.length > 0) {
        // If year matches default, use default semester, otherwise first one
        if (selectedYear == defaultYear && defaultSemesterId) {
            selectedSemesterId = defaultSemesterId;
        } else {
            selectedSemesterId = semesters[0].SemesterId;
        }
    }

    // --- 3. Fetch Dependent Data ---
    let partials: any[] = [];
    let classrooms: any[] = [];

    if (selectedSemesterId) {
        const [pData] = await pool.query(
            "SELECT psId, Part, comment FROM aca_partial_semester_normal WHERE SemesterId = ? ORDER BY Part ASC",
            [selectedSemesterId]
        ) as [any[], any];
        partials = pData;

        const [cData] = await pool.query(
            "SELECT ClassId, Classroom FROM reg_classroom WHERE SemesterId = ? ORDER BY Classroom ASC",
            [selectedSemesterId]
        ) as [any[], any];
        classrooms = cData;
    }

    // --- 4. Subjects Logic (Cascading) ---
    let subjects: any[] = [];
    const selectedClassId = params.class_id;

    if (selectedClassId) {
        // 1. Get Major -> Course
        const [classData] = await pool.query(
            `SELECT m.CourseId 
             FROM reg_classroom c 
             JOIN aca_major m ON c.MajorId = m.MajorId 
             WHERE c.ClassId = ?`,
            [selectedClassId]
        ) as [any[], any];

        const courseId = classData[0]?.CourseId;

        if (courseId) {
            const [sData] = await pool.query(
                "SELECT SujId, CourseId, Name FROM aca_subject WHERE CourseId = ? ORDER BY SujId ASC",
                [courseId]
            ) as [any[], any];
            subjects = sData;
        }
    }

    // --- 5. Teachers ---
    const [teachers] = await pool.query(
        "SELECT Eid, Title, F_Name, L_Name FROM hr_employee WHERE Status >= 1 AND F_Name IS NOT NULL ORDER BY F_Name ASC"
    ) as [any[], any];


    return (
        <CreateOpenCourseForm
            years={years}
            semesters={semesters}
            partials={partials}
            classrooms={classrooms}
            subjects={subjects}
            teachers={teachers}
            defaults={{
                year: selectedYear,
                semesterId: selectedSemesterId || "",
                classId: selectedClassId || ""
            }}
        />
    );
}

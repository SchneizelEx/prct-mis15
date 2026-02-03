'use server'

import { pool } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createOpenCourse(formData: FormData) {
    const psId = formData.get("ps_id");
    const classId = formData.get("class_id");
    const subjectValue = formData.get("subject_id") as string;
    const teacherId = formData.get("teacher_id");

    const semesterId = formData.get("semester_id");

    if (!psId || !classId || !subjectValue || !teacherId) {
        throw new Error("Missing required fields");
    }

    const [sujId, courseId] = subjectValue.split('|');

    try {
        await pool.query(
            "INSERT INTO aca_open_course_normal (CourseId, psId, SujId, UserId, ClassId, Status) VALUES (?, ?, ?, ?, ?, 1)",
            [courseId, psId, sujId, teacherId, classId]
        );
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to create course");
    }

    revalidatePath("/academic/open-course");
    redirect(`/academic/open-course?semester_id=${semesterId}&created=1`);
}

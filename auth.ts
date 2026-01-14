
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { pool } from "@/lib/db"
import crypto from "crypto"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                username: {},
                password: {},
            },
            authorize: async (credentials) => {
                if (!credentials?.username || !credentials?.password) {
                    return null
                }

                const username = credentials.username as string
                const password = credentials.password as string

                // Hash password with MD5
                const hashedPassword = crypto.createHash("md5").update(password).digest("hex")

                try {
                    // Query MySQL for the user
                    const [rows] = await pool.execute(
                        'SELECT * FROM user WHERE Emp_Id = ? AND password = ?',
                        [username, hashedPassword]
                    );

                    const users = rows as any[];

                    if (users.length > 0) {
                        return {
                            id: users[0].Emp_Id,
                            name: users[0].User_Name,
                        }
                    }

                    return null
                } catch (error) {
                    console.error("Auth error:", error)
                    return null
                }
            },
        }),
    ],
})

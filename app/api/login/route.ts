import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Hash password with MD5 (as requested)
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

        // Query database
        // Table: user, Columns: Emp_Id (username), password (md5)
        const [rows] = await pool.execute(
            'SELECT * FROM user WHERE Emp_Id = ? AND password = ?',
            [username, hashedPassword]
        );

        const users = rows as any[];

        if (users.length > 0) {
            const user = users[0];
            // In a real app, you would set a session or JWT here.
            // For this implementation, we just return success.
            return NextResponse.json({
                success: true,
                user: {
                    Emp_Id: user.Emp_Id,
                    // Don't send password back
                }
            });
        } else {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

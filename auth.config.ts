import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnLogin = nextUrl.pathname === "/login"
            const isOnSignup = nextUrl.pathname === "/signup"

            // Allow access to public routes (login/signup) if not logged in
            if (isOnLogin || isOnSignup) {
                if (isLoggedIn) {
                    // If logged in and on login/signup, redirect to home
                    return Response.redirect(new URL("/", nextUrl))
                }
                return true
            }

            // Protect all other routes
            if (!isLoggedIn) {
                return false // Redirect to login (handled by NextAuth)
            }

            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.name = user.name
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.name) {
                session.user.name = token.name
            }
            return session
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig

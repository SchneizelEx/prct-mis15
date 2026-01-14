"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { User, Lock, Check, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Using Auth.js signIn
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false, // Prevent auto redirect to handle errors here
            });

            if (result?.error) {
                setError("Invalid username or password");
            } else {
                // Successful login
                router.push("/");
                router.refresh(); // Ensure state updates
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-secondary to-blue-200">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/50">

                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4 shadow-lg shadow-blue-500/30">
                        {/* Simple Logo Placeholder */}
                        <span className="text-white font-bold text-2xl">A</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Welcome back! Please enter your details.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-600 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>

                    {/* Username Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground ml-1" htmlFor="username">Username</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={loading}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                            />
                            {username && !loading && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-primary">
                                    <Check className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground ml-1" htmlFor="password">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end text-sm">
                        <Link href="#" className="font-medium text-primary hover:text-blue-600 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
}


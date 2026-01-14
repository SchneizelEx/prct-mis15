import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import { auth } from "@/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar (Left) */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col ml-20 md:ml-64 transition-all duration-300">

                {/* Top Header (Optional, mostly for User Profile) */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-end px-8 sticky top-0 z-30">
                    {session?.user?.name && (
                        <UserMenu name={session.user.name} />
                    )}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

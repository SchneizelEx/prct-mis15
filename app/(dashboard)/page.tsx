
import { auth } from "@/auth";

export default async function DashboardHome() {
  const session = await auth();

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-2">Welcome back, {session?.user?.name || "User"}!</h2>
        <p className="text-muted-foreground">
          Select a menu item from the sidebar to get started.
          Use the "ทะเบียน" menu to access registration features.
        </p>
      </div>
    </div>
  );
}

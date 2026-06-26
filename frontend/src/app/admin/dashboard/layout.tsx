import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_session")?.value;

  if (adminToken !== "super_admin_verified") {
    redirect("/admin");
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen">
      {children}
    </div>
  );
}

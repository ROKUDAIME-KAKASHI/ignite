import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/auth";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_session")?.value;

  let isValid = false;
  if (adminToken) {
    try {
      const payload = await decrypt(adminToken);
      isValid = payload?.role === "SUPER_ADMIN";
    } catch {}
  }

  if (!isValid) {
    redirect("/admin");
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen">
      {children}
    </div>
  );
}

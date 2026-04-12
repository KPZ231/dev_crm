import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/components/layout/AppShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership) {
    // User is authenticated but has no workspace membership.
    // Redirect to onboarding — NOT to /auth/login (would create redirect loop
    // because middleware sees a logged-in user on /auth/login and sends them back to /dashboard).
    redirect("/auth/onboarding");
  }

  const userData = {
    name: session.user.name,
    email: session.user.email,
    role: membership.role,
    image: session.user.image
  };

  return (
    <AppShell user={userData}>
      {children}
    </AppShell>
  );
}

import AppSidebar from "@/components/app-sidebar";
import { Footer } from "@/components/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lettera",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden ml-64 transition-all duration-300 ease-out md:ml-64 sm:ml-0">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}

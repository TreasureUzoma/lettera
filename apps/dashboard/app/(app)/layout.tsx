import AppTopNav from "@/components/app-top-nav";
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
    <div>
      <AppTopNav />
      {children}
      <Footer />
    </div>
  );
}

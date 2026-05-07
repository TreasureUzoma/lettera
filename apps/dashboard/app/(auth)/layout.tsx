import { AuthHeader } from "./components/header";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-muted">
      <AuthHeader />
      {children}
    </div>
  );
}

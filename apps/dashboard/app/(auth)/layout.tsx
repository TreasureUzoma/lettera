import { AuthHeader } from "./components/header";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <AuthHeader />
      {children}
    </div>
  );
}

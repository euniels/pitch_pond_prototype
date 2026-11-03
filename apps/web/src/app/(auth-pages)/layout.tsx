import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="auth-shell">
      <header className="auth-shell-header">
        <Brand />
        <ThemeToggle />
      </header>
      {children}
    </div>
  );
}

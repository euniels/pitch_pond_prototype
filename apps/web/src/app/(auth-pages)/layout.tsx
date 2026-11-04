import Image from "next/image";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { editorialMedia } from "@/lib/editorial-media";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="auth-shell">
      <header className="auth-shell-header">
        <Brand />
        <ThemeToggle />
      </header>
      <div className="auth-cinematic-layout">
        <aside className="auth-cinematic-media">
          <Image src={editorialMedia.hero.src} alt={editorialMedia.hero.alt} fill priority sizes="(max-width: 800px) 100vw, 56vw" />
          <div className="auth-cinematic-shade" />
          <div><span className="eyebrow light">Evidence before introductions</span><blockquote>“A stronger pitch begins with a venture that can show its work.”</blockquote><p>Private pilot access for founders, supporters, and institutions.</p></div>
        </aside>
        <div className="auth-cinematic-content">{children}</div>
      </div>
    </div>
  );
}

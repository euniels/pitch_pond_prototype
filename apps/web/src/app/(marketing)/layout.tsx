import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { MotionObserver } from "@/components/motion-observer";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="marketing-shell">
      <MotionObserver />
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

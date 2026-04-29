import Link from "next/link";

import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" aria-label="NeuroDrop" className="mb-8 inline-block">
          <Logo size="md" />
        </Link>
        {children}
      </div>
    </div>
  );
}

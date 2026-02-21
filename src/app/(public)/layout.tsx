import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Footer } from '@/components/landing/footer';

// ===========================================
// PIXLY - Public Pages Layout (Server)
// Minimal header (no navbar) + Footer
// Legal & info pages: serious, focused reading
// ===========================================

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal header — logo + back link, not fixed */}
      <header className="border-b border-neutral-100">
        <div className="container-main flex items-center justify-between py-5">
          <Logo href="/" size="sm" />
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour
          </Link>
        </div>
      </header>

      <main>{children}</main>
      <Footer />
    </div>
  );
}

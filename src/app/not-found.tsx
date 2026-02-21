import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 h-12 w-12 overflow-hidden rounded-xl shadow-md">
          <Image
            src="/logo-pixly.png"
            alt="Pixly"
            width={48}
            height={48}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Erreur 404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
          Page introuvable
        </h1>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-neutral-500">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="rounded-xl bg-neutral-900 px-5 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 text-center"
          >
            Tableau de bord
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-[13px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 text-center"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

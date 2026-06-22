import Link from "next/link";
import { Crest } from "@/components/Crest";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Crest size={64} />
      <h1 className="font-serif text-2xl font-bold">Page not found</h1>
      <p className="text-ink-soft">That VIP pass or business doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary rounded-xl px-5 py-3 text-sm font-bold">
        Back home
      </Link>
    </main>
  );
}

import { LoginForm } from "./LoginForm";
import { Crest } from "@/components/Crest";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Crest size={60} />
          <h1 className="mt-4 font-serif text-2xl font-bold">VIP Club</h1>
          <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">Staff &amp; Owner Sign-in</p>
        </div>
        <div className="card-shadow rounded-3xl border border-line bg-white p-6">
          <LoginForm />
        </div>
        <div className="mt-5 rounded-2xl border border-line bg-blush/60 p-4 text-xs text-ink-soft">
          <p className="mb-2 font-bold text-ink">Demo accounts</p>
          <p>Owner — <b>owner@bella.test</b></p>
          <p>Staff — <b>staff@bella.test</b></p>
          <p>Admin — <b>admin@vipclub.test</b></p>
          <p className="mt-2">Password for all: <b>vip12345</b></p>
        </div>
      </div>
    </main>
  );
}

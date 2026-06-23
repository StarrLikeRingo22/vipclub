import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/users";
import { makeSession, signSession, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  }

  let user;
  try {
    user = await verifyCredentials(email, password);
  } catch (e) {
    const detail = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json({ error: `Sign-in is temporarily unavailable: ${detail}` }, { status: 503 });
  }
  if (!user) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }

  const token = await signSession(makeSession(user));
  const res = NextResponse.json({
    ok: true,
    role: user.role,
    redirect: user.role === "admin" ? "/admin" : "/owner",
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

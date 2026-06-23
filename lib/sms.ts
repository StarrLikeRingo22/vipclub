// SMS sending — Twilio when configured, console mock otherwise.

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_FROM_NUMBER;

export const isTwilioConfigured = Boolean(sid && token && from);

export interface SendResult {
  ok: boolean;
  sid: string | null;
  status: "sent" | "failed" | "mock";
  error?: string;
}

// Twilio requires E.164 (e.g. +14165551234). Normalize common North-American
// formats so numbers typed as "(416) 555-1234" or "416-555-1234" still send.
export function toE164(raw: string): string {
  const t = (raw || "").trim();
  if (t.startsWith("+")) return "+" + t.slice(1).replace(/[^\d]/g, "");
  const digits = t.replace(/[^\d]/g, "");
  if (digits.length === 10) return "+1" + digits;                 // NANP, no country code
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  return "+" + digits;                                            // best effort
}

export async function sendSms(to: string, body: string): Promise<SendResult> {
  const dest = toE164(to);

  if (!isTwilioConfigured) {
    // eslint-disable-next-line no-console
    console.log(`[SMS mock] -> ${dest}: ${body}`);
    return { ok: true, sid: null, status: "mock" };
  }

  // Basic E.164 sanity check before hitting the API.
  if (!/^\+\d{10,15}$/.test(dest)) {
    return { ok: false, sid: null, status: "failed", error: `Invalid phone number: ${to}` };
  }

  try {
    // Lazy import keeps the Twilio SDK out of bundles that never send.
    const twilio = (await import("twilio")).default;
    const client = twilio(sid!, token!);
    const msg = await client.messages.create({ to: dest, from: from!, body });
    return { ok: true, sid: msg.sid, status: "sent" };
  } catch (e) {
    const error = e instanceof Error ? e.message : "send failed";
    // eslint-disable-next-line no-console
    console.error(`[SMS failed] -> ${dest}: ${error}`);
    return { ok: false, sid: null, status: "failed", error };
  }
}

// ── Templates ───────────────────────────────────────────────────

export function welcomeMessage(name: string, salon: string, passUrl: string): string {
  const first = name.split(" ")[0];
  return `Welcome to the VIP Club, ${first}! You're officially in at ${salon}. Here's your VIP pass — show it at checkout to earn rewards: ${passUrl}`;
}

export function rewardReadyMessage(name: string, salon: string): string {
  const first = name.split(" ")[0];
  return `Reward unlocked, ${first}! You've earned a free service at ${salon}. Show your VIP pass on your next visit to redeem.`;
}

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

export async function sendSms(to: string, body: string): Promise<SendResult> {
  if (!isTwilioConfigured) {
    // eslint-disable-next-line no-console
    console.log(`[SMS mock] → ${to}: ${body}`);
    return { ok: true, sid: null, status: "mock" };
  }
  try {
    // Lazy import keeps the Twilio SDK out of bundles that never send.
    const twilio = (await import("twilio")).default;
    const client = twilio(sid!, token!);
    const msg = await client.messages.create({ to, from: from!, body });
    return { ok: true, sid: msg.sid, status: "sent" };
  } catch (e) {
    const error = e instanceof Error ? e.message : "send failed";
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

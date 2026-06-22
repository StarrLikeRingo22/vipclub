// Email sending via Resend when configured, console mock otherwise.
// (You'll add your sending domain + RESEND_API_KEY today/tomorrow.)

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM; // e.g. "VIP Club <bookings@yourdomain.com>"

export const isEmailConfigured = Boolean(apiKey && from);

export interface Attachment {
  filename: string;
  content: string; // base64
  contentType?: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}

export interface EmailResult {
  ok: boolean;
  id: string | null;
  status: "sent" | "mock" | "failed";
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<EmailResult> {
  if (!isEmailConfigured) {
    // eslint-disable-next-line no-console
    console.log(`[email mock] → ${input.to} · ${input.subject}`);
    return { ok: true, id: null, status: "mock" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        attachments: input.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          content_type: a.contentType ?? "text/calendar",
        })),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, id: null, status: "failed", error: text.slice(0, 200) };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id ?? null, status: "sent" };
  } catch (e) {
    return { ok: false, id: null, status: "failed", error: e instanceof Error ? e.message : "send failed" };
  }
}

// base64 for an ics string (Edge/Node safe).
export function toBase64(str: string): string {
  if (typeof Buffer !== "undefined") return Buffer.from(str, "utf-8").toString("base64");
  // Edge fallback
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

// ── Booking confirmation email body ─────────────────────────────
export function bookingEmailHtml(opts: {
  customerName: string;
  salon: string;
  service: string;
  whenText: string;
  location: string;
  bookingUrl: string;
  googleUrl: string;
  outlookUrl: string;
}): string {
  const first = opts.customerName.split(" ")[0];
  return `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;color:#3A2C30">
    <div style="text-align:center;padding:24px 0">
      <div style="font-size:13px;letter-spacing:3px;color:#C9A24B;font-weight:700">VIP CLUB</div>
      <h1 style="font-size:22px;margin:8px 0 0">You're booked, ${first}</h1>
    </div>
    <div style="background:#FCEEF0;border-radius:16px;padding:20px;margin-bottom:16px">
      <p style="margin:0 0 6px"><b>${opts.service}</b></p>
      <p style="margin:0 0 6px">When: ${opts.whenText}</p>
      <p style="margin:0 0 6px">Where: ${opts.location}</p>
      <p style="margin:0">${opts.salon}</p>
    </div>
    <p style="font-size:14px;color:#7A6A6E">Add it to your calendar so you don't miss it:</p>
    <p>
      <a href="${opts.googleUrl}" style="display:inline-block;background:linear-gradient(135deg,#E8A0A8,#C97B86);color:#fff;text-decoration:none;padding:11px 18px;border-radius:12px;font-weight:700;margin:4px 6px 4px 0">Add to Google / Android</a>
      <a href="${opts.outlookUrl}" style="display:inline-block;background:#fff;border:1.5px solid #F7DCE0;color:#C97B86;text-decoration:none;padding:11px 18px;border-radius:12px;font-weight:700;margin:4px 0">Add to Outlook</a>
    </p>
    <p style="font-size:13px;color:#7A6A6E">Apple/iPhone users: open the attached <b>invite.ics</b> file.</p>
    <p style="font-size:13px"><a href="${opts.bookingUrl}" style="color:#C97B86">Manage or reschedule →</a></p>
  </div>`;
}

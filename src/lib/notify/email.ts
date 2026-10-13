import "server-only";

// Sends email through Resend (https://resend.com) when RESEND_API_KEY is set.
// Without it, messages are logged to the server console instead, so checkout
// never fails because email is not configured yet.
//
// EMAIL_FROM must use a domain verified in Resend, e.g.
//   EMAIL_FROM="Crestar Trading <orders@crestartrading.com>"
// Until a domain is verified, Resend only delivers to the account owner's address.

export type Email = { to: string; subject: string; html: string; text: string; replyTo?: string };

export async function sendEmail(email: Email): Promise<{ sent: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email:not-configured] to=${email.to} subject="${email.subject}"\n${email.text}`);
    return { sent: false };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Crestar Trading <onboarding@resend.dev>",
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.replyTo || process.env.EMAIL_REPLY_TO ? { reply_to: email.replyTo || process.env.EMAIL_REPLY_TO } : {}),
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend refused (${res.status}): ${await res.text()}`);
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    // Email is best-effort: never let it break an order.
    console.error("[email] send failed", error);
    return { sent: false };
  }
}

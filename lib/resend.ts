// lib/resend.ts
//
// Every email the site sends goes through here.
//
// This used to `return res.ok` and discard the reason on failure, which meant a
// bad API key, an unverified domain, or a suppressed recipient all looked
// identical to success from the caller's side. A listing submission that never
// notified anyone looked exactly like one that did.
//
// Now it logs the status and body on failure. Still returns a boolean rather
// than throwing, so a mail problem never costs us the submission itself.

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('[resend] RESEND_API_KEY is not set - no email sent to', to);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ATM Exits <hello@atmexits.com>',
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(
        `[resend] ${res.status} sending "${subject}" to ${to}:`,
        body.slice(0, 400)
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[resend] threw sending "${subject}" to ${to}:`, err);
    return false;
  }
}

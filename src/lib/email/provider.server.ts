export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export interface EmailProvider {
  send(email: TransactionalEmail): Promise<void>;
}

class ResendEmailProvider implements EmailProvider {
  async send(email: TransactionalEmail) {
    const apiKey = process.env["RESEND_API_KEY"];
    const fromEmail = process.env["RESEND_FROM_EMAIL"];
    if (!apiKey || !fromEmail) {
      throw new Error("Transactional email is not configured.");
    }
    const fromName = process.env["RESEND_FROM_NAME"] ?? "Bricxley";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });
    if (!response.ok) throw new Error("Transactional email could not be delivered.");
  }
}

export function getEmailProvider(): EmailProvider {
  return new ResendEmailProvider();
}

export function brandedEmail(title: string, body: string) {
  const escaped = body.replace(/[&<>"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    };
    return entities[character] ?? character;
  });
  return `<!doctype html><html><body style="margin:0;background:#f8f6f1;color:#1f2937;font-family:Arial,sans-serif"><main style="max-width:560px;margin:0 auto;padding:32px"><h1 style="margin:0 0 20px;color:#0b6b57;font-size:24px">Bricxley</h1><section style="background:#fff;border-radius:16px;padding:24px"><h2 style="margin:0 0 16px">${title}</h2><p style="white-space:pre-line;line-height:1.6;margin:0">${escaped}</p></section></main></body></html>`;
}

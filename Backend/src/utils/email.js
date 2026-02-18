/**
 * Optional email sending. Configure SMTP in .env to send password-reset emails.
 * Env: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM (e.g. "Ritwil <noreply@example.com>")
 */

let transporter = null;

async function getTransporter() {
  if (transporter !== null) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  try {
    const nodemailer = await import("nodemailer");
    transporter = nodemailer.default.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
    return transporter;
  } catch {
    return null;
  }
}

export async function sendPasswordResetEmail(toEmail, resetLink) {
  const trans = await getTransporter();
  if (!trans) return { sent: false };
  const from = process.env.MAIL_FROM || "Ritwil <noreply@ritwil.com>";
  await trans.sendMail({
    from,
    to: toEmail,
    subject: "Reset your password",
    text: `Use this link to reset your password (valid for 1 hour):\n\n${resetLink}`,
    html: `<p>Use this link to reset your password (valid for 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  });
  return { sent: true };
}

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

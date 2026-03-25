import nodemailer from 'nodemailer';

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === 'true',
    auth: user && pass ? { user, pass } : undefined,
  });
}

export type SendMailResult =
  | { ok: true; via: 'smtp' }
  | { ok: true; via: 'dev_console' }
  | { ok: false; reason: 'smtp_failed'; error: string };

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<SendMailResult> {
  const from = process.env.SMTP_FROM ?? 'JLPT Trainer <noreply@localhost>';
  const subject = 'Reset your password — Harumi JLPT N2 Smart Trainer';
  const text = `You requested a password reset.\n\nOpen this link (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, ignore this email.`;
  const html = `
    <p>You requested a password reset.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p style="color:#666;font-size:12px;">This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
  `;

  const transport = createTransport();

  if (!transport) {
    if (process.env.NODE_ENV === 'development') {
      console.info('\n[password-reset] SMTP not configured — reset link (dev only):');
      console.info(resetUrl);
      console.info('');
      return { ok: true, via: 'dev_console' };
    }
    console.error('[password-reset] SMTP_HOST / SMTP_PORT not set; cannot send email in production');
    return { ok: false, reason: 'smtp_failed', error: 'Email transport not configured' };
  }

  try {
    await transport.sendMail({ from, to, subject, text, html });
    return { ok: true, via: 'smtp' };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[password-reset] sendMail failed:', message);
    return { ok: false, reason: 'smtp_failed', error: message };
  }
}

export async function sendEmailVerificationCode(
  to: string,
  code: string
): Promise<SendMailResult> {
  const from = process.env.SMTP_FROM ?? 'Harumi JLPT <noreply@localhost>';
  const subject = 'Your verification code — Harumi JLPT N2 Smart Trainer';
  const text = `Your email verification code is: ${code}\n\nIt expires in 15 minutes. If you did not sign up, ignore this email.`;
  const html = `
    <p>Your email verification code is:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:0.2em;">${escapeHtml(code)}</p>
    <p style="color:#666;font-size:12px;">This code expires in 15 minutes. If you did not sign up, you can ignore this email.</p>
  `;

  const transport = createTransport();

  if (!transport) {
    if (process.env.NODE_ENV === 'development') {
      console.info('\n[email-verify] SMTP not configured — verification code (dev only):');
      console.info(code);
      console.info('');
      return { ok: true, via: 'dev_console' };
    }
    console.error('[email-verify] SMTP_HOST / SMTP_PORT not set; cannot send email in production');
    return { ok: false, reason: 'smtp_failed', error: 'Email transport not configured' };
  }

  try {
    await transport.sendMail({ from, to, subject, text, html });
    return { ok: true, via: 'smtp' };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[email-verify] sendMail failed:', message);
    return { ok: false, reason: 'smtp_failed', error: message };
  }
}

/** Comma-separated list in FEEDBACK_NOTIFY_EMAIL */
export function parseFeedbackAdminRecipients(): string[] {
  return (process.env.FEEDBACK_NOTIFY_EMAIL ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Notify admins about a new feedback row. Does not throw; logs on failure. */
export async function sendFeedbackAdminEmail(params: {
  feedbackId: string;
  reporterName: string;
  reporterEmail: string;
  message: string;
  userId: string | null;
}): Promise<void> {
  const from = process.env.SMTP_FROM ?? 'JLPT Trainer <noreply@localhost>';
  const recipients = parseFeedbackAdminRecipients();

  const textBody = [
    `New feedback submission`,
    `ID: ${params.feedbackId}`,
    `From: ${params.reporterName} <${params.reporterEmail}>`,
    params.userId ? `User ID: ${params.userId}` : 'User ID: (anonymous / not logged in)',
    '',
    'Message:',
    params.message,
  ].join('\n');

  const htmlBody = `
    <h2>📩 New Feedback Received</h2>
    <p><strong>ID:</strong> ${escapeHtml(params.feedbackId)}</p>
    <p><strong>From:</strong> ${escapeHtml(params.reporterName)} &lt;${escapeHtml(params.reporterEmail)}&gt;</p>
    <p><strong>User ID:</strong> ${params.userId ? escapeHtml(params.userId) : '(anonymous / not logged in)'}</p>
    <h3>Message</h3>
    <pre style="white-space:pre-wrap;font-family:sans-serif;">${escapeHtml(params.message)}</pre>
  `;

  const subject = `[Harumi JLPT] Feedback`;

  if (recipients.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.info('\n[feedback] FEEDBACK_NOTIFY_EMAIL not set — admin notification (dev dump):');
      console.info(textBody);
      console.info('');
    } else {
      console.warn(
        '[feedback] FEEDBACK_NOTIFY_EMAIL is not set; admins were not emailed. Feedback id:',
        params.feedbackId
      );
    }
    return;
  }

  const transport = createTransport();
  if (!transport) {
    console.error(
      '[feedback] SMTP not configured; cannot email admins. Feedback id:',
      params.feedbackId
    );
    if (process.env.NODE_ENV === 'development') {
      console.info(textBody);
    }
    return;
  }

  try {
    await transport.sendMail({
      from,
      to: recipients,
      subject,
      text: textBody,
      html: htmlBody,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[feedback] Admin notification sendMail failed:', message);
  }
}

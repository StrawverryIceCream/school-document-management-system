import nodemailer, { type Transporter } from "nodemailer";

interface SendOtpResult {
  delivered: boolean;
  devMode: boolean;
}

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

let cachedTransporter: Transporter | null = null;

function getSharedTransporter(
  host: string,
  port: number,
  user: string,
  pass: string,
): Transporter {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return cachedTransporter;
}

async function dispatchEmail(payload: EmailPayload): Promise<SendOtpResult> {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const defaultFrom = "ARCH Support <noreply@arch.edu>";
  const from = process.env.EMAIL_FROM || defaultFrom;

  // 1. Resend HTTPS API (Port 443 - works everywhere, immune to cloud host SMTP port blocking)
  if (resendApiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from.includes("<") ? from : `ARCH Support <${from}>`,
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      throw new Error(`Resend email delivery failed (${res.status}): ${err}`);
    }

    return { delivered: true, devMode: false };
  }

  // 2. SMTP Transport (fallback for local dev or unblocked servers)
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  // Development / test fallback when neither Resend nor SMTP is configured
  if (!host || !user || !pass) {
    console.log("\n========================================================");
    console.log(`[EMAIL SERVICE - DEV MODE]`);
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(payload.text);
    console.log("========================================================\n");
    return { delivered: false, devMode: true };
  }

  const transporter = getSharedTransporter(host, port, user, pass);
  await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  return { delivered: true, devMode: false };
}

export async function sendOtpEmail(
  email: string,
  otp: string,
): Promise<SendOtpResult> {
  return dispatchEmail({
    to: email,
    subject: `Your ARCH Account Verification Code: ${otp}`,
    text: `Your verification code is ${otp}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">ARCH Account Verification</h2>
        <p style="color: #475569; font-size: 15px;">Use the verification code below to complete your registration:</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 12px 24px; background: #f1f5f9; border-radius: 6px; color: #0f172a; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you did not attempt to register, please ignore this message.</p>
      </div>
    `,
  });
}

interface StatusEmailDetails {
  releaseDate?: string | null;
  remarks?: string | null;
  releasePdfUrl?: string | null;
}

export async function sendStatusNotificationEmail(
  email: string,
  recipientName: string,
  documentName: string,
  referenceNumber: string,
  status: string,
  details?: StatusEmailDetails,
): Promise<SendOtpResult> {
  const statusTitle =
    status === "ready"
      ? "Your Document is Ready for Pickup"
      : status === "processing"
        ? "Your Request is Being Processed"
        : status === "claimed"
          ? "Document Marked as Claimed"
          : `Request Status Update: ${status.replace("_", " ").toUpperCase()}`;

  const releaseInfo = details?.releaseDate
    ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Pickup Date:</strong> ${details.releaseDate}</p>`
    : "";

  const downloadButton = details?.releasePdfUrl
    ? `<div style="margin: 20px 0;"><a href="${details.releasePdfUrl}" target="_blank" rel="noopener noreferrer" style="background: #8a1e2b; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Download Official PDF</a></div>`
    : "";

  return dispatchEmail({
    to: email,
    subject: `ARCH: ${statusTitle} (${referenceNumber})`,
    text: `Hello ${recipientName},\n\nYour request for ${documentName} (${referenceNumber}) is now ${status}.${details?.releaseDate ? `\nPickup Date: ${details.releaseDate}` : ""}${details?.releasePdfUrl ? `\nDownload URL: ${details.releasePdfUrl}` : ""}\n\nPlease check your student portal for more details.`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">${statusTitle}</h2>
        <p style="color: #475569; font-size: 15px;">Hello <strong>${recipientName}</strong>,</p>
        <p style="color: #475569; font-size: 15px;">Your document request has been updated:</p>
        <div style="background: #f8fafc; border-left: 4px solid #8a1e2b; padding: 12px 16px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Document:</strong> ${documentName}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Reference No:</strong> ${referenceNumber}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> <span style="text-transform: capitalize; color: #8a1e2b; font-weight: bold;">${status.replace("_", " ")}</span></p>
          ${releaseInfo}
        </div>
        ${downloadButton}
        <p style="color: #64748b; font-size: 13px; margin-top: 24px;">Log in to your ARCH Portal to view request details or receipts.</p>
      </div>
    `,
  });
}

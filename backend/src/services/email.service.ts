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

export function parseSender(from: string): { name: string; email: string } {
  const match = from.match(/^(?:["']?([^"']*)["']?\s+)?<?([^>]+)>?$/);
  if (match && match[2]) {
    return {
      name: (match[1] || "ARCH Support").trim(),
      email: match[2].trim(),
    };
  }
  return { name: "ARCH Support", email: from.trim() };
}

async function dispatchEmail(payload: EmailPayload): Promise<SendOtpResult> {
  const brevoApiKey = process.env.BREVO_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "ARCH Support <noreply@arch.edu>";

  // Development / test fallback when BREVO_API_KEY is not configured
  if (!brevoApiKey) {
    console.log("\n========================================================");
    console.log(`[EMAIL SERVICE - DEV MODE]`);
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(payload.text);
    console.log("========================================================\n");
    return { delivered: false, devMode: true };
  }

  // Brevo HTTPS API (Port 443 - supports personal @gmail.com senders with no custom domain required)
  const sender = parseSender(from);
  console.log(`[EMAIL SERVICE] Dispatching via Brevo to ${payload.to} (from: ${sender.email})`);

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoApiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: payload.to }],
      subject: payload.subject,
      textContent: payload.text,
      htmlContent: payload.html,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Brevo email delivery failed (${res.status}): ${err}`);
  }

  console.log(`[EMAIL SERVICE] Brevo successfully accepted email for ${payload.to}`);
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

export async function sendLoginOtpEmail(
  email: string,
  otp: string,
): Promise<SendOtpResult> {
  return dispatchEmail({
    to: email,
    subject: `Your ARCH Sign-In Verification Code: ${otp}`,
    text: `Your ARCH sign-in verification code is ${otp}. It expires in 10 minutes. If you did not try to sign in, please reset your password immediately.`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">ARCH Two-Factor Verification</h2>
        <p style="color: #475569; font-size: 15px;">Enter this 6-digit verification code to complete your sign-in:</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 12px 24px; background: #f1f5f9; border-radius: 6px; color: #0f172a; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you did not attempt to sign in, consider changing your password.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetOtpEmail(
  email: string,
  otp: string,
): Promise<SendOtpResult> {
  return dispatchEmail({
    to: email,
    subject: `Your ARCH Password Reset Code: ${otp}`,
    text: `Your password recovery code is ${otp}. It expires in 10 minutes. If you did not request a password reset, please secure your account immediately.`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">ARCH Password Recovery</h2>
        <p style="color: #475569; font-size: 15px;">You requested a password reset for your ARCH account. Use the 6-digit verification code below:</p>
        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 12px 24px; background: #f1f5f9; border-radius: 6px; color: #0f172a; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you did not request this password reset, please ignore this message.</p>
      </div>
    `,
  });
}

export async function sendPaymentProofUploadedEmail(
  email: string,
  recipientName: string,
  documentName: string,
  referenceNumber: string,
): Promise<SendOtpResult> {
  const safeName = escapeHtml(recipientName);
  const safeDoc = escapeHtml(documentName);
  const safeRef = escapeHtml(referenceNumber);

  return dispatchEmail({
    to: email,
    subject: `ARCH: Payment proof received (${referenceNumber})`,
    text: `Hello ${recipientName},\n\nWe received your payment proof for ${documentName} (${referenceNumber}). It is pending staff verification. This email confirms the proof upload only; your payment has not yet been verified. We will notify you after staff review.`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">Payment Proof Received</h2>
        <p style="color: #475569; font-size: 15px;">Hello <strong>${safeName}</strong>,</p>
        <p style="color: #475569; font-size: 15px;">We received your payment proof for the following request:</p>
        <div style="background: #f8fafc; border-left: 4px solid #8a1e2b; padding: 12px 16px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Document:</strong> ${safeDoc}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Reference No:</strong> ${safeRef}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> Pending staff verification</p>
        </div>
        <p style="color: #64748b; font-size: 13px;">This email confirms the proof upload only; your payment has not yet been verified. We will notify you after staff review.</p>
      </div>
    `,
  });
}

interface StatusEmailDetails {
  releaseDate?: string | null;
  remarks?: string | null;
  releasePdfUrl?: string | null;
  resubmissionAllowed?: boolean;
  missedRequirements?: Array<{ label: string; type: string }>;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendStatusNotificationEmail(
  email: string,
  recipientName: string,
  documentName: string,
  referenceNumber: string,
  status: string,
  details?: StatusEmailDetails,
): Promise<SendOtpResult> {
  const safeName = escapeHtml(recipientName);
  const safeDoc = escapeHtml(documentName);
  const safeRef = escapeHtml(referenceNumber);

  const statusTitle =
    status === "ready"
      ? "Your Document is Ready for Pickup"
      : status === "processing"
        ? "Your Request is Being Processed"
        : status === "claimed"
          ? "Document Marked as Claimed"
          : status === "rejected"
            ? "Request Rejected"
            : `Request Status Update: ${status.replace("_", " ").toUpperCase()}`;

  const releaseInfo = details?.releaseDate
    ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Pickup Date:</strong> ${escapeHtml(details.releaseDate)}</p>`
    : "";

  const rejectionTextBlock =
    status === "rejected" && details?.remarks
      ? `\nRejection Reason: ${details.remarks}`
      : "";

  const rejectionHtmlBlock =
    status === "rejected" && details?.remarks
      ? `<div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 16px 0;"><p style="margin: 0; font-size: 14px; color: #991b1b;"><strong>Rejection Reason:</strong> ${escapeHtml(details.remarks)}</p></div>`
      : "";

  const missedItems =
    status === "rejected" && details?.resubmissionAllowed
      ? (details.missedRequirements ?? [])
      : [];

  const missedTextBlock =
    missedItems.length > 0
      ? `\n\nMissed Requirements to Resubmit:\n${missedItems.map((m) => `- ${m.label}`).join("\n")}\n\nOpen My Requests and click "Fix & Resubmit" to submit these items.`
      : "";

  const missedHtmlBlock =
    missedItems.length > 0
      ? `<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px 16px; margin: 16px 0;"><p style="margin: 0 0 8px 0; font-size: 14px; color: #92400e;"><strong>Missed Requirements (Resubmission Allowed):</strong></p><ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #78350f;">${missedItems.map((m) => `<li>${escapeHtml(m.label)}</li>`).join("")}</ul><p style="margin: 8px 0 0 0; font-size: 13px; color: #92400e;">Open <strong>My Requests</strong> and click <strong>Fix &amp; Resubmit</strong> to complete these items.</p></div>`
      : "";

  const downloadButton = details?.releasePdfUrl
    ? `<div style="margin: 20px 0;"><a href="${escapeHtml(details.releasePdfUrl)}" target="_blank" rel="noopener noreferrer" style="background: #8a1e2b; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Download Official PDF</a></div>`
    : "";

  return dispatchEmail({
    to: email,
    subject: `ARCH: ${statusTitle} (${referenceNumber})`,
    text: `Hello ${recipientName},\n\nYour request for ${documentName} (${referenceNumber}) is now ${status}.${details?.releaseDate ? `\nPickup Date: ${details.releaseDate}` : ""}${rejectionTextBlock}${missedTextBlock}${details?.releasePdfUrl ? `\nDownload URL: ${details.releasePdfUrl}` : ""}\n\nPlease check your ARCH portal for more details.`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">${statusTitle}</h2>
        <p style="color: #475569; font-size: 15px;">Hello <strong>${safeName}</strong>,</p>
        <p style="color: #475569; font-size: 15px;">Your document request has been updated:</p>
        <div style="background: #f8fafc; border-left: 4px solid #8a1e2b; padding: 12px 16px; margin: 16px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Document:</strong> ${safeDoc}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Reference No:</strong> ${safeRef}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Status:</strong> <span style="text-transform: capitalize; color: #8a1e2b; font-weight: bold;">${escapeHtml(status.replace("_", " "))}</span></p>
          ${releaseInfo}
        </div>
        ${rejectionHtmlBlock}
        ${missedHtmlBlock}
        ${downloadButton}
        <p style="color: #64748b; font-size: 13px; margin-top: 24px;">Log in to your ARCH Portal to view request details or receipts.</p>
      </div>
    `,
  });
}

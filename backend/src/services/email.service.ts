import nodemailer from "nodemailer";

interface SendOtpResult {
  delivered: boolean;
  devMode: boolean;
}

export async function sendOtpEmail(
  email: string,
  otp: string,
): Promise<SendOtpResult> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  const from = process.env.EMAIL_FROM || "ARCH Support <noreply@arch.edu>";

  // Development / test fallback when SMTP is not configured
  if (!host || !user || !pass) {
    console.log("\n========================================================");
    console.log(`[EMAIL SERVICE - DEV MODE]`);
    console.log(`To: ${email}`);
    console.log(`Your ARCH Verification OTP: ${otp}`);
    console.log(`Valid for 10 minutes.`);
    console.log("========================================================\n");
    return { delivered: false, devMode: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
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

  return { delivered: true, devMode: false };
}

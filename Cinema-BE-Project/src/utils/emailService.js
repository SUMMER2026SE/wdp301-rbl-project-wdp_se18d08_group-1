const nodemailer = require("nodemailer");

function hasMailConfig() {
  return Boolean(process.env.MAIL_USER && process.env.MAIL_PASSWORD);
}

let transporter = null;

function getTransporter() {
  if (!hasMailConfig()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: String(process.env.MAIL_PASSWORD).replace(/\s+/g, ""),
      },
    });
  }
  return transporter;
}

/**
 * Gửi OTP xác thực email. Nếu chưa cấu hình SMTP → chỉ log console.
 */
async function sendVerifyEmailOtp(to, otp, fullName) {
  const name = fullName || "bạn";
  const t = getTransporter();

  if (!t) {
    console.log(`[EMAIL chưa cấu hình] OTP cho ${to}: ${otp}`);
    return;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #E50914;">Cinema Ticket</h1>
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Mã xác thực email của bạn:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #E50914;">${otp}</p>
      <p style="color: #666; font-size: 13px;">Có hiệu lực trong <strong>15 phút</strong>. Không chia sẻ mã này.</p>
    </div>
  `;

  await t.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "Cinema"}" <${process.env.MAIL_USER}>`,
    to,
    subject: "Mã xác thực email - Cinema Ticket",
    text: `Mã OTP của bạn: ${otp} (hiệu lực 15 phút)`,
    html: htmlContent,
  });
  console.log(`[EMAIL] Đã gửi OTP tới ${to}`);
}

module.exports = { sendVerifyEmailOtp, hasMailConfig };

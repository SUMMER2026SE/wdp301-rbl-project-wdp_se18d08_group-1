const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});

/**
 * Gửi email OTP reset mật khẩu.
 * @param {string} to - Email người nhận
 * @param {string} otp - Mã OTP 6 số
 */
async function sendResetPasswordEmail(to, otp) {
    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USER}>`,
        to,
        subject: "Cinema - Mã xác nhận đặt lại mật khẩu",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px 24px; background: #f9f9f9; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #E50914; font-size: 28px; margin: 0;">🎬 Cinema</h1>
                </div>
                <div style="background: #fff; border-radius: 8px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <h2 style="color: #222; margin: 0 0 16px; font-size: 20px;">Đặt lại mật khẩu</h2>
                    <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
                        Xin chào! Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${to}</strong>.
                        Dưới đây là mã xác nhận của bạn:
                    </p>
                    <div style="text-align: center; background: #fff3f4; border: 2px dashed #E50914; border-radius: 8px; padding: 20px; margin: 0 0 20px;">
                        <span style="font-size: 36px; font-weight: 700; color: #E50914; letter-spacing: 8px;">${otp}</span>
                    </div>
                    <p style="color: #888; font-size: 13px; margin: 0;">
                        ⏱ Mã có hiệu lực trong <strong>15 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.
                    </p>
                </div>
                <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 20px;">
                    Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
                </p>
            </div>
        `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Reset OTP sent to ${to}, messageId: ${info.messageId}`);
    return info;
}

module.exports = { sendResetPasswordEmail };
